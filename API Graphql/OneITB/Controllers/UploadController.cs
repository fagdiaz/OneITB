using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OneItb.GraphQL.Services.Storage;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using OneItb.Data;
using OneItb.Entities.Models;
using OneItb.GraphQL.Infrastructure;

namespace OneItb.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/upload")]
    public sealed class UploadController : ControllerBase
    {
        private const long MaxFileSize = 15 * 1024 * 1024;
        private const long MaxRequestSize = 16 * 1024 * 1024;

        private static readonly IReadOnlyDictionary<string, HashSet<string>> AllowedContentTypes =
            new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = Types("application/pdf"),
            [".doc"] = Types("application/msword"),
            [".docx"] = Types("application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            [".ppt"] = Types("application/vnd.ms-powerpoint"),
            [".pptx"] = Types("application/vnd.openxmlformats-officedocument.presentationml.presentation"),
            [".xls"] = Types("application/vnd.ms-excel"),
            [".xlsx"] = Types("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"),
            [".txt"] = Types("text/plain"),
            [".png"] = Types("image/png"),
            [".jpg"] = Types("image/jpeg"),
            [".jpeg"] = Types("image/jpeg"),
            [".gif"] = Types("image/gif"),
            [".webp"] = Types("image/webp"),
            [".zip"] = Types("application/zip", "application/x-zip-compressed"),
            [".mp4"] = Types("video/mp4"),
            [".webm"] = Types("video/webm")
        };

        private static readonly IReadOnlyDictionary<string, HashSet<string>> PrivateAllowedContentTypes =
            new Dictionary<string, HashSet<string>>(StringComparer.OrdinalIgnoreCase)
        {
            [".pdf"] = Types("application/pdf"),
            [".png"] = Types("image/png"),
            [".jpg"] = Types("image/jpeg"),
            [".jpeg"] = Types("image/jpeg"),
            [".webp"] = Types("image/webp")
        };

        private readonly IFileStorageService _storageService;
        private readonly IFileContentInspector _contentInspector;
        private readonly FileStorageRuntimeInfo _storageRuntimeInfo;
        private readonly IWebHostEnvironment? _environment;
        private readonly OneItbContext? _context;
        private readonly ILogger<UploadController> _logger;

        public UploadController(
            IFileStorageService storageService,
            IFileContentInspector contentInspector,
            FileStorageRuntimeInfo storageRuntimeInfo,
            ILogger<UploadController> logger)
            : this(storageService, contentInspector, storageRuntimeInfo, null, null, logger)
        {
        }

        public UploadController(
            IFileStorageService storageService,
            IFileContentInspector contentInspector,
            FileStorageRuntimeInfo storageRuntimeInfo,
            IWebHostEnvironment? environment,
            OneItbContext? context,
            ILogger<UploadController> logger)
        {
            _storageService = storageService;
            _contentInspector = contentInspector;
            _storageRuntimeInfo = storageRuntimeInfo;
            _environment = environment;
            _context = context;
            _logger = logger;
        }

        [NonAction]
        public Task<IActionResult> Upload(IFormFile file, CancellationToken cancellationToken)
        {
            return Upload(file, null, cancellationToken);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(MaxRequestSize)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxRequestSize)]
        public async Task<IActionResult> Upload(
            [FromForm] IFormFile file,
            [FromQuery] string? purpose = null,
            CancellationToken cancellationToken = default)
        {
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "No se proporciono ningun archivo." });

            if (file.Length > MaxFileSize)
                return BadRequest(new { message = "El archivo supera el limite de 15 MB." });

            bool isPrivate = string.Equals(purpose, "private", StringComparison.OrdinalIgnoreCase);
            var contentTypesMap = isPrivate ? PrivateAllowedContentTypes : AllowedContentTypes;

            string extension = System.IO.Path.GetExtension(file.FileName)!.ToLowerInvariant();
            if (!contentTypesMap.TryGetValue(extension, out HashSet<string>? allowedTypes))
                return BadRequest(new { message = "El tipo de archivo no esta permitido." });

            string contentType = file.ContentType?.Trim().ToLowerInvariant() ?? string.Empty;
            if (!allowedTypes.Contains(contentType))
                return BadRequest(new { message = "El contenido del archivo no coincide con su extension." });

            string originalFileName = System.IO.Path.GetFileName(file.FileName).Trim();
            if (originalFileName.Length == 0 ||
                originalFileName.Length > 255 ||
                originalFileName.Any(char.IsControl))
            {
                return BadRequest(new { message = "El nombre del archivo no es valido." });
            }

            FileInspectionResult inspection = await _contentInspector.InspectAsync(
                file,
                extension,
                cancellationToken);
            if (!inspection.IsValid)
            {
                return BadRequest(new
                {
                    message = "El contenido real del archivo no coincide con un formato permitido.",
                    code = "UPLOAD_CONTENT_INVALID"
                });
            }

            if (isPrivate)
            {
                string? userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (!Guid.TryParse(userIdStr, out Guid ownerId))
                    return Unauthorized(new { message = "No se pudo identificar al usuario autenticado." });

                string contentRoot = _environment?.ContentRootPath ?? AppContext.BaseDirectory;
                string privateDirectory = System.IO.Path.Combine(contentRoot, "private_uploads");
                Directory.CreateDirectory(privateDirectory);

                string storedFileName = $"{Guid.NewGuid():N}{extension}";
                string physicalPath = System.IO.Path.Combine(privateDirectory, storedFileName);

                try
                {
                    await using FileStream stream = new(
                        physicalPath,
                        FileMode.CreateNew,
                        FileAccess.Write,
                        FileShare.None,
                        bufferSize: 81920,
                        useAsync: true);
                    await file.CopyToAsync(stream, cancellationToken);
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    if (System.IO.File.Exists(physicalPath))
                    {
                        try { System.IO.File.Delete(physicalPath); } catch { /* ignore */ }
                    }
                    throw;
                }
                catch (Exception exception)
                {
                    if (System.IO.File.Exists(physicalPath))
                    {
                        try { System.IO.File.Delete(physicalPath); } catch { /* ignore */ }
                    }
                    _logger.LogError(exception, "Private upload failed to save to disk.");
                    return StorageUnavailable();
                }

                var privateUpload = new PrivateUpload
                {
                    Id = Guid.NewGuid(),
                    OwnerId = ownerId,
                    StorageKey = physicalPath,
                    FileName = originalFileName,
                    ContentType = contentType,
                    ByteSize = file.Length,
                    ExpiresAtUtc = DateTime.UtcNow.AddHours(24),
                    IsConsumed = false,
                    CreatedAtUtc = DateTime.UtcNow
                };

                if (_context != null)
                {
                    _context.PrivateUploads.Add(privateUpload);
                    await _context.SaveChangesAsync(cancellationToken);
                }

                return Ok(new
                {
                    uploadId = privateUpload.Id
                });
            }

            string fileUrl;
            try
            {
                fileUrl = await _storageService.SaveAsync(file, extension, cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (FileStorageUnavailableException exception)
            {
                _logger.LogWarning(
                    exception,
                    "Upload storage unavailable. Mode {StorageMode}; correlation {CorrelationId}",
                    _storageRuntimeInfo.Mode,
                    GetCorrelationId());
                return StorageUnavailable();
            }
            catch (Exception exception)
            {
                _logger.LogError(
                    exception,
                    "Upload storage failed. Mode {StorageMode}; correlation {CorrelationId}",
                    _storageRuntimeInfo.Mode,
                    GetCorrelationId());
                return StorageUnavailable();
            }

            return Ok(new
            {
                fileUrl,
                originalFileName,
                contentType,
                size = file.Length,
                storageMode = _storageRuntimeInfo.Mode
            });
        }

        private static HashSet<string> Types(params string[] values)
        {
            return new HashSet<string>(values, StringComparer.OrdinalIgnoreCase);
        }

        private ObjectResult StorageUnavailable()
        {
            return StatusCode(
                StatusCodes.Status503ServiceUnavailable,
                new
                {
                    message = "El almacenamiento de archivos no esta disponible. Reintenta manualmente en unos minutos.",
                    code = "UPLOAD_STORAGE_UNAVAILABLE",
                    correlationId = GetCorrelationId(),
                    storageMode = _storageRuntimeInfo.Mode,
                    retryable = true
                });
        }

        private string GetCorrelationId()
        {
            return HttpContext.Items.TryGetValue(
                    CorrelationIdMiddleware.HeaderName,
                    out object? value) &&
                !string.IsNullOrWhiteSpace(value?.ToString())
                    ? value!.ToString()!
                    : HttpContext.TraceIdentifier;
        }
    }
}
