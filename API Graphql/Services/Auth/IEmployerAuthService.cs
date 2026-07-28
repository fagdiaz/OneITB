using System.Threading;
using System.Threading.Tasks;

namespace OneITB.Core.Services.Interfaces
{
    public sealed record MagicLinkRequestPayload(bool Accepted, string Message);

    public interface IEmployerAuthService
    {
        Task<MagicLinkRequestPayload> RequestMagicLinkAsync(
            string email,
            string cuit,
            CancellationToken cancellationToken = default);

        Task<string> LoginWithMagicLinkAsync(
            string token,
            CancellationToken cancellationToken = default);
    }
}
