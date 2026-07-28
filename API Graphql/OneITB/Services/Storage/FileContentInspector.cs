using System.IO.Compression;
using System.Text;
using Microsoft.AspNetCore.Http;

namespace OneItb.GraphQL.Services.Storage
{
    public sealed class FileContentInspector : IFileContentInspector
    {
        private const int PrefixBytes = 1024;
        private const int TailBytes = 4096;
        private const int TextSampleBytes = 64 * 1024;
        private const int MaxZipEntries = 2048;
        private const long MaxDeclaredUncompressedZipBytes = 150L * 1024 * 1024;
        private static readonly UTF8Encoding StrictUtf8 = new(
            encoderShouldEmitUTF8Identifier: false,
            throwOnInvalidBytes: true);

        public async Task<FileInspectionResult> InspectAsync(
            IFormFile file,
            string extension,
            CancellationToken cancellationToken = default)
        {
            ArgumentNullException.ThrowIfNull(file);
            cancellationToken.ThrowIfCancellationRequested();

            string normalizedExtension = extension?.Trim().ToLowerInvariant() ?? string.Empty;
            await using Stream source = file.OpenReadStream();
            Stream inspectionStream = source;
            MemoryStream? seekableCopy = null;

            try
            {
                if (!source.CanSeek)
                {
                    seekableCopy = new MemoryStream(
                        file.Length is > 0 and <= int.MaxValue ? (int)file.Length : 0);
                    await source.CopyToAsync(seekableCopy, cancellationToken);
                    seekableCopy.Position = 0;
                    inspectionStream = seekableCopy;
                }

                return normalizedExtension switch
                {
                    ".pdf" => await InspectPdfAsync(inspectionStream, cancellationToken),
                    ".png" => await InspectPngAsync(inspectionStream, cancellationToken),
                    ".jpg" or ".jpeg" => await InspectJpegAsync(inspectionStream, cancellationToken),
                    ".gif" => await InspectGifAsync(inspectionStream, cancellationToken),
                    ".webp" => await InspectWebPAsync(inspectionStream, cancellationToken),
                    ".doc" or ".ppt" or ".xls" => await InspectLegacyOfficeAsync(
                        inspectionStream,
                        cancellationToken),
                    ".docx" => InspectZipPackage(
                        inspectionStream,
                        DetectedFileFormat.WordOpenXml,
                        "word/document.xml"),
                    ".pptx" => InspectZipPackage(
                        inspectionStream,
                        DetectedFileFormat.PowerPointOpenXml,
                        "ppt/presentation.xml"),
                    ".xlsx" => InspectZipPackage(
                        inspectionStream,
                        DetectedFileFormat.ExcelOpenXml,
                        "xl/workbook.xml"),
                    ".zip" => InspectZipPackage(
                        inspectionStream,
                        DetectedFileFormat.Zip,
                        requiredPackageEntry: null),
                    ".txt" => await InspectPlainTextAsync(inspectionStream, cancellationToken),
                    ".mp4" => await InspectMp4Async(inspectionStream, cancellationToken),
                    ".webm" => await InspectWebMAsync(inspectionStream, cancellationToken),
                    _ => FileInspectionResult.Invalid("FILE_FORMAT_UNSUPPORTED")
                };
            }
            catch (InvalidDataException)
            {
                return FileInspectionResult.Invalid("FILE_STRUCTURE_INVALID");
            }
            catch (DecoderFallbackException)
            {
                return FileInspectionResult.Invalid("FILE_STRUCTURE_INVALID");
            }
            finally
            {
                if (seekableCopy is not null)
                    await seekableCopy.DisposeAsync();
            }
        }

        private static async Task<FileInspectionResult> InspectPdfAsync(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] prefix = await ReadPrefixAsync(stream, PrefixBytes, cancellationToken);
            byte[] tail = await ReadTailAsync(stream, TailBytes, cancellationToken);
            bool hasHeader = prefix.AsSpan().StartsWith("%PDF-"u8);
            bool hasTrailer = IndexOf(tail, "%%EOF"u8) >= 0;
            return hasHeader && hasTrailer
                ? FileInspectionResult.Valid(DetectedFileFormat.Pdf)
                : FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");
        }

