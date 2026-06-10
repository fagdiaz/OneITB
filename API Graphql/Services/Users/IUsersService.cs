using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface IUsersService
    {
        Task<UserPayload> RegisterAsync(RegisterInput input);
        Task<UpdateProfilePayload> UpdateProfileAsync(UpdateProfileInput input);
        Task<User> CreateAsync(User user);
        IQueryable<User> GetAllAsync();
        User GetByEmail(string email);
        string GenerateToken(User user, IConfiguration configuration);
        User GetById(Guid id);
        User GetById(int id);
    }
}
