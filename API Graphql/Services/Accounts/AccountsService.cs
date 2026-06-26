using System;
using System.Threading.Tasks;
using BCrypt.Net;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace Services.Accounts
{
    public class AccountsService : IAccountService
    {
        private readonly IUnitOfWork _uow;
        private readonly IConfiguration _configuration;

        public AccountsService(IUnitOfWork uow, IConfiguration configuration)
        {
            _uow = uow;
            _configuration = configuration;
        }

        public async Task<AuthPayload> Login(LoginInput input)
        {
            var user = await _uow.Users.GetByEmailAsync(input.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(input.Password, user.Account.PasswordHash))
                throw new Exception("Credenciales inválidas.");

            string token = GenerateJwtToken(user);
            return new AuthPayload(token, user.FirstName, true, user.Id, user.Role);
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

        public Account? GetById(Guid id)
        {
            return _uow.Accounts.GetById(id);
        }
    }
}
