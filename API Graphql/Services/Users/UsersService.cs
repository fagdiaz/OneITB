using System;
using System.Linq;
using System.Threading.Tasks;
using BCrypt.Net;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Services.Users
{
    public class UsersService : IUsersService
    {
        private readonly IUnitOfWork _uow;

        public UsersService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<UserPayload> RegisterAsync(RegisterInput input)
        {
            var userId = Guid.NewGuid();
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(input.Password);
            
            var account = new Account
            {
                Id = userId,
                Email = input.Email,
                PasswordHash = passwordHash,
                FechaCreacion = DateTime.UtcNow
            };

            var user = new User 
            { 
                Id = userId,
                Nombre = input.Username, 
                Apellido = string.Empty, 
                Rol = "User",
                Account = account
            };

            await _uow.Users.AddAsync(user);
            await _uow.CompleteAsync();

            return new UserPayload(user.Id, true, "Usuario registrado exitosamente en el sistema académico.");
        }

        public async Task<User> CreateAsync(User user)
        {
            await _uow.Users.AddAsync(user);
            await _uow.CompleteAsync();
            return user;
        }

        public IQueryable<User> GetAllAsync()
        {
            return _uow.Users.GetAll();
        }

        public User GetByEmail(string email)
        {
            return _uow.Users.GetByEmail(email);
        }

        public string GenerateToken(User user, IConfiguration configuration)
        {
            return "token_placeholder";
        }

        public User GetById(Guid id)
        {
            return _uow.Users.GetById(id);
        }

        public User GetById(int id)
        {
            return null!;
        }
    }
}
