using System.IO.Compression;
using Microsoft.AspNetCore.Http;
using OneItb.GraphQL.Services.Storage;
using Xunit;

namespace Services.Tests.Uploads;

public sealed class FileContentInspectorTests
{
    public static IEnumerable<object[]> ValidFiles()
    {
        yield return Case(".pdf", "application/pdf", "%PDF-1.4\n1 0 obj\nendobj\n%%EOF"u8.ToArray());
        yield return Case(".png", "image/png", Bytes(
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82));
        yield return Case(".jpg", "image/jpeg", Bytes(
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46,
            0x00, 0x01, 0x00, 0x00, 0xFF, 0xD9));
        yield return Case(".jpeg", "image/jpeg", Bytes(
            0xFF, 0xD8, 0xFF, 0xDB, 0x00, 0x04, 0x00, 0x00, 0xFF, 0xD9));
        yield return Case(".gif", "image/gif", "GIF89a"u8.ToArray().Concat(Bytes(0x01, 0x00, 0x01, 0x00, 0x3B)).ToArray());
        yield return Case(".webp", "image/webp", Bytes(
            0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00,
            0x57, 0x45, 0x42, 0x50));
        yield return Case(".doc", "application/msword", LegacyOfficeBytes());
        yield return Case(".ppt", "application/vnd.ms-powerpoint", LegacyOfficeBytes());
        yield return Case(".xls", "application/vnd.ms-excel", LegacyOfficeBytes());
        yield return Case(".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            CreateZip("[Content_Types].xml", "word/document.xml"));
        yield return Case(".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            CreateZip("[Content_Types].xml", "ppt/presentation.xml"));
        yield return Case(".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            CreateZip("[Content_Types].xml", "xl/workbook.xml"));
        yield return Case(".zip", "application/zip", CreateZip("material/readme.txt"));
        yield return Case(".txt", "text/plain", "Material de estudio\nLinea 2"u8.ToArray());
        yield return Case(".mp4", "video/mp4", Bytes(
            0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70,
            0x69, 0x73, 0x6F, 0x6D, 0x00, 0x00, 0x00, 0x00,
            0x69, 0x73, 0x6F, 0x6D, 0x6D, 0x70, 0x34, 0x32));
        yield return Case(".webm", "video/webm", Bytes(
            0x1A, 0x45, 0xDF, 0xA3, 0x9F, 0x42, 0x86, 0x81));
    }

    [Theory]
    [MemberData(nameof(ValidFiles))]
    public async Task InspectAsync_AcceptsSupportedContent(
        string extension,
        string contentType,
        byte[] content)
    {
        var inspector = new FileContentInspector();
        IFormFile file = CreateFile(content, $"material{extension}", contentType);

        FileInspectionResult result = await inspector.InspectAsync(file, extension);

        Assert.True(result.IsValid, result.FailureCode);
    }

    [Theory]
    [InlineData(".pdf", "application/pdf")]
    [InlineData(".png", "image/png")]
    [InlineData(".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document")]
    [InlineData(".mp4", "video/mp4")]
    public async Task InspectAsync_RejectsExecutableContentDisguisedAsAllowedFile(
        string extension,
        string contentType)
    {
        var inspector = new FileContentInspector();
        IFormFile file = CreateFile(
            Bytes(0x4D, 0x5A, 0x90, 0x00, 0x03, 0x00, 0x00, 0x00),
            $"payload{extension}",
            contentType);

        FileInspectionResult result = await inspector.InspectAsync(file, extension);

        Assert.False(result.IsValid);
        Assert.Equal("FILE_SIGNATURE_MISMATCH", result.FailureCode);
    }

    [Fact]
    public async Task InspectAsync_RejectsOoxmlPackageForWrongOfficeExtension()
    {
        var inspector = new FileContentInspector();
        IFormFile file = CreateFile(
            CreateZip("[Content_Types].xml", "word/document.xml"),
            "slides.pptx",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation");

        FileInspectionResult result = await inspector.InspectAsync(file, ".pptx");

        Assert.False(result.IsValid);
        Assert.Equal("FILE_STRUCTURE_MISMATCH", result.FailureCode);
    }

    [Fact]
    public async Task InspectAsync_RejectsTruncatedPng()
    {
        var inspector = new FileContentInspector();
        IFormFile file = CreateFile(
            Bytes(0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A),
            "truncated.png",
            "image/png");

        FileInspectionResult result = await inspector.InspectAsync(file, ".png");

        Assert.False(result.IsValid);
    }

    [Fact]
    public async Task InspectAsync_RejectsPdfHeaderWithExecutablePrefix()
    {
        var inspector = new FileContentInspector();
        IFormFile file = CreateFile(
            Bytes(0x4D, 0x5A)
                .Concat("%PDF-1.4\n%%EOF"u8.ToArray())
                .ToArray(),
            "polyglot.pdf",
            "application/pdf");

        FileInspectionResult result = await inspector.InspectAsync(file, ".pdf");

        Assert.False(result.IsValid);
        Assert.Equal("FILE_SIGNATURE_MISMATCH", result.FailureCode);
    }

    [Fact]
    public async Task InspectAsync_RejectsBinaryText()
    {
        var inspector = new FileContentInspector();
        IFormFile file = CreateFile(
            Bytes(0x41, 0x00, 0x42, 0x01, 0x43),
            "binary.txt",
            "text/plain");

        FileInspectionResult result = await inspector.InspectAsync(file, ".txt");

        Assert.False(result.IsValid);
    }

    private static object[] Case(string extension, string contentType, byte[] content)
        => new object[] { extension, contentType, content };

    private static byte[] LegacyOfficeBytes()
        => Bytes(0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1, 0x00, 0x00, 0x00, 0x00);

    private static byte[] CreateZip(params string[] entries)
    {
        using var stream = new MemoryStream();
        using (var archive = new ZipArchive(stream, ZipArchiveMode.Create, leaveOpen: true))
        {
            foreach (string entryName in entries)
            {
                ZipArchiveEntry entry = archive.CreateEntry(entryName);
                using Stream entryStream = entry.Open();
                entryStream.Write("oneitb"u8);
            }
        }

        return stream.ToArray();
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

    private static byte[] Bytes(params byte[] values) => values;
}
