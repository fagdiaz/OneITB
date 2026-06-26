using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.IO;
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

        private readonly IWebHostEnvironment _environment;

        public UploadController(IWebHostEnvironment environment)
        {
            _environment = environment;
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

            string webRoot = _environment.WebRootPath
                ?? System.IO.Path.Combine(_environment.ContentRootPath, "wwwroot");
            string uploadsDirectory = System.IO.Path.Combine(webRoot, "uploads");
            Directory.CreateDirectory(uploadsDirectory);

            string storedFileName = $"{Guid.NewGuid():N}{extension}";
            string physicalPath = System.IO.Path.Combine(uploadsDirectory, storedFileName);

            await using FileStream stream = new(
                physicalPath,
                FileMode.CreateNew,
                FileAccess.Write,
                FileShare.None,
                bufferSize: 81920,
                useAsync: true);
            await file.CopyToAsync(stream, cancellationToken);

            return Ok(new { fileUrl = $"/uploads/{storedFileName}" });
        }
    }
}
