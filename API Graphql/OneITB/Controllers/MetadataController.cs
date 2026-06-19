using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace OneItb.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/metadata")]
    public sealed class MetadataController : ControllerBase
    {
        private static readonly HttpClient _httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(3)
        };

        [HttpGet]
        public async Task<IActionResult> GetMetadata([FromQuery] string url, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(url) || !Uri.TryCreate(url, UriKind.Absolute, out var uri))
            {
                return BadRequest(new { success = false, message = "URL invalida." });
            }

            try
            {
                var request = new HttpRequestMessage(HttpMethod.Get, uri);
                request.Headers.Add("User-Agent", "OneITB-LinkPreviewBot/1.0");

                using var response = await _httpClient.SendAsync(request, cancellationToken);
                response.EnsureSuccessStatusCode();

                var html = await response.Content.ReadAsStringAsync(cancellationToken);

                string title = ExtractMetaTag(html, "og:title") ?? ExtractTitleTag(html);
                string description = ExtractMetaTag(html, "og:description") ?? ExtractMetaName(html, "description");
                string imageUrl = ExtractMetaTag(html, "og:image");

                return Ok(new
                {
                    success = true,
                    title = title?.Trim(),
                    description = description?.Trim(),
                    imageUrl = imageUrl?.Trim(),
                    originalUrl = url,
                    domain = uri.Host
                });
            }
            catch (Exception)
            {
                // Fallback gracefully on timeout, 404, DNS error, etc.
                return Ok(new { success = false });
            }
        }

        private static string ExtractMetaTag(string html, string property)
        {
            var match = Regex.Match(html, $@"<meta\s+property=[""']{property}[""']\s+content=[""']([^""']+)[""']\s*/?>", RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                match = Regex.Match(html, $@"<meta\s+content=[""']([^""']+)[""']\s+property=[""']{property}[""']\s*/?>", RegexOptions.IgnoreCase);
            }
            return match.Success ? System.Net.WebUtility.HtmlDecode(match.Groups[1].Value) : null;
        }

        private static string ExtractMetaName(string html, string name)
        {
            var match = Regex.Match(html, $@"<meta\s+name=[""']{name}[""']\s+content=[""']([^""']+)[""']\s*/?>", RegexOptions.IgnoreCase);
            if (!match.Success)
            {
                match = Regex.Match(html, $@"<meta\s+content=[""']([^""']+)[""']\s+name=[""']{name}[""']\s*/?>", RegexOptions.IgnoreCase);
            }
            return match.Success ? System.Net.WebUtility.HtmlDecode(match.Groups[1].Value) : null;
        }

        private static string ExtractTitleTag(string html)
        {
            var match = Regex.Match(html, @"<title>\s*(.+?)\s*</title>", RegexOptions.IgnoreCase | RegexOptions.Singleline);
            return match.Success ? System.Net.WebUtility.HtmlDecode(match.Groups[1].Value) : null;
        }
    }
}
