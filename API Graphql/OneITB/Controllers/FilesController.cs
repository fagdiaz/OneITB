using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
using System;
using System.IO;
using System.Threading.Tasks;


namespace OneItb.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FilesController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        public FilesController(IWebHostEnvironment env)
        {
            _env = env;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No se proporcionó ningún archivo.");

            const long MaxFileSize = 10 * 1024 * 1024; // 10 MB
            if (file.Length > MaxFileSize)
                return BadRequest("El archivo supera el tamaño máximo permitido de 10MB.");

            var allowedExtensions = new[] { ".pdf", ".docx", ".jpg", ".jpeg", ".png" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!System.Linq.Enumerable.Contains(allowedExtensions, extension))
                return BadRequest("Tipo de archivo no permitido. Solo se aceptan: pdf, docx, jpg, png.");

            var uploadsFolder = Path.Combine(_env.WebRootPath, "uploads");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var uniqueFileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, uniqueFileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            return Ok(new { url = $"/uploads/{uniqueFileName}" });
        }

        [HttpGet("preview/{fileName}")]
        public IActionResult PreviewFile(string fileName)
        {
            var filePath = Path.Combine(_env.WebRootPath, "uploads", fileName);

            if (!System.IO.File.Exists(filePath))
                return NotFound();

            var provider = new FileExtensionContentTypeProvider();
            if (!provider.TryGetContentType(filePath, out var contentType))
            {
                contentType = "application/octet-stream";
            }

            // Using PhysicalFile with enableRangeProcessing: true supports streaming (e.g. video, partial PDF)
            return PhysicalFile(filePath, contentType, enableRangeProcessing: true);
        }
    }
}
