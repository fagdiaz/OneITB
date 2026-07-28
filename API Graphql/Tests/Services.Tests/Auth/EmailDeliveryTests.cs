using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using OneItb.GraphQL.Services.Email;
using Xunit;

namespace Services.Tests.Auth;

public sealed class EmailDeliveryTests
{
    [Fact]
    public void DevelopmentWithoutSmtp_UsesPickupInsideContentRoot()
    {
        string contentRoot = CreateContentRoot();
        try
        {
            IConfiguration configuration = new ConfigurationBuilder().Build();
            IHostEnvironment environment = CreateEnvironment(
                Environments.Development,
                contentRoot);

            EmailDeliveryConfiguration delivery =
                EmailDeliveryConfiguration.FromConfiguration(
                    configuration,
                    environment);

            Assert.False(delivery.UsesSmtp);
            Assert.StartsWith(
                Path.GetFullPath(contentRoot),
                delivery.PickupDirectory!,
                StringComparison.OrdinalIgnoreCase);
        }
        finally
        {
            Directory.Delete(contentRoot, recursive: true);
        }
    }

    [Fact]
    public void ProductionWithoutSmtp_FailsClosed()
    {
        IConfiguration configuration = new ConfigurationBuilder().Build();
        IHostEnvironment environment = CreateEnvironment(
            Environments.Production,
            CreateContentRoot());

        try
        {
            Assert.Throws<InvalidOperationException>(
                () => EmailDeliveryConfiguration.FromConfiguration(
                    configuration,
                    environment));
        }
        finally
        {
            Directory.Delete(environment.ContentRootPath, recursive: true);
        }
    }

    [Fact]
    public async Task PickupSender_WritesMessageToIgnoredLocalArtifact()
    {
        string contentRoot = CreateContentRoot();
        string pickupDirectory = Path.Combine(contentRoot, "App_Data", "MailDrop");
        try
        {
            var sender = new PickupDirectoryEmailService(
                pickupDirectory,
                NullLogger<PickupDirectoryEmailService>.Instance);

            await sender.SendAsync(
                "employer@itbeltran.com.ar",
                "Acceso temporal",
                "https://frontend.oneitb.test/employer-login#token=credential");

            string mailFile = Assert.Single(Directory.GetFiles(pickupDirectory, "*.eml"));
            string contents = await File.ReadAllTextAsync(mailFile);
            Assert.Contains("To: employer@itbeltran.com.ar", contents);
            Assert.Contains("#token=credential", contents);
        }
        finally
        {
            Directory.Delete(contentRoot, recursive: true);
        }
    }

    private static IHostEnvironment CreateEnvironment(
        string environmentName,
        string contentRoot)
    {
        var environment = new Mock<IHostEnvironment>();
        environment.SetupGet(item => item.EnvironmentName).Returns(environmentName);
        environment.SetupGet(item => item.ContentRootPath).Returns(contentRoot);
        return environment.Object;
    }

    private static string CreateContentRoot()
    {
        string path = Path.Combine(
            Path.GetTempPath(),
            $"oneitb-email-tests-{Guid.NewGuid():N}");
        Directory.CreateDirectory(path);
        return path;
    }
}
