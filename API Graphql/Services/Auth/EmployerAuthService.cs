using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Auth
{
    public class EmployerAuthService : IEmployerAuthService
    {
        private readonly OneItbContext _context;

        public EmployerAuthService(OneItbContext context)
        {
            _context = context;
        }

        public async Task<string> RequestMagicLinkAsync(string email, string cuit)
        {
            // Simulate AFIP Validation
            if (string.IsNullOrEmpty(cuit) || cuit.Length != 11)
            {
                throw new Exception("CUIT inválido. Falló validación AFIP simulada.");
            }

            var user = await _context.Users.Include(u => u.Account).FirstOrDefaultAsync(u => u.Account.Email == email);
            if (user == null)
            {
                // Auto register employer
                user = new User
                {
                    FirstName = "Empresa",
                    LastName = "Empleadora",
                    Role = "Empleador",
                    IsActive = true,
                    Account = new Account
                    {
                        Email = email,
                        PasswordHash = "PASSWORDLESS"
                    }
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }
            else if (user.Role != "Empleador")
            {
                throw new Exception("El correo ingresado no pertenece a un empleador.");
            }

            var magicLink = new MagicLink
            {
                AccountId = user.Account.Id,
                Token = Guid.NewGuid().ToString("N"), // Simple token for Magic Link
                ExpiresAt = DateTime.UtcNow.AddMinutes(15)
            };

            _context.MagicLinks.Add(magicLink);
            await _context.SaveChangesAsync();

            // In reality, this would be emailed. For the system we just return it so it can be viewed in GraphQL
            return magicLink.Token;
        }

        public async Task<string> LoginWithMagicLinkAsync(string token)
        {
            var magicLink = await _context.MagicLinks
                .Include(m => m.Account)
                .FirstOrDefaultAsync(m => m.Token == token && !m.IsUsed && m.ExpiresAt > DateTime.UtcNow);

            if (magicLink == null)
            {
                throw new Exception("El Magic Link es inválido o ha expirado.");
            }

            magicLink.IsUsed = true;
            await _context.SaveChangesAsync();

            // TODO: Replace mock token with a proper JWT generated via JwtSecurityTokenHandler.
            return $"Mock_JWT_Token_For_{magicLink.Account?.Email ?? "unknown"}";
        }
    }
}
