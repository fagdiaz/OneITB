using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class User : EntityModel<Guid>
    {
        private string _nombre = null!;
        private string _apellido = null!;
        private string _rol = null!;

        public string Nombre
        {
            get => _nombre;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El Nombre no puede ser nulo o vacío.", nameof(value));
                _nombre = value;
            }
        }

        public string Apellido
        {
            get => _apellido;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El Apellido no puede ser nulo o vacío.", nameof(value));
                _apellido = value;
            }
        }

        public string Rol
        {
            get => _rol;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El Rol no puede ser nulo o vacío.", nameof(value));
                _rol = value;
            }
        }

        public virtual Account Account { get; set; } = null!;
    }
}
