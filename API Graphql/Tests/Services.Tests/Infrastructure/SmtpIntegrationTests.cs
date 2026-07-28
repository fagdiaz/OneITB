using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.Logging.Abstractions;
using OneItb.GraphQL.Services.Email;
using Xunit;

namespace Services.Tests.Infrastructure;

public sealed class SmtpIntegrationTests
{
    [Fact]
    [Trait("Category", "Infrastructure")]
    public async Task SmtpEmailService_DeliversInspectableSafeMessagesToMailpit()
    {
        if (!InfrastructureTestEnvironment.IsEnabled)
            return;

        string host = InfrastructureTestEnvironment.Require("ONEITB_TEST_SMTP_HOST");
        int port = InfrastructureTestEnvironment.RequireInt("ONEITB_TEST_SMTP_PORT");
        string user = InfrastructureTestEnvironment.Require("ONEITB_TEST_SMTP_USER");
        string pass = InfrastructureTestEnvironment.Require("ONEITB_TEST_SMTP_PASS");
        string mailpitBaseUrl = InfrastructureTestEnvironment.Require(
            "ONEITB_TEST_MAILPIT_BASE_URL");
        string runId = Guid.NewGuid().ToString("N");
        string recipient = $"acceptance.{runId}@itbeltran.com.ar";
        string[] subjects =
        [
            $"OneITB SMTP acceptance {runId}",
            $"Postulacion revisada {runId}",
            $"Postulacion rechazada {runId}"
        ];
        string[] bodies =
        [
            "OneITB: prueba local de configuracion SMTP exitosa.",
            "Tu postulacion en OneITB fue revisada por el empleador.",
            "Tu postulacion en OneITB fue rechazada. Podes consultar nuevas ofertas."
        ];

        using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(15));
        var sender = new SmtpEmailService(
            new SmtpEmailSettings(
                host,
                port,
                user,
                pass,
                "no-reply@itbeltran.com.ar",
                EnableSsl: false),
            NullLogger<SmtpEmailService>.Instance);
        using var mailpit = new HttpClient
        {
            BaseAddress = new Uri(mailpitBaseUrl),
            Timeout = TimeSpan.FromSeconds(5)
        };
        var ownedMessageIds = new List<string>();

        try
        {
            for (int index = 0; index < subjects.Length; index++)
            {
                await sender.SendAsync(
                    recipient,
                    subjects[index],
                    bodies[index],
                    timeout.Token);
            }

            MailpitMessage[] captured = await WaitForMessagesAsync(
                mailpit,
                subjects,
                timeout.Token);
            Assert.Equal(subjects.Length, captured.Length);

            foreach (MailpitMessage message in captured)
            {
                ownedMessageIds.Add(message.Id);
                Assert.Contains(message.Subject, subjects);
                Assert.Contains(
                    message.To,
                    address => string.Equals(
                        address,
                        recipient,
                        StringComparison.OrdinalIgnoreCase));

                string body = await mailpit.GetStringAsync(
                    $"/view/{Uri.EscapeDataString(message.Id)}.txt",
                    timeout.Token);
                Assert.DoesNotContain("password", body, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("access token", body, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("connection string", body, StringComparison.OrdinalIgnoreCase);
                Assert.DoesNotContain("exception:", body, StringComparison.OrdinalIgnoreCase);
            }
        }
        finally
        {
            if (ownedMessageIds.Count > 0)
            {
                using HttpRequestMessage deleteRequest = new(
                    HttpMethod.Delete,
                    "/api/v1/messages")
                {
                    Content = JsonContent.Create(new { IDs = ownedMessageIds })
                };
                using HttpResponseMessage deleteResponse = await mailpit.SendAsync(
                    deleteRequest,
                    CancellationToken.None);
                Assert.Equal(HttpStatusCode.OK, deleteResponse.StatusCode);
            }
        }
    }

    private static async Task<MailpitMessage[]> WaitForMessagesAsync(
        HttpClient client,
        IReadOnlyCollection<string> expectedSubjects,
        CancellationToken cancellationToken)
    {
        while (true)
        {
            using HttpResponseMessage response = await client.GetAsync(
                "/api/v1/messages?start=0&limit=100",
                cancellationToken);
            response.EnsureSuccessStatusCode();
            string json = await response.Content.ReadAsStringAsync(cancellationToken);
            MailpitMessage[] messages = ParseMessages(json)
                .Where(message => expectedSubjects.Contains(message.Subject))
                .ToArray();
            if (messages.Length == expectedSubjects.Count)
                return messages;

            await Task.Delay(TimeSpan.FromMilliseconds(200), cancellationToken);
        }
    }

    private static IEnumerable<MailpitMessage> ParseMessages(string json)
    {
        using JsonDocument document = JsonDocument.Parse(json);
        foreach (JsonElement item in document.RootElement
            .GetProperty("messages")
            .EnumerateArray())
        {
            string id = item.GetProperty("ID").GetString()
                ?? throw new InvalidOperationException("Mailpit returned a message without an ID.");
            string subject = item.GetProperty("Subject").GetString() ?? string.Empty;
            string[] recipients = item
                .GetProperty("To")
                .EnumerateArray()
                .Select(address =>
                    address.GetProperty("Address").GetString() ?? string.Empty)
                .ToArray();
            yield return new MailpitMessage(id, subject, recipients);
        }
    }

    private sealed record MailpitMessage(
        string Id,
        string Subject,
        IReadOnlyList<string> To);
}
