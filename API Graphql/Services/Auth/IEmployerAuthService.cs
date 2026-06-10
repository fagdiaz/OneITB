using System.Threading.Tasks;

namespace OneITB.Core.Services.Interfaces
{
    public interface IEmployerAuthService
    {
        Task<string> RequestMagicLinkAsync(string email, string cuit);
        Task<string> LoginWithMagicLinkAsync(string token);
    }
}
