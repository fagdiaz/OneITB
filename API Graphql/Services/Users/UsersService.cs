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
        private static readonly string[] AllowedRoles =
        {
            "Estudiante",
            "Profesor",
            "Moderador",
            "Administrador",
            "Empleador",
            "Egresado",
            "User"
        };

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

        public async Task<UserPayload> UpdateUserRoleAsync(Guid userId, string newRole)
        {
            var user = _uow.Users.GetById(userId);
            if (user == null) return new UserPayload(userId, false, "Usuario no encontrado.");
            if (IsAdministrator(user)) return new UserPayload(user.Id, false, "Las cuentas administradoras no pueden cambiar de rol.");
            if (!AllowedRoles.Contains(newRole)) return new UserPayload(user.Id, false, "Rol no permitido.");
            user.Role = newRole;
            await _uow.CompleteAsync();
            return new UserPayload(user.Id, true, "Rol actualizado exitosamente.");
        }

        public async Task<UserPayload> UpdateUserStatusAsync(Guid userId, bool isActive)
        {
            var user = _uow.Users.GetById(userId);
            if (user == null) return new UserPayload(userId, false, "Usuario no encontrado.");
            if (IsAdministrator(user)) return new UserPayload(user.Id, false, "Las cuentas administradoras no pueden suspenderse.");
            user.IsActive = isActive;
            await _uow.CompleteAsync();
            return new UserPayload(user.Id, true, "Estado actualizado exitosamente.");
        }

        public async Task<UserPayload> SilenceUserAsync(Guid userId, int hours)
        {
            var user = _uow.Users.GetById(userId);
            if (user == null) return new UserPayload(userId, false, "Usuario no encontrado.");
            if (IsAdministrator(user)) return new UserPayload(user.Id, false, "Las cuentas administradoras no pueden silenciarse.");
            if (hours <= 0 || hours > 168) return new UserPayload(user.Id, false, "La duracion del silencio debe estar entre 1 y 168 horas.");

            DateTime now = DateTime.UtcNow;
            DateTime baseTime = user.MutedUntil.HasValue && user.MutedUntil.Value > now
                ? user.MutedUntil.Value
                : now;

            user.MutedUntil = baseTime.AddHours(hours);
            await _uow.CompleteAsync();

            return new UserPayload(user.Id, true, $"Usuario silenciado hasta {user.MutedUntil:yyyy-MM-dd HH:mm} UTC.");
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

        private static bool IsAdministrator(User user)
        {
            return string.Equals(user.Role, "Administrador", StringComparison.OrdinalIgnoreCase);
        }
    }
}
