using System;
using System.IO;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using OneItb.Data;

namespace OneItb.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/message-attachments")]
    public sealed class MessageAttachmentsController : ControllerBase
    {
        private readonly OneItbContext _context;
        private readonly ILogger<MessageAttachmentsController> _logger;

        public MessageAttachmentsController(
            OneItbContext context,
            ILogger<MessageAttachmentsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("{attachmentId:guid}")]
        public async Task<IActionResult> Download(Guid attachmentId, CancellationToken cancellationToken)
        {
            string? userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdStr, out Guid currentUserId))
                return Unauthorized();

            var attachment = await _context.MessageAttachments
                .Include(a => a.Message)
                .Include(a => a.Upload)
                .AsNoTracking()
                .FirstOrDefaultAsync(a => a.Id == attachmentId, cancellationToken);

            if (attachment is null)
                return NotFound();

            if (attachment.Message.SenderId != currentUserId && attachment.Message.ReceiverId != currentUserId)
            {
                return Forbid();
            }

            string physicalPath = attachment.Upload.StorageKey;
            if (!System.IO.File.Exists(physicalPath))
            {
                _logger.LogWarning("Physical file not found for attachment {AttachmentId}", attachmentId);
                return NotFound();
            }

            Response.Headers["Cache-Control"] = "private, no-store, no-cache";

            var stream = new FileStream(physicalPath, FileMode.Open, FileAccess.Read, FileShare.Read);
            return File(stream, attachment.ContentType, attachment.FileName, enableRangeProcessing: true);
        }
    }
}
