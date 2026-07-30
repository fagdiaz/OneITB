using System;
using System.Text.RegularExpressions;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Account : EntityModel<Guid>
    {
        private string _email = default!;
        private string? _passwordHash;
        private DateTime _createdAt;

        private static readonly Regex EmailRegex = new Regex(
            @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
            RegexOptions.Compiled | RegexOptions.IgnoreCase,
            TimeSpan.FromMilliseconds(250)
        );

        public string Email
        {
            get => _email;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El Email no puede ser nulo o vacío.", nameof(value));

                string cleanedEmail = value.Trim();
                if (!EmailRegex.IsMatch(cleanedEmail))
                    throw new ArgumentException("El formato del Email no cumple con la estructura requerida.", nameof(value));

                _email = NormalizeDisplayEmail(cleanedEmail);
            }
        }

        public string? PasswordHash
        {
            get => _passwordHash;
            set
            {
                if (value is null)
                {
                    _passwordHash = null;
                    return;
                }

                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El PasswordHash no puede estar vacío.", nameof(value));

                if (value.Length != 60 || !value.StartsWith("$2"))
                    throw new ArgumentException("Estructura de hash inválida. Debe ser un hash BCrypt válido de 60 caracteres.", nameof(value));

                _passwordHash = value;
            }
        }

        public string? ExternalProvider { get; set; }

        public string? ExternalTenantId { get; set; }

        public string? ExternalSubjectId { get; set; }

        public DateTime? LastExternalLoginAt { get; set; }

        public bool MagicLinkEnabled { get; set; }

        public bool HasExternalIdentity =>
            !string.IsNullOrWhiteSpace(ExternalProvider) &&
            !string.IsNullOrWhiteSpace(ExternalTenantId) &&
            !string.IsNullOrWhiteSpace(ExternalSubjectId);

        public DateTime CreatedAt
        {
            get => _createdAt;
            set
            {
                if (value == default)
                    throw new ArgumentException("La FechaCreacion debe ser una fecha válida.", nameof(value));

                _createdAt = value;
            }
        }

        public int FailedLoginAttempts { get; set; }

        public DateTime? LockoutEnd { get; set; }

        public virtual User User { get; set; } = default!;

        private static string NormalizeDisplayEmail(string email)
        {
            return email.Trim().ToLowerInvariant();
        }
    }
}
