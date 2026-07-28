using System;
using OneITB.Core.Services.Interfaces;

namespace Services.Auth
{
    public sealed class BcryptPasswordHasher : IPasswordHasher
    {
        private readonly PasswordHashingOptions _options;

        public BcryptPasswordHasher(PasswordHashingOptions options)
        {
            _options = options ?? throw new ArgumentNullException(nameof(options));
        }

        public string Hash(string password)
        {
            if (string.IsNullOrEmpty(password))
                throw new ArgumentException("Password is required.", nameof(password));

            return BCrypt.Net.BCrypt.HashPassword(password, _options.WorkFactor);
        }

        public bool Verify(string password, string passwordHash)
        {
            if (string.IsNullOrEmpty(password) || string.IsNullOrWhiteSpace(passwordHash))
                return false;

            try
            {
                return BCrypt.Net.BCrypt.Verify(password, passwordHash);
            }
            catch (BCrypt.Net.SaltParseException)
            {
                return false;
            }
        }

        public bool NeedsRehash(string passwordHash)
        {
            if (string.IsNullOrWhiteSpace(passwordHash))
                return true;

            string[] hashSegments = passwordHash.Split('$');
            if (hashSegments.Length < 4 ||
                !int.TryParse(hashSegments[2], out int embeddedWorkFactor))
                return true;

            return embeddedWorkFactor < _options.WorkFactor;
        }
    }
}
