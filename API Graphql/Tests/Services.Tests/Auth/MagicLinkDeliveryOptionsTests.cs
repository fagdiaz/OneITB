using Microsoft.Extensions.Configuration;
using Services.Auth;
using Xunit;

namespace Services.Tests.Auth;

public sealed class MagicLinkDeliveryOptionsTests
{
    [Fact]
    public void ProductionRequiresExplicitHttpsFrontendUrl()
    {
        IConfiguration missing = new ConfigurationBuilder().Build();
        IConfiguration insecure = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["MagicLink:FrontendBaseUrl"] = "http://oneitb.example.edu"
            })
            .Build();

        Assert.Throws<InvalidOperationException>(
            () => MagicLinkDeliveryOptions.FromConfiguration(
                missing,
                isProduction: true));
        Assert.Throws<InvalidOperationException>(
            () => MagicLinkDeliveryOptions.FromConfiguration(
                insecure,
                isProduction: true));
    }

    [Fact]
    public void DevelopmentUsesLocalFrontendDefault()
    {
        IConfiguration configuration = new ConfigurationBuilder().Build();

        MagicLinkDeliveryOptions options =
            MagicLinkDeliveryOptions.FromConfiguration(
                configuration,
                isProduction: false);

        Assert.Equal("http://localhost:5173", options.FrontendBaseUrl);
    }
}
