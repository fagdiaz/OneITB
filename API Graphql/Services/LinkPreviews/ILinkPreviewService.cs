using System.Threading;
using System.Threading.Tasks;

namespace Services.LinkPreviews
{
    public interface ILinkPreviewService
    {
        Task<LinkPreviewResult> GetPreviewAsync(string url, CancellationToken cancellationToken);
    }

    public sealed record LinkPreviewResult(
        bool Success,
        string? Title,
        string? Description,
        string? ImageUrl,
        string? OriginalUrl,
        string? Domain)
    {
        public static LinkPreviewResult Failed(string? originalUrl = null) =>
            new(false, null, null, null, originalUrl, null);
    }
}
