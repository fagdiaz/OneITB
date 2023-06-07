using Microsoft.Extensions.Configuration;
using OneItb.Entities.Models;

namespace Services.Users
{
    public interface IUsersService
    {
        Task<User> CreateAsync(User user);
        IQueryable<User> GetAllAsync();
        User GetByEmail(string email);
        string GenerateToken(User user, IConfiguration configuration);
        User GetById(int id);
    }
}
