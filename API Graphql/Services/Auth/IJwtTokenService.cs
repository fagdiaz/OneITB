using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface IJwtTokenService
    {
        string IssueAccessToken(User user);
    }
}
