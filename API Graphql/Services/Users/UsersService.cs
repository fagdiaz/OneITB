using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OneItb.Data;
using OneItb.Entities.Models;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Services.Users
{
    public class UsersService : IUsersService
    {
        private OneItbContext context;
        public UsersService(OneItbContext oneItbContext, IConfiguration configuration) 
        {
            context = oneItbContext;
            this.Configuration = configuration;
        }

        public UsersService(IDbContextFactory<OneItbContext> oneItbContextFactory, CancellationToken? token = null) 
        {
            context = oneItbContextFactory.CreateDbContext();
        }
        public IConfiguration Configuration { get; }
        public async Task<User> CreateAsync(User user)
        {
            try
            {
                await context.Users.AddAsync(user);
                await context.SaveChangesAsync();
                return user;
            } catch (Exception ex)
            {
                return null;
            }
        }

        public IQueryable<User> GetAllAsync()
        {
            return context.Users.AsQueryable();
        }        

        public User GetByEmail(string email)
        {
            return context.Users.Where(u => u.Email == email).FirstOrDefault();
        }

        public User GetById(int id)
        {
            return context.Users.Where(u => u.Id == id).FirstOrDefault();
        }

        public string GenerateToken(User user, IConfiguration configuration)
        {
            if (user == null)
            {
                return null;
            }

            var claims = new[] {
                new Claim("email", user.Email.ToString()),
                new Claim("userId", user.Id.ToString()),
                new Claim("accountId", user.AccountId.ToString()),
                new Claim("userFullName", user.FullName)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(configuration["Jwt:Issuer"],
              configuration["Jwt:Issuer"],
              claims,
              signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public User GetByEmailAndPassword(string email, string password)
        {
            return context.Users.Where(u => u.Email == email && u.Password == password).FirstOrDefault();
        }
    }
}
