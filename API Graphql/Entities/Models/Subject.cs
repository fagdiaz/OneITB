using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Subject : EntityModel<int>
    {
        private string _name = null!;
        private string _code = null!;

        public string Name
        {
            get => _name;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El nombre de la materia no puede estar vacío.", nameof(Name));
                _name = value;
            }
        }

        public string Code
        {
            get => _code;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El código de la materia no puede estar vacío.", nameof(Code));
                _code = value;
            }
        }

        public bool IsActive { get; set; } = true;

        public virtual System.Collections.Generic.ICollection<Inquiry> Inquiries { get; set; } = new System.Collections.Generic.List<Inquiry>();
        public virtual System.Collections.Generic.ICollection<SubjectCareer> SubjectCareers { get; set; } = new System.Collections.Generic.List<SubjectCareer>();
    }
}
