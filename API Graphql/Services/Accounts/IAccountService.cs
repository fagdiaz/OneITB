using System;
using System.Threading;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface IAccountService
    {
        Task<AuthPayload> Login(LoginInput input, CancellationToken cancellationToken = default);
        Account? GetById(Guid id);
    }
}
