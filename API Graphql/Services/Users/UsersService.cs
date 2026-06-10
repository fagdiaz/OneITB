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
                 CreatedAt = DateTime.UtcNow
            };

            var user = new User 
            { 
                 Id = userId,
                 FirstName = input.FirstName, 
                 LastName = input.LastName, 
                 Role = "User",
                 Account = account
            };

            await _uow.Users.AddAsync(user);
            await _uow.CompleteAsync();

            return new UserPayload(user.Id, true, "Usuario registrado exitosamente en el sistema académico.");
        }

        public async Task<UpdateProfilePayload> UpdateProfileAsync(UpdateProfileInput input)
        {
            var user = _uow.Users.GetById(input.Id);
            if (user == null)
            {
                return new UpdateProfilePayload(input.Id, false, "Usuario no encontrado.");
            }

            user.Biography = input.Biography;
            user.LinkedIn = input.LinkedIn;
            user.Facebook = input.Facebook;
            user.Instagram = input.Instagram;
            user.Phone = input.Phone;

            await _uow.CompleteAsync();

            return new UpdateProfilePayload(user.Id, true, "Perfil actualizado exitosamente.");
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
