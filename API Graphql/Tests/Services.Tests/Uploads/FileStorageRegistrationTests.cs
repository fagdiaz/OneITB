using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using OneItb.GraphQL.Services.Storage;
using Xunit;

namespace Services.Tests.Uploads;

public sealed class FileStorageRegistrationTests
{
    [Fact]
    public void AddOneItbFileStorage_UsesLocalMode_WhenCloudinaryIsAbsent()
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration(null);

        FileStorageRuntimeInfo mode = services.AddOneItbFileStorage(configuration);

        Assert.Equal(FileStorageRuntimeInfo.LocalMode, mode.Mode);
        ServiceDescriptor descriptor = Assert.Single(
            services,
            item => item.ServiceType == typeof(IFileStorageService));
        Assert.Equal(typeof(LocalFileStorageService), descriptor.ImplementationType);
        Assert.Contains(services, item =>
            item.ServiceType == typeof(FileStorageRuntimeInfo) &&
            ReferenceEquals(item.ImplementationInstance, mode));
    }

    [Fact]
    public void AddOneItbFileStorage_UsesCloudinaryMode_WhenConfigurationIsComplete()
    {
        var services = new ServiceCollection();
        IConfiguration configuration = BuildConfiguration("cloudinary://key:value@demo-cloud");

        FileStorageRuntimeInfo mode = services.AddOneItbFileStorage(configuration);

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
        IConfiguration configuration = BuildConfiguration(value);

        InvalidOperationException exception = Assert.Throws<InvalidOperationException>(
            () => services.AddOneItbFileStorage(configuration));

        Assert.Contains("no tiene un formato valido", exception.Message);
        Assert.DoesNotContain(value, exception.Message);
    }

    private static IConfiguration BuildConfiguration(string? cloudinaryUrl)
    {
        var values = new Dictionary<string, string?>
        {
            ["CloudinarySettings:Url"] = cloudinaryUrl,
            ["CloudinarySettings:Folder"] = "oneitb23-tests"
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(values)
            .Build();
    }
}
