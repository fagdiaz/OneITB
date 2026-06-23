using System;
using System.Buffers;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;

namespace Services.LinkPreviews
{
    public sealed class LinkPreviewService : ILinkPreviewService
    {
        private const int MaxUrlLength = 2048;
        private const int MaxResponseBytes = 1_048_576;
        private const int MaxRedirects = 3;
        private static readonly TimeSpan RequestTimeout = TimeSpan.FromSeconds(5);
        private static readonly TimeSpan RegexTimeout = TimeSpan.FromMilliseconds(250);

        public async Task<LinkPreviewResult> GetPreviewAsync(
            string url,
            CancellationToken cancellationToken)
        {
            if (!TryCreateAllowedUri(url, out Uri originalUri))
                return LinkPreviewResult.Failed(url);

            using var timeout = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
            timeout.CancelAfter(RequestTimeout);

            try
            {
                using HttpClient client = CreatePinnedHttpClient();
                Uri currentUri = originalUri;

                for (int redirect = 0; redirect <= MaxRedirects; redirect++)
                {
                    if (!await IsPublicDestinationAsync(currentUri, timeout.Token))
                        return LinkPreviewResult.Failed(url);

                    using var request = new HttpRequestMessage(HttpMethod.Get, currentUri);
                    request.Headers.UserAgent.ParseAdd("OneITB-LinkPreview/1.0");
                    request.Headers.Accept.ParseAdd("text/html,application/xhtml+xml");

                    using HttpResponseMessage response = await client.SendAsync(
                        request,
                        HttpCompletionOption.ResponseHeadersRead,
                        timeout.Token);

                    if (IsRedirect(response.StatusCode))
                    {
                        if (redirect == MaxRedirects || response.Headers.Location is null)
                            return LinkPreviewResult.Failed(url);

                        Uri redirected = response.Headers.Location.IsAbsoluteUri
                            ? response.Headers.Location
                            : new Uri(currentUri, response.Headers.Location);
                        if (!TryCreateAllowedUri(redirected.AbsoluteUri, out Uri safeRedirect))
                            return LinkPreviewResult.Failed(url);
                        currentUri = safeRedirect;
                        continue;
                    }

                    if (!response.IsSuccessStatusCode || !IsHtml(response.Content.Headers.ContentType?.MediaType))
                        return LinkPreviewResult.Failed(url);
                    if (response.Content.Headers.ContentLength > MaxResponseBytes)
                        return LinkPreviewResult.Failed(url);

                    string html = await ReadBoundedUtf8Async(response.Content, timeout.Token);
                    string? title = Clamp(ExtractMeta(html, "property", "og:title") ?? ExtractTitle(html), 300);
                    string? description = Clamp(
                        ExtractMeta(html, "property", "og:description") ?? ExtractMeta(html, "name", "description"),
                        500);
                    string? imageUrl = await ResolvePublicImageUrlAsync(
                        ExtractMeta(html, "property", "og:image"),
                        currentUri,
                        timeout.Token);

                    return new LinkPreviewResult(
                        true,
                        title,
                        description,
                        imageUrl,
                        originalUri.AbsoluteUri,
                        originalUri.Host);
                }
            }
            catch (Exception ex) when (ex is HttpRequestException
                or IOException
                or SocketException
                or OperationCanceledException
                or RegexMatchTimeoutException)
            {
                return LinkPreviewResult.Failed(url);
            }

            return LinkPreviewResult.Failed(url);
        }

        private static HttpClient CreatePinnedHttpClient()
        {
            var handler = new SocketsHttpHandler
            {
                AllowAutoRedirect = false,
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate,
                ConnectTimeout = TimeSpan.FromSeconds(3),
                MaxResponseHeadersLength = 32,
                UseCookies = false,
                UseProxy = false,
                ConnectCallback = async (context, cancellationToken) =>
                {
                    IPAddress[] addresses = await Dns.GetHostAddressesAsync(
                        context.DnsEndPoint.Host,
                        cancellationToken);
                    IPAddress address = addresses.FirstOrDefault(IsPublicAddress)
                        ?? throw new HttpRequestException("Unsafe preview destination.");

                    var socket = new Socket(address.AddressFamily, SocketType.Stream, ProtocolType.Tcp);
                    try
                    {
                        await socket.ConnectAsync(
                            new IPEndPoint(address, context.DnsEndPoint.Port),
                            cancellationToken);
                        return new NetworkStream(socket, ownsSocket: true);
                    }
                    catch
                    {
                        socket.Dispose();
                        throw;
                    }
                }
            };

            return new HttpClient(handler) { Timeout = Timeout.InfiniteTimeSpan };
        }

        private static bool TryCreateAllowedUri(string? value, out Uri uri)
        {
            uri = null!;
            if (string.IsNullOrWhiteSpace(value) || value.Length > MaxUrlLength)
                return false;
            if (!Uri.TryCreate(value, UriKind.Absolute, out Uri? parsed))
                return false;
            if (parsed.Scheme != Uri.UriSchemeHttp && parsed.Scheme != Uri.UriSchemeHttps)
                return false;
            if (!string.IsNullOrEmpty(parsed.UserInfo) || string.IsNullOrWhiteSpace(parsed.Host))
                return false;
            if (!parsed.IsDefaultPort && parsed.Port is not 80 and not 443)
                return false;

            uri = parsed;
            return true;
        }

