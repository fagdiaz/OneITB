using System;
using System.Text.RegularExpressions;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Account : EntityModel<Guid>
    {
        private string _email = null!;
        private string _passwordHash = null!;
        private DateTime _fechaCreacion;

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

                _email = cleanedEmail;
            }
        }

        public string PasswordHash
        {
            get => _passwordHash;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El PasswordHash no puede ser nulo o vacío.", nameof(value));

                if (value.Length != 60 || !value.StartsWith("$2"))
                    throw new ArgumentException("Estructura de hash inválida. Debe ser un hash BCrypt válido de 60 caracteres.", nameof(value));

                _passwordHash = value;
            }
        }

        public DateTime FechaCreacion
        {
            get => _fechaCreacion;
            set
            {
                if (value == default)
                    throw new ArgumentException("La FechaCreacion debe ser una fecha válida.", nameof(value));

                _fechaCreacion = value;
            }
        }

        public virtual User User { get; set; } = null!;
    }
}
