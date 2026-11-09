using System;
using System.Collections.Generic;
using System.IO;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using OneItb.Controllers;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Messaging;
using Services.Repositories;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Messaging
{
    public sealed class PrivateMessageAttachmentTests
    {
        [Fact]
        public async Task SendPrivateMessage_EmptyMessage_WithoutAttachments_ThrowsArgumentException()
        {
            using var context = ServiceTestData.CreateContext();
            await ServiceTestData.SeedAcademicGraphAsync(context);
            var service = CreateService(context);

            await Assert.ThrowsAsync<ArgumentException>(() =>
                service.SendPrivateMessageAsync(
                    ServiceTestData.StudentUserId,
                    ServiceTestData.TeacherUserId,
                    Guid.NewGuid(),
                    "   ",
                    Array.Empty<Guid>(),
                    CancellationToken.None));
        }

        [Fact]
        public async Task SendPrivateMessage_WithOnlyAttachments_Succeeds()
        {
            using var context = ServiceTestData.CreateContext();
            await ServiceTestData.SeedAcademicGraphAsync(context);
            var service = CreateService(context);

            var upload = new PrivateUpload
            {
                Id = Guid.NewGuid(),
                OwnerId = ServiceTestData.StudentUserId,
                StorageKey = "path/to/file.pdf",
                FileName = "tp1.pdf",
                ContentType = "application/pdf",
                ByteSize = 1024,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(2),
                IsConsumed = false
            };
            context.PrivateUploads.Add(upload);
            await context.SaveChangesAsync();

            var message = await service.SendPrivateMessageAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.TeacherUserId,
                Guid.NewGuid(),
                null,
                new[] { upload.Id },
                CancellationToken.None);

            Assert.NotNull(message);
            Assert.Equal(string.Empty, message.Content);
            Assert.Single(message.Attachments);
            Assert.Equal("tp1.pdf", message.Attachments.First().FileName);

            var persistedUpload = await context.PrivateUploads.FindAsync(upload.Id);
            Assert.True(persistedUpload!.IsConsumed);
        }

        [Fact]
        public async Task SendPrivateMessage_UploadOfAnotherUser_ThrowsArgumentException()
        {
            using var context = ServiceTestData.CreateContext();
            await ServiceTestData.SeedAcademicGraphAsync(context);
            var service = CreateService(context);

            var uploadOfOther = new PrivateUpload
            {
                Id = Guid.NewGuid(),
                OwnerId = ServiceTestData.OtherStudentUserId,
                StorageKey = "path/to/other.png",
                FileName = "other.png",
                ContentType = "image/png",
                ByteSize = 2048,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(2),
                IsConsumed = false
            };
            context.PrivateUploads.Add(uploadOfOther);
            await context.SaveChangesAsync();

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                service.SendPrivateMessageAsync(
                    ServiceTestData.StudentUserId,
                    ServiceTestData.TeacherUserId,
                    Guid.NewGuid(),
                    "Mensaje con adjunto ajeno",
                    new[] { uploadOfOther.Id },
                    CancellationToken.None));

            Assert.Contains("no pertenece", ex.Message, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task SendPrivateMessage_ExpiredUpload_ThrowsArgumentException()
        {
            using var context = ServiceTestData.CreateContext();
            await ServiceTestData.SeedAcademicGraphAsync(context);
            var service = CreateService(context);

            var expiredUpload = new PrivateUpload
            {
                Id = Guid.NewGuid(),
                OwnerId = ServiceTestData.StudentUserId,
                StorageKey = "path/to/expired.pdf",
                FileName = "expired.pdf",
                ContentType = "application/pdf",
                ByteSize = 1024,
                ExpiresAtUtc = DateTime.UtcNow.AddMinutes(-5),
                IsConsumed = false
            };
            context.PrivateUploads.Add(expiredUpload);
            await context.SaveChangesAsync();

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                service.SendPrivateMessageAsync(
                    ServiceTestData.StudentUserId,
                    ServiceTestData.TeacherUserId,
                    Guid.NewGuid(),
                    "Adjunto caducado",
                    new[] { expiredUpload.Id },
                    CancellationToken.None));

            Assert.Contains("caducado", ex.Message, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task SendPrivateMessage_AlreadyConsumedUpload_ThrowsArgumentException()
        {
            using var context = ServiceTestData.CreateContext();
            await ServiceTestData.SeedAcademicGraphAsync(context);
            var service = CreateService(context);

            var consumedUpload = new PrivateUpload
            {
                Id = Guid.NewGuid(),
                OwnerId = ServiceTestData.StudentUserId,
                StorageKey = "path/to/used.pdf",
                FileName = "used.pdf",
                ContentType = "application/pdf",
                ByteSize = 1024,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(2),
                IsConsumed = true
            };
            context.PrivateUploads.Add(consumedUpload);
            await context.SaveChangesAsync();

            var ex = await Assert.ThrowsAsync<ArgumentException>(() =>
                service.SendPrivateMessageAsync(
                    ServiceTestData.StudentUserId,
                    ServiceTestData.TeacherUserId,
                    Guid.NewGuid(),
                    "Adjunto ya consumido",
                    new[] { consumedUpload.Id },
                    CancellationToken.None));

            Assert.Contains("ya ha sido utilizado", ex.Message, StringComparison.OrdinalIgnoreCase);
        }

        [Fact]
        public async Task SendPrivateMessage_Idempotency_SameClientMessageId_ReturnsExistingWithoutDuplicating()
        {
            using var context = ServiceTestData.CreateContext();
            await ServiceTestData.SeedAcademicGraphAsync(context);
            var service = CreateService(context);

            var upload = new PrivateUpload
            {
                Id = Guid.NewGuid(),
                OwnerId = ServiceTestData.StudentUserId,
                StorageKey = "path/to/idempotent.png",
                FileName = "idempotent.png",
                ContentType = "image/png",
                ByteSize = 1024,
                ExpiresAtUtc = DateTime.UtcNow.AddHours(2),
                IsConsumed = false
            };
            context.PrivateUploads.Add(upload);
            await context.SaveChangesAsync();

            var clientMessageId = Guid.NewGuid();

            var first = await service.SendPrivateMessageAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.TeacherUserId,
                clientMessageId,
                "Primer envio",
                new[] { upload.Id },
                CancellationToken.None);

            var second = await service.SendPrivateMessageAsync(
                ServiceTestData.StudentUserId,
                ServiceTestData.TeacherUserId,
                clientMessageId,
                "Primer envio",
                new[] { upload.Id },
                CancellationToken.None);

            Assert.Equal(first.Id, second.Id);
            Assert.Equal(1, await context.Messages.CountAsync(m => m.ClientMessageId == clientMessageId));
            Assert.Equal(1, await context.MessageAttachments.CountAsync(a => a.MessageId == first.Id));
        }

        [Fact]
        public async Task DownloadAttachment_ParticipantCanDownload_NonParticipantIsForbidden()
        {
            using var context = ServiceTestData.CreateContext();
            await ServiceTestData.SeedAcademicGraphAsync(context);

            string tempFile = Path.GetTempFileName();
            await File.WriteAllTextAsync(tempFile, "Contenido privado de prueba");

            try
            {
                var upload = new PrivateUpload
                {
                    Id = Guid.NewGuid(),
                    OwnerId = ServiceTestData.StudentUserId,
                    StorageKey = tempFile,
                    FileName = "documento.pdf",
                    ContentType = "application/pdf",
                    ByteSize = 25,
                    ExpiresAtUtc = DateTime.UtcNow.AddHours(2),
                    IsConsumed = true
                };

                var message = new Message
                {
                    Id = Guid.NewGuid(),
                    SenderId = ServiceTestData.StudentUserId,
                    ReceiverId = ServiceTestData.TeacherUserId,
                    Content = "Adjunto de entrega",
                    SentAt = DateTime.UtcNow
                };

                var attachment = new MessageAttachment
                {
                    Id = Guid.NewGuid(),
                    MessageId = message.Id,
                    UploadId = upload.Id,
                    OrderIndex = 0,
                    FileName = "documento.pdf",
                    ContentType = "application/pdf",
                    ByteSize = 25,
                    Message = message,
                    Upload = upload
                };

                context.PrivateUploads.Add(upload);
                context.Messages.Add(message);
                context.MessageAttachments.Add(attachment);
                await context.SaveChangesAsync();

                var controller = new MessageAttachmentsController(
                    context,
                    NullLogger<MessageAttachmentsController>.Instance);

                // 1. Participante (Remitente / StudentUserId) -> OK 200
                controller.ControllerContext = CreateControllerContext(ServiceTestData.StudentUserId);
                var senderResult = await controller.Download(attachment.Id, CancellationToken.None);
                var fileResult = Assert.IsType<FileStreamResult>(senderResult);
                Assert.Equal("application/pdf", fileResult.ContentType);
                Assert.Equal("documento.pdf", fileResult.FileDownloadName);
                Assert.True(fileResult.EnableRangeProcessing);
                Assert.Equal("private, no-store, no-cache", controller.Response.Headers["Cache-Control"].ToString());
                fileResult.FileStream.Dispose();

                // 2. Participante (Receptor / TeacherUserId) -> OK 200
                controller.ControllerContext = CreateControllerContext(ServiceTestData.TeacherUserId);
                var receiverResult = await controller.Download(attachment.Id, CancellationToken.None);
                var receiverFileResult = Assert.IsType<FileStreamResult>(receiverResult);
                receiverFileResult.FileStream.Dispose();

                // 3. Tercero no participante (OtherStudentUserId) -> ForbidResult (403)
                controller.ControllerContext = CreateControllerContext(ServiceTestData.OtherStudentUserId);
                var thirdPartyResult = await controller.Download(attachment.Id, CancellationToken.None);
                Assert.IsType<ForbidResult>(thirdPartyResult);

                // 4. Adjunto no existente -> NotFoundResult (404)
                var notFoundResult = await controller.Download(Guid.NewGuid(), CancellationToken.None);
                Assert.IsType<NotFoundResult>(notFoundResult);
            }
            finally
            {
                if (File.Exists(tempFile))
                {
                    try { File.Delete(tempFile); } catch { /* ignore */ }
                }
            }
        }

        private static MessagingService CreateService(OneItbContext context)
        {
            var unitOfWork = new UnitOfWork(context);
            return new MessagingService(
                context,
                unitOfWork,
                NullLogger<MessagingService>.Instance);
        }

        private static ControllerContext CreateControllerContext(Guid userId)
        {
            var identity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString())
            }, "TestAuth");

            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(identity)
                }
            };
        }
    }
}
