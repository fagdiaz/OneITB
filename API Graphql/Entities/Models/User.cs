using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class User : EntityModel<Guid>
    {
        private string _firstName = null!;
        private string _lastName = null!;
        private string _role = null!;

        public string FirstName
        {
            get => _firstName;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El Nombre no puede ser nulo o vacío.", nameof(value));
                _firstName = value;
            }
        }

        public string LastName
        {
            get => _lastName;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El Apellido no puede ser nulo o vacío.", nameof(value));
                _lastName = value;
            }
        }

        public string Role
        {
            get => _role;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El Rol no puede ser nulo o vacío.", nameof(value));
                _role = value;
            }
        }

        public string? Biography { get; set; }
        public string? LinkedIn { get; set; }
        public string? Facebook { get; set; }
        public string? Instagram { get; set; }
        public string? Phone { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual Account Account { get; set; } = null!;
    }
}
