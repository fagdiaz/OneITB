using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        var controller = new UploadController(storage.Object, inspector.Object);

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
        var controller = new UploadController(storage.Object, inspector.Object);

        IActionResult result = await controller.Upload(file, CancellationToken.None);

        Assert.IsType<OkObjectResult>(result);
        storage.VerifyAll();
        inspector.VerifyAll();
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
