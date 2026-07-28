using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Auth
{
    public sealed class JwtTokenService : IJwtTokenService
    {
        private readonly JwtTokenOptions _options;
        private readonly TimeProvider _timeProvider;
        private readonly JwtSecurityTokenHandler _tokenHandler = new();
        private readonly SigningCredentials _signingCredentials;

        public JwtTokenService(JwtTokenOptions options, TimeProvider timeProvider)
        {
            _options = options ?? throw new ArgumentNullException(nameof(options));
            _timeProvider = timeProvider ?? throw new ArgumentNullException(nameof(timeProvider));
            _signingCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key)),
                SecurityAlgorithms.HmacSha256);
        }

        public string IssueAccessToken(User user)
        {
            ArgumentNullException.ThrowIfNull(user);

            if (user.Id == Guid.Empty || !user.IsActive || string.IsNullOrWhiteSpace(user.Role))
                throw new InvalidOperationException("The authenticated user is not eligible for token issuance.");

            DateTime issuedAt = _timeProvider.GetUtcNow().UtcDateTime;
            string fullName = $"{user.FirstName} {user.LastName}".Trim();
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
                new(ClaimTypes.Name, fullName),
                new(ClaimTypes.Role, user.Role)
            };

            string? email = user.Account?.Email;
            if (!string.IsNullOrWhiteSpace(email))
            {
                claims.Add(new Claim(JwtRegisteredClaimNames.Email, email));
                claims.Add(new Claim(ClaimTypes.Email, email));
            }

            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                notBefore: issuedAt,
                expires: issuedAt.Add(_options.AccessTokenLifetime),
                signingCredentials: _signingCredentials);

            return _tokenHandler.WriteToken(token);
        }
    }
}