        private static async Task<FileInspectionResult> InspectPngAsync(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] prefix = await ReadPrefixAsync(stream, 8, cancellationToken);
            byte[] tail = await ReadTailAsync(stream, 32, cancellationToken);
            byte[] signature = { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A };
            byte[] iend = { 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82 };
            return prefix.AsSpan().StartsWith(signature) && IndexOf(tail, iend) >= 0
                ? FileInspectionResult.Valid(DetectedFileFormat.Png)
                : FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");
        }

        private static async Task<FileInspectionResult> InspectJpegAsync(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] prefix = await ReadPrefixAsync(stream, 4, cancellationToken);
            byte[] tail = await ReadTailAsync(stream, 2, cancellationToken);
            bool hasStart = prefix.Length >= 3 &&
                            prefix[0] == 0xFF &&
                            prefix[1] == 0xD8 &&
                            prefix[2] == 0xFF;
            bool hasEnd = tail.AsSpan().EndsWith(new byte[] { 0xFF, 0xD9 });
            return hasStart && hasEnd
                ? FileInspectionResult.Valid(DetectedFileFormat.Jpeg)
                : FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");
        }

        private static async Task<FileInspectionResult> InspectGifAsync(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] prefix = await ReadPrefixAsync(stream, 6, cancellationToken);
            byte[] tail = await ReadTailAsync(stream, 1, cancellationToken);
            bool hasHeader = prefix.AsSpan().SequenceEqual("GIF87a"u8) ||
                             prefix.AsSpan().SequenceEqual("GIF89a"u8);
            return hasHeader && tail.Length == 1 && tail[0] == 0x3B
                ? FileInspectionResult.Valid(DetectedFileFormat.Gif)
                : FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");
        }

        private static async Task<FileInspectionResult> InspectWebPAsync(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] prefix = await ReadPrefixAsync(stream, 12, cancellationToken);
            if (prefix.Length < 12 ||
                !prefix.AsSpan(0, 4).SequenceEqual("RIFF"u8) ||
                !prefix.AsSpan(8, 4).SequenceEqual("WEBP"u8))
            {
                return FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");
            }

            uint declaredLength = BitConverter.ToUInt32(prefix, 4);
            long actualLength = GetLength(stream);
            return actualLength >= 12 && declaredLength + 8 <= actualLength
                ? FileInspectionResult.Valid(DetectedFileFormat.WebP)
                : FileInspectionResult.Invalid("FILE_STRUCTURE_MISMATCH");
        }

        private static async Task<FileInspectionResult> InspectLegacyOfficeAsync(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] prefix = await ReadPrefixAsync(stream, 8, cancellationToken);
            byte[] signature = { 0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1 };
            return prefix.AsSpan().SequenceEqual(signature)
                ? FileInspectionResult.Valid(DetectedFileFormat.LegacyOffice)
                : FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");
        }

        private static FileInspectionResult InspectZipPackage(
            Stream stream,
            DetectedFileFormat expectedFormat,
            string? requiredPackageEntry)
        {
            if (GetLength(stream) < 22)
                return FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");

            stream.Position = 0;
            Span<byte> signature = stackalloc byte[4];
            if (stream.Read(signature) != signature.Length ||
                !signature.SequenceEqual(new byte[] { 0x50, 0x4B, 0x03, 0x04 }))
            {
                return FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");
            }

            stream.Position = 0;
            using var archive = new ZipArchive(stream, ZipArchiveMode.Read, leaveOpen: true);
            if (archive.Entries.Count == 0 || archive.Entries.Count > MaxZipEntries)
                return FileInspectionResult.Invalid("FILE_STRUCTURE_MISMATCH");

            long declaredTotal = 0;
            var entryNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (ZipArchiveEntry entry in archive.Entries)
            {
                string normalizedName = entry.FullName.Replace('\\', '/');
                if (IsUnsafeArchivePath(normalizedName))
                    return FileInspectionResult.Invalid("FILE_STRUCTURE_MISMATCH");

                if (entry.Length > MaxDeclaredUncompressedZipBytes - declaredTotal)
                    return FileInspectionResult.Invalid("FILE_STRUCTURE_MISMATCH");

                declaredTotal += entry.Length;
                entryNames.Add(normalizedName);
            }

            if (requiredPackageEntry is not null &&
                (!entryNames.Contains("[Content_Types].xml") ||
                 !entryNames.Contains(requiredPackageEntry)))
            {
                return FileInspectionResult.Invalid("FILE_STRUCTURE_MISMATCH");
            }

            return FileInspectionResult.Valid(expectedFormat);
        }

        private static async Task<FileInspectionResult> InspectPlainTextAsync(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] sample = await ReadPrefixAsync(stream, TextSampleBytes, cancellationToken);
            if (sample.Length == 0 || sample.Contains((byte)0))
                return FileInspectionResult.Invalid("FILE_STRUCTURE_MISMATCH");

            string decoded = StrictUtf8.GetString(sample);
            bool hasInvalidControl = decoded.Any(character =>
                char.IsControl(character) &&
                character is not '\r' and not '\n' and not '\t' and not '\f');
            return hasInvalidControl
                ? FileInspectionResult.Invalid("FILE_STRUCTURE_MISMATCH")
                : FileInspectionResult.Valid(DetectedFileFormat.PlainText);
        }

        private static async Task<FileInspectionResult> InspectMp4Async(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] prefix = await ReadPrefixAsync(stream, 32, cancellationToken);
            if (prefix.Length < 12 || !prefix.AsSpan(4, 4).SequenceEqual("ftyp"u8))
                return FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");

            uint boxLength = ReadBigEndianUInt32(prefix);
            long actualLength = GetLength(stream);
            return boxLength >= 12 && boxLength <= actualLength
                ? FileInspectionResult.Valid(DetectedFileFormat.Mp4)
                : FileInspectionResult.Invalid("FILE_STRUCTURE_MISMATCH");
        }

        private static async Task<FileInspectionResult> InspectWebMAsync(
            Stream stream,
            CancellationToken cancellationToken)
        {
            byte[] prefix = await ReadPrefixAsync(stream, 8, cancellationToken);
            byte[] signature = { 0x1A, 0x45, 0xDF, 0xA3 };
            return prefix.Length >= 8 && prefix.AsSpan(0, 4).SequenceEqual(signature)
                ? FileInspectionResult.Valid(DetectedFileFormat.WebM)
                : FileInspectionResult.Invalid("FILE_SIGNATURE_MISMATCH");
        }

        private static async Task<byte[]> ReadPrefixAsync(
            Stream stream,
            int maxBytes,
            CancellationToken cancellationToken)
        {
            stream.Position = 0;
            int length = (int)Math.Min(GetLength(stream), maxBytes);
            byte[] result = new byte[length];
            int read = 0;
            while (read < length)
            {
                int current = await stream.ReadAsync(
                    result.AsMemory(read, length - read),
                    cancellationToken);
                if (current == 0)
                    break;
                read += current;
            }

            return read == result.Length ? result : result[..read];
        }

        private static async Task<byte[]> ReadTailAsync(
            Stream stream,
            int maxBytes,
            CancellationToken cancellationToken)
        {
            long streamLength = GetLength(stream);
            int length = (int)Math.Min(streamLength, maxBytes);
            stream.Position = streamLength - length;
            byte[] result = new byte[length];
            int read = 0;
            while (read < length)
            {
                int current = await stream.ReadAsync(
                    result.AsMemory(read, length - read),
                    cancellationToken);
                if (current == 0)
                    break;
                read += current;
            }

            return read == result.Length ? result : result[..read];
        }

        private static long GetLength(Stream stream)
        {
            if (!stream.CanSeek)
                throw new InvalidDataException("Inspection stream must be seekable.");
            return stream.Length;
        }

        private static int IndexOf(ReadOnlySpan<byte> source, ReadOnlySpan<byte> value)
        {
            return source.IndexOf(value);
        }

        private static uint ReadBigEndianUInt32(ReadOnlySpan<byte> bytes)
        {
            return ((uint)bytes[0] << 24) |
                   ((uint)bytes[1] << 16) |
                   ((uint)bytes[2] << 8) |
                   bytes[3];
        }

        private static bool IsUnsafeArchivePath(string entryName)
        {
            if (string.IsNullOrWhiteSpace(entryName) ||
                entryName.StartsWith('/') ||
                System.IO.Path.IsPathRooted(entryName))
            {
                return true;
            }

            return entryName
                .Split('/', StringSplitOptions.RemoveEmptyEntries)
                .Any(segment => segment == "..");
        }
    }
}
