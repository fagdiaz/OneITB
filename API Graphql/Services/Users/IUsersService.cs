using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface IUsersService
    {
        Task<UserPayload> RegisterAsync(RegisterInput input, CancellationToken cancellationToken = default);
        Task<UpdateProfilePayload> UpdateProfileAsync(UpdateProfileInput input, CancellationToken cancellationToken = default);
        Task<UserPayload> ToggleProfilePrivacyAsync(Guid userId, bool isPublic, CancellationToken cancellationToken = default);
        Task<UserPayload> UpdateUserRoleAsync(
            Guid operatorUserId,
            Guid userId,
            string newRole,
            string? adminPassword,
            CancellationToken cancellationToken = default);
        Task<UserPayload> UpdateUserStatusAsync(Guid userId, bool isActive, CancellationToken cancellationToken = default);
        Task<UserPayload> SilenceUserAsync(Guid userId, int hours, CancellationToken cancellationToken = default);
        Task<User> CreateAsync(User user, CancellationToken cancellationToken = default);
        IQueryable<User> GetAllAsync();
        User? GetByEmail(string email);
        User? GetById(Guid id);
        User? GetById(int id);
    }
}
