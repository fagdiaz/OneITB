using System.Data;
using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using OneItb.Entities.Models;
using Services.Messaging;
using Services.Repositories;
using Xunit;

namespace Services.Tests.Hardening.Gob12;

[Trait("Category", "GOB12SqlConcurrency")]
public sealed class PrivateUploadSqlRaceTests : IClassFixture<Gob12SqlFixture>
{
    private readonly Gob12SqlFixture database;
    public PrivateUploadSqlRaceTests(Gob12SqlFixture database) => this.database = database;

    private static MessagingService Service(Gob12Context context) =>
        new(context, new UnitOfWork(context), NullLogger<MessagingService>.Instance);

    private async Task<Guid> UploadAsync(PrivateBlob blob)
    {
        await using var context = database.Open();
        var upload = new PrivateUpload {
            Id = Guid.NewGuid(), OwnerId = database.Sender, StorageKey = blob.FilePath,
            FileName = "private.pdf", ContentType = "application/pdf",
            ByteSize = blob.Bytes.Length, ExpiresAtUtc = DateTime.UtcNow.AddHours(1),
        };
        context.PrivateUploads.Add(upload);
        await context.SaveChangesAsync();
        return upload.Id;
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task OneUpload_TwoClientIds_ExactlyOneAtomicWinner(bool differentRecipients)
    {
        using var blob = new PrivateBlob();
        var uploadId = await UploadAsync(blob);
        var firstId = Guid.NewGuid();
        var secondId = Guid.NewGuid();
        var gate = new Gob12TransactionGate();
        await using var first = database.Open(gate);
        await using var second = database.Open(gate);
        Assert.NotSame(first.Database.GetDbConnection(), second.Database.GetDbConnection());
        using var deadline = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        var calls = new[] {
            Task.Run(() => Gob12Outcome<Message>.Capture(() => Service(first).SendPrivateMessageAsync(
                database.Sender, database.Receiver, firstId, "first", new[] { uploadId }, deadline.Token))),
            Task.Run(() => Gob12Outcome<Message>.Capture(() => Service(second).SendPrivateMessageAsync(
                database.Sender, differentRecipients ? database.OtherReceiver : database.Receiver,
                secondId, "second", new[] { uploadId }, deadline.Token))),
        };
        var results = await Task.WhenAll(calls);
        Assert.True(gate.Arrivals >= 2, "Both independent transactions must reach the start barrier.");
        var winner = Assert.Single(results, result => result.Error == null).Value!;
        var failure = Assert.Single(results, result => result.Error != null).Error!;

        // Verify durable state using a third context after BOTH requests settled.
        await using var verification = database.Open();
        var messages = await verification.Messages.AsNoTracking()
            .Where(message => message.SenderId == database.Sender &&
                (message.ClientMessageId == firstId || message.ClientMessageId == secondId)).ToListAsync();
        Assert.Equal(winner.Id, Assert.Single(messages).Id);
        var attachments = await verification.MessageAttachments.AsNoTracking()
            .Where(attachment => attachment.UploadId == uploadId).ToListAsync();
        var attachment = Assert.Single(attachments);
        Assert.Equal(winner.Id, attachment.MessageId);
        Assert.Equal(blob.Bytes.Length, attachment.ByteSize);
        var upload = await verification.PrivateUploads.AsNoTracking().SingleAsync(row => row.Id == uploadId);
        Assert.True(upload.IsConsumed);
        Assert.Equal(blob.FilePath, upload.StorageKey);
        blob.AssertUntouched();
        var error = Assert.IsType<InvalidOperationException>(failure);
        Assert.Equal("La carga privada ya ha sido consumida", error.Message);
    }

    [Theory]
    [InlineData(false)]
    [InlineData(true)]
    public async Task SameClientMessageId_ConcurrentIdenticalCalls_ReturnTheSameOriginal(bool withUpload)
    {
        using var blob = new PrivateBlob();
        var uploads = withUpload ? new[] { await UploadAsync(blob) } : Array.Empty<Guid>();
        var clientId = Guid.NewGuid();
        var gate = new Gob12TransactionGate();
        await using var first = database.Open(gate);
        await using var second = database.Open(gate);
        using var deadline = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        async Task<Message> Send(Gob12Context context) => await Service(context).SendPrivateMessageAsync(
            database.Sender, database.Receiver, clientId, "same payload", uploads, deadline.Token);
        var results = await Task.WhenAll(
            Task.Run(() => Gob12Outcome<Message>.Capture(() => Send(first))),
            Task.Run(() => Gob12Outcome<Message>.Capture(() => Send(second))));
        Assert.True(gate.Arrivals >= 2);
        await using var verification = database.Open();
        var stored = Assert.Single(await verification.Messages.AsNoTracking()
            .Where(row => row.SenderId == database.Sender && row.ClientMessageId == clientId).ToListAsync());
        var storedAttachments = await verification.MessageAttachments.AsNoTracking()
            .Where(row => row.MessageId == stored.Id).ToListAsync();
        Assert.Equal(uploads.Length, storedAttachments.Count);
        if (withUpload)
        {
            Assert.Equal(uploads[0], Assert.Single(storedAttachments).UploadId);
            Assert.True((await verification.PrivateUploads.AsNoTracking().SingleAsync(row => row.Id == uploads[0])).IsConsumed);
            Assert.Equal(1, await verification.MessageAttachments.CountAsync(row => row.UploadId == uploads[0]));
        }
        blob.AssertUntouched();
        Assert.All(results, result => Assert.Null(result.Error));
        Assert.Equal(stored.Id, results[0].Value!.Id);
        Assert.Equal(stored.Id, results[1].Value!.Id);
        Assert.Equal("same payload", stored.Content);
        Assert.All(gate.IsolationLevels, level => Assert.Equal(IsolationLevel.Serializable, level));
    }

    [Fact]
    public async Task SqlCatalog_EnforcesFilteredIdempotencyAndUniqueAttachmentConsumption()
    {
        await using var context = database.Open();
        var messageIndexes = await context.Database.SqlQueryRaw<int>(@"
            SELECT COUNT(*) AS [Value] FROM sys.indexes i
            WHERE i.object_id = OBJECT_ID(N'dbo.Messages') AND i.is_unique = 1
              AND i.has_filter = 1 AND i.filter_definition LIKE '%ClientMessageId%IS NOT NULL%'
              AND EXISTS (SELECT 1 FROM sys.index_columns ic JOIN sys.columns c
                ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                  AND ic.key_ordinal = 1 AND c.name = N'SenderId')
              AND EXISTS (SELECT 1 FROM sys.index_columns ic JOIN sys.columns c
                ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                  AND ic.key_ordinal = 2 AND c.name = N'ClientMessageId')
              AND 2 = (SELECT COUNT(*) FROM sys.index_columns ic
                WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id AND ic.key_ordinal > 0)")
            .SingleAsync();
        Assert.Equal(1, messageIndexes);
        var attachmentIndexes = await context.Database.SqlQueryRaw<int>(@"
            SELECT COUNT(*) AS [Value] FROM sys.indexes i
            WHERE i.object_id = OBJECT_ID(N'dbo.MessageAttachments') AND i.is_unique = 1
              AND EXISTS (SELECT 1 FROM sys.index_columns ic JOIN sys.columns c
                ON c.object_id = ic.object_id AND c.column_id = ic.column_id
                WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id
                  AND ic.key_ordinal = 1 AND c.name = N'UploadId')
              AND 1 = (SELECT COUNT(*) FROM sys.index_columns ic
                WHERE ic.object_id = i.object_id AND ic.index_id = i.index_id AND ic.key_ordinal > 0)")
            .SingleAsync();
        Assert.Equal(1, attachmentIndexes);
    }

    private sealed class PrivateBlob : IDisposable
    {
        private readonly string directory = Path.Combine(Path.GetTempPath(), "OneITB-GOB12-" + Guid.NewGuid().ToString("N"));
        public byte[] Bytes { get; } = System.Text.Encoding.ASCII.GetBytes("%PDF-1.4\nGOB12 synthetic private file\n%%EOF");
        public string FilePath => Path.Combine(directory, "private.pdf");
        public PrivateBlob()
        {
            Directory.CreateDirectory(directory);
            File.WriteAllBytes(FilePath, Bytes);
        }
        public void AssertUntouched()
        {
            Assert.Equal(new[] { FilePath }, Directory.GetFiles(directory));
            Assert.Equal(SHA256.HashData(Bytes), SHA256.HashData(File.ReadAllBytes(FilePath)));
        }
        public void Dispose()
        {
            File.Delete(FilePath);
            Directory.Delete(directory);
        }
    }
}
