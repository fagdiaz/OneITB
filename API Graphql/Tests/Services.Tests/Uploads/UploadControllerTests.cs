using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using OneItb.Controllers;
using OneItb.GraphQL.Services.Storage;
using Xunit;

namespace Services.Tests.Uploads;

public sealed class UploadControllerTests
{
    [Fact]
    public async Task Upload_DoesNotInvokeStorage_WhenContentInspectionFails()
    {
        var storage = new Mock<IFileStorageService>(MockBehavior.Strict);
        var inspector = new Mock<IFileContentInspector>(MockBehavior.Strict);
        IFormFile file = CreateFile("%PDF-not-really"u8.ToArray(), "material.pdf", "application/pdf");
        inspector
            .Setup(service => service.InspectAsync(file, ".pdf", It.IsAny<CancellationToken>()))
            .ReturnsAsync(FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH"));
        var controller = CreateController(storage.Object, inspector.Object);

        IActionResult result = await controller.Upload(file, CancellationToken.None);

        Assert.IsType<BadRequestObjectResult>(result);
        storage.Verify(
            service => service.SaveAsync(
                It.IsAny<IFormFile>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Upload_InvokesStorageAfterSuccessfulInspection()
    {
        var storage = new Mock<IFileStorageService>(MockBehavior.Strict);
        var inspector = new Mock<IFileContentInspector>(MockBehavior.Strict);
        IFormFile file = CreateFile("%PDF-1.4\n%%EOF"u8.ToArray(), "material.pdf", "application/pdf");
        inspector
            .Setup(service => service.InspectAsync(file, ".pdf", It.IsAny<CancellationToken>()))
            .ReturnsAsync(FileInspectionResult.Valid(DetectedFileFormat.Pdf));
        storage
            .Setup(service => service.SaveAsync(file, ".pdf", It.IsAny<CancellationToken>()))
            .ReturnsAsync("/uploads/material.pdf");
        var controller = CreateController(storage.Object, inspector.Object);

        IActionResult result = await controller.Upload(file, CancellationToken.None);

        OkObjectResult ok = Assert.IsType<OkObjectResult>(result);
        object? storageMode = ok.Value?.GetType().GetProperty("storageMode")?.GetValue(ok.Value);
        Assert.Equal(FileStorageRuntimeInfo.LocalMode, storageMode);
        storage.VerifyAll();
        inspector.VerifyAll();
    }

    [Fact]
    public async Task Upload_ReturnsControlledUnavailable_WhenStorageFails()
    {
        var storage = new Mock<IFileStorageService>(MockBehavior.Strict);
        var inspector = new Mock<IFileContentInspector>(MockBehavior.Strict);
        IFormFile file = CreateFile("%PDF-1.4\n%%EOF"u8.ToArray(), "material.pdf", "application/pdf");
        inspector
            .Setup(service => service.InspectAsync(file, ".pdf", It.IsAny<CancellationToken>()))
            .ReturnsAsync(FileInspectionResult.Valid(DetectedFileFormat.Pdf));
        storage
            .Setup(service => service.SaveAsync(file, ".pdf", It.IsAny<CancellationToken>()))
            .ThrowsAsync(new IOException("provider unavailable"));
        UploadController controller = CreateController(storage.Object, inspector.Object);
        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { TraceIdentifier = "test-correlation" }
        };

        IActionResult result = await controller.Upload(file, CancellationToken.None);

        ObjectResult unavailable = Assert.IsType<ObjectResult>(result);
        Assert.Equal(StatusCodes.Status503ServiceUnavailable, unavailable.StatusCode);
        Assert.Equal(
            "UPLOAD_STORAGE_UNAVAILABLE",
            unavailable.Value?.GetType().GetProperty("code")?.GetValue(unavailable.Value));
    }

    private static UploadController CreateController(
        IFileStorageService storage,
        IFileContentInspector inspector)
    {
        return new UploadController(
            storage,
            inspector,
            new FileStorageRuntimeInfo(FileStorageRuntimeInfo.LocalMode),
            Mock.Of<ILogger<UploadController>>());
    }

    private static IFormFile CreateFile(byte[] content, string fileName, string contentType)
    {
        var stream = new MemoryStream(content, writable: false);
        return new FormFile(stream, 0, content.Length, "file", fileName)
        {
            Headers = new HeaderDictionary(),
            ContentType = contentType
        };
    }
}