        private static async Task<bool> IsPublicDestinationAsync(Uri uri, CancellationToken cancellationToken)
        {
            try
            {
                IPAddress[] addresses = await Dns.GetHostAddressesAsync(uri.Host, cancellationToken);
                return addresses.Length > 0 && addresses.All(IsPublicAddress);
            }
            catch (Exception ex) when (ex is SocketException or ArgumentException)
            {
                return false;
            }
        }

        private static bool IsPublicAddress(IPAddress address)
        {
            if (address.IsIPv4MappedToIPv6)
                address = address.MapToIPv4();
            if (IPAddress.IsLoopback(address))
                return false;

            byte[] bytes = address.GetAddressBytes();
            if (address.AddressFamily == AddressFamily.InterNetwork)
            {
                byte first = bytes[0];
                byte second = bytes[1];
                if (first is 0 or 10 or 127 || first >= 224)
                    return false;
                if (first == 100 && second is >= 64 and <= 127)
                    return false;
                if (first == 169 && second == 254)
                    return false;
                if (first == 172 && second is >= 16 and <= 31)
                    return false;
                if (first == 192 && (second == 168 || second == 0))
                    return false;
                if (first == 198 && (second is 18 or 19 || second == 51 && bytes[2] == 100))
                    return false;
                if (first == 203 && second == 0 && bytes[2] == 113)
                    return false;
                return true;
            }

            if (address.AddressFamily != AddressFamily.InterNetworkV6)
                return false;
            if (address.Equals(IPAddress.IPv6Any)
                || address.Equals(IPAddress.IPv6None)
                || address.IsIPv6LinkLocal
                || address.IsIPv6Multicast
                || address.IsIPv6SiteLocal)
                return false;
            if ((bytes[0] & 0xFE) == 0xFC)
                return false;
            if (bytes[0] == 0x20 && bytes[1] == 0x01 && bytes[2] == 0x0D && bytes[3] == 0xB8)
                return false;
            return true;
        }

        private static async Task<string> ReadBoundedUtf8Async(
            HttpContent content,
            CancellationToken cancellationToken)
        {
            await using Stream stream = await content.ReadAsStreamAsync(cancellationToken);
            byte[] buffer = ArrayPool<byte>.Shared.Rent(16_384);
            try
            {
                using var output = new MemoryStream();
                while (true)
                {
                    int read = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);
                    if (read == 0)
                        break;
                    if (output.Length + read > MaxResponseBytes)
                        throw new IOException("Preview response is too large.");
                    output.Write(buffer, 0, read);
                }
                return Encoding.UTF8.GetString(output.GetBuffer(), 0, (int)output.Length);
            }
            finally
            {
                ArrayPool<byte>.Shared.Return(buffer);
            }
        }

        private static async Task<string?> ResolvePublicImageUrlAsync(
            string? value,
            Uri pageUri,
            CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;
            if (!Uri.TryCreate(pageUri, WebUtility.HtmlDecode(value.Trim()), out Uri? imageUri))
                return null;
            if (!TryCreateAllowedUri(imageUri.AbsoluteUri, out Uri safeImageUri))
                return null;
            return await IsPublicDestinationAsync(safeImageUri, cancellationToken)
                ? safeImageUri.AbsoluteUri
                : null;
        }

        private static string? ExtractMeta(string html, string attribute, string key)
        {
            string escaped = Regex.Escape(key);
            string pattern = $"<meta\\s+[^>]*{attribute}=[\\\"']{escaped}[\\\"'][^>]*content=[\\\"']([^\\\"']*)[\\\"'][^>]*>";
            Match match = Regex.Match(html, pattern, RegexOptions.IgnoreCase, RegexTimeout);
            if (!match.Success)
            {
                pattern = $"<meta\\s+[^>]*content=[\\\"']([^\\\"']*)[\\\"'][^>]*{attribute}=[\\\"']{escaped}[\\\"'][^>]*>";
                match = Regex.Match(html, pattern, RegexOptions.IgnoreCase, RegexTimeout);
            }
            return match.Success ? WebUtility.HtmlDecode(match.Groups[1].Value.Trim()) : null;
        }

        private static string? ExtractTitle(string html)
        {
            Match match = Regex.Match(
                html,
                "<title[^>]*>\\s*(.*?)\\s*</title>",
                RegexOptions.IgnoreCase | RegexOptions.Singleline,
                RegexTimeout);
            return match.Success ? WebUtility.HtmlDecode(match.Groups[1].Value.Trim()) : null;
        }

        private static string? Clamp(string? value, int maxLength) =>
            string.IsNullOrWhiteSpace(value)
                ? null
                : value.Length <= maxLength ? value : value[..maxLength];

        private static bool IsHtml(string? mediaType) =>
            string.Equals(mediaType, "text/html", StringComparison.OrdinalIgnoreCase)
            || string.Equals(mediaType, "application/xhtml+xml", StringComparison.OrdinalIgnoreCase);

        private static bool IsRedirect(HttpStatusCode statusCode) =>
            statusCode is HttpStatusCode.Moved
                or HttpStatusCode.Redirect
                or HttpStatusCode.RedirectMethod
                or HttpStatusCode.TemporaryRedirect
                or HttpStatusCode.PermanentRedirect;
    }
}
