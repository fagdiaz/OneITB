using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Inquiry : EntityModel<Guid>
    {
        private string _title = null!;
        private string _content = null!;

        public string Title
        {
            get => _title;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El título de la consulta no puede estar vacío o contener espacios en blanco.", nameof(Title));
                _title = value;
            }
        }

        public string Content
        {
            get => _content;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El contenido de la consulta no puede estar vacío.", nameof(Content));
                _content = value;
            }
        }

        public DateTime PublishDate { get; set; }
        public Guid UserId { get; set; }
        public int SubjectId { get; set; }
    }
}
