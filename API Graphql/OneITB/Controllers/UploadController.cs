using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using OneItb.GraphQL.Services.Storage;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace OneItb.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/upload")]
    public sealed class UploadController : ControllerBase
    {
        private const long MaxFileSize = 15 * 1024 * 1024;
        private const long MaxRequestSize = 16 * 1024 * 1024;

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx",
            ".txt", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".zip"
        };

        private readonly IFileStorageService _storageService;

        public UploadController(IFileStorageService storageService)
        {
            _storageService = storageService;
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [RequestSizeLimit(MaxRequestSize)]
        [RequestFormLimits(MultipartBodyLengthLimit = MaxRequestSize)]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, CancellationToken cancellationToken)
        {
            if (file is null || file.Length == 0)
                return BadRequest(new { message = "No se proporciono ningun archivo." });

            if (file.Length > MaxFileSize)
                return BadRequest(new { message = "El archivo supera el limite de 15 MB." });

            string extension = System.IO.Path.GetExtension(file.FileName)!.ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
                return BadRequest(new { message = "El tipo de archivo no esta permitido." });

            string fileUrl = await _storageService.SaveAsync(file, extension, cancellationToken);
            return Ok(new { fileUrl });
        }
    }
}
