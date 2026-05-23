using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Materia : EntityModel<int>
    {
        private string _nombreMateria = null!;
        private string _codigoMateria = null!;

        public string NombreMateria
        {
            get => _nombreMateria;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El nombre de la materia no puede estar vacío.", nameof(NombreMateria));
                _nombreMateria = value;
            }
        }

        public string CodigoMateria
        {
            get => _codigoMateria;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El código de la materia no puede estar vacío.", nameof(CodigoMateria));
                _codigoMateria = value;
            }
        }
    }
}
