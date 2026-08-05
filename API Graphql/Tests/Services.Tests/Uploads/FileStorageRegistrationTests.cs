using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Moq;
using OneItb.GraphQL.Services.Storage;
using Xunit;

namespace Services.Tests.Uploads;

public sealed class FileStorageRegistrationTests
{
    [Fact]
    public void AddOneItbFileStorage_UsesExplicitLocalMode_InDevelopment()
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration(
            FileStorageRuntimeInfo.LocalMode,
            cloudinaryUrl: null);

        FileStorageRuntimeInfo mode = services.AddOneItbFileStorage(
            configuration,
            CreateEnvironment(Environments.Development));

        Assert.Equal(FileStorageRuntimeInfo.LocalMode, mode.Mode);
        ServiceDescriptor descriptor = Assert.Single(
            services,
            item => item.ServiceType == typeof(IFileStorageService));
        Assert.Equal(typeof(LocalFileStorageService), descriptor.ImplementationType);
    }

    [Fact]
    public void AddOneItbFileStorage_RejectsMissingProvider()
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration(null, null);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            services.AddOneItbFileStorage(
                configuration,
                CreateEnvironment(Environments.Development)));

        Assert.Contains("debe configurarse explicitamente", exception.Message);
    }

    [Fact]
    public void AddOneItbFileStorage_RejectsLocalMode_OutsideDevelopment()
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration(
            FileStorageRuntimeInfo.LocalMode,
            cloudinaryUrl: null);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            services.AddOneItbFileStorage(
                configuration,
                CreateEnvironment(Environments.Production)));

        Assert.Contains("solo esta permitido en Development", exception.Message);
    }

    [Fact]
    public void AddOneItbFileStorage_UsesCloudinaryMode_WhenConfigurationIsComplete()
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration(
            FileStorageRuntimeInfo.CloudinaryMode,
            "cloudinary://key:value@demo-cloud");

        FileStorageRuntimeInfo mode = services.AddOneItbFileStorage(
            configuration,
            CreateEnvironment(Environments.Production));

        Assert.Equal(FileStorageRuntimeInfo.CloudinaryMode, mode.Mode);
        Assert.Contains(services, item => item.ServiceType == typeof(IFileStorageService));
    }

    [Theory]
    [InlineData("https://example.com")]
    [InlineData("cloudinary://missing-secret@demo-cloud")]
    [InlineData("cloudinary://:@demo-cloud")]
    public void AddOneItbFileStorage_RejectsIncompleteCloudinaryConfiguration(string value)
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration(
            FileStorageRuntimeInfo.CloudinaryMode,
            value);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            services.AddOneItbFileStorage(
                configuration,
                CreateEnvironment(Environments.Production)));

        Assert.Contains("no tiene un formato valido", exception.Message);
        Assert.DoesNotContain(value, exception.Message);
    }

    [Theory]
    [InlineData("Disk")]
    [InlineData("S3")]
    public void AddOneItbFileStorage_RejectsUnknownProvider(string provider)
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration(provider, null);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            services.AddOneItbFileStorage(
                configuration,
                CreateEnvironment(Environments.Development)));

        Assert.Contains("solo admite Local o Cloudinary", exception.Message);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(121)]
    public void AddOneItbFileStorage_RejectsUnsafeCloudinaryTimeout(int timeoutSeconds)
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration(
            FileStorageRuntimeInfo.CloudinaryMode,
            "cloudinary://key:value@demo-cloud",
            timeoutSeconds);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(() =>
            services.AddOneItbFileStorage(
                configuration,
                CreateEnvironment(Environments.Production)));

        Assert.Contains("CloudinaryTimeoutSeconds", exception.Message);
    }

    private static IConfiguration BuildConfiguration(
        string? provider,
        string? cloudinaryUrl,
        int timeoutSeconds = FileStorageOptions.DefaultCloudinaryTimeoutSeconds)
    {
        var values = new Dictionary<string, string?>
        {
            ["FileStorage:Provider"] = provider,
            ["FileStorage:CloudinaryTimeoutSeconds"] = timeoutSeconds.ToString(),
            ["CloudinarySettings:Url"] = cloudinaryUrl,
            ["CloudinarySettings:Folder"] = "oneitb23-tests"
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }

    private static IHostEnvironment CreateEnvironment(string environmentName)
    {
        var environment = new Mock<IHostEnvironment>();
        environment.SetupGet(item => item.EnvironmentName).Returns(environmentName);
        return environment.Object;
    }
}
