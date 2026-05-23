using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Consulta : EntityModel<Guid>
    {
        private string _titulo = null!;
        private string _contenido = null!;

        public Guid IdConsulta
        {
            get => Id;
            set => Id = value;
        }

        public string Titulo
        {
            get => _titulo;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El título de la consulta no puede estar vacío o contener espacios en blanco.", nameof(Titulo));
                _titulo = value;
            }
        }

        public string Contenido
        {
            get => _contenido;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El contenido de la consulta no puede estar vacío.", nameof(Contenido));
                _contenido = value;
            }
        }

        public DateTime FechaPublicacion { get; set; }
        public Guid IdUsuario { get; set; }
        public int IdMateria { get; set; }
    }
}
