using System;
using System.Collections.Generic;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Subject : EntityModel<int>
    {
        private string _name = default!;
        private string _code = default!;

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

        public int CareerId { get; set; }
        public int? Year { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual Career Career { get; set; } = default!;
        public virtual ICollection<Inquiry> Inquiries { get; set; } = new List<Inquiry>();
        public virtual ICollection<Subject> Prerequisites { get; set; } = new List<Subject>();
        public virtual ICollection<Subject> RequiredBy { get; set; } = new List<Subject>();
        public virtual ICollection<AcademicResource> AcademicResources { get; set; } = new List<AcademicResource>();
        public virtual ICollection<AcademicProgress> AcademicProgressRecords { get; set; } = new List<AcademicProgress>();
    }
}
