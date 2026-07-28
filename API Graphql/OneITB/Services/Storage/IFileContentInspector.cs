using Microsoft.AspNetCore.Http;

namespace OneItb.GraphQL.Services.Storage
{
    public interface IFileContentInspector
    {
        Task<FileInspectionResult> InspectAsync(
            IFormFile file,
            string extension,
            CancellationToken cancellationToken = default);
    }

    public enum DetectedFileFormat
    {
        Pdf,
        Png,
        Jpeg,
        Gif,
        WebP,
        LegacyOffice,
        WordOpenXml,
        PowerPointOpenXml,
        ExcelOpenXml,
        Zip,
        PlainText,
        Mp4,
        WebM
    }

    public sealed record FileInspectionResult(
        bool IsValid,
        DetectedFileFormat? DetectedFormat,
        string? FailureCode)
    {
        public static FileInspectionResult Valid(DetectedFileFormat format)
            => new(true, format, null);

        public static FileInspectionResult Invalid(string failureCode)
            => new(false, null, failureCode);
    }
}
