using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using HotChocolate;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Accounts
{
    public class AccountsService : IAccountService
    {
        private const int MaxFailedLoginAttempts = 5;
        private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

        private readonly IUnitOfWork _uow;
        private readonly IConfiguration _configuration;

        public AccountsService(IUnitOfWork uow, IConfiguration configuration)
        {
            _uow = uow;
            _configuration = configuration;
        }

        public async Task<AuthPayload> Login(LoginInput input)
        {
            var user = await _uow.Users.GetByEmailAsync(input.Email.ToLowerInvariant());
            if (user == null || !user.IsActive || user.Account == null)
                throw CreateAuthenticationError();

            Account account = user.Account;
            DateTime utcNow = DateTime.UtcNow;

            if (account.LockoutEnd.HasValue)
            {
                if (account.LockoutEnd.Value > utcNow)
                    throw CreateLockoutError(account.LockoutEnd.Value, utcNow);

                account.LockoutEnd = null;
                account.FailedLoginAttempts = 0;
                await _uow.CompleteAsync();
            }

            if (!BCrypt.Net.BCrypt.Verify(input.Password, account.PasswordHash))
            {
                account.FailedLoginAttempts++;
                if (account.FailedLoginAttempts >= MaxFailedLoginAttempts)
                    account.LockoutEnd = utcNow.Add(LockoutDuration);

                await _uow.CompleteAsync();

                if (account.LockoutEnd.HasValue)
                    throw CreateLockoutError(account.LockoutEnd.Value, utcNow);

                throw CreateAuthenticationError();
            }

            if (account.FailedLoginAttempts != 0 || account.LockoutEnd.HasValue)
            {
                account.FailedLoginAttempts = 0;
                account.LockoutEnd = null;
                await _uow.CompleteAsync();
            }

            string token = GenerateJwtToken(user);
            return new AuthPayload(token, user.FirstName, true, user.Id, user.Role);
        }

        public Account? GetById(Guid id)
        {
            return _uow.Accounts.GetById(id);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.FirstName),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(2),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Issuer"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private static GraphQLException CreateAuthenticationError()
        {
            return new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Usuario o contrasena incorrectos.")
                    .SetCode("AUTH_INVALID_CREDENTIALS")
                    .Build());
        }

        private static GraphQLException CreateLockoutError(DateTime lockoutEnd, DateTime utcNow)
        {
            int minutes = Math.Max(1, (int)Math.Ceiling((lockoutEnd - utcNow).TotalMinutes));
            return new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage($"Cuenta bloqueada temporalmente por seguridad. Intenta nuevamente en {minutes} minutos.")
                    .SetCode("ACCOUNT_LOCKED")
                    .Build());
        }
    }
}
