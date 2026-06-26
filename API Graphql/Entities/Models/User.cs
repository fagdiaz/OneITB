using System;
using System.Collections.Generic;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class User : EntityModel<Guid>
    {
        private string _firstName = default!;
        private string _lastName = default!;
        private string _role = default!;

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
        public DateTime? MutedUntil { get; set; }
        public bool IsActive { get; set; } = true;

        public virtual Account Account { get; set; } = default!;
        public virtual ICollection<Message> SentMessages { get; set; } = new List<Message>();
        public virtual ICollection<Message> ReceivedMessages { get; set; } = new List<Message>();
        public virtual ICollection<UserCareer> UserCareers { get; set; } = new List<UserCareer>();
        public virtual ICollection<UserInteraction> ObservedInteractions { get; set; } = new List<UserInteraction>();
        public virtual ICollection<UserInteraction> TargetedInteractions { get; set; } = new List<UserInteraction>();
        public virtual ICollection<AcademicResource> UploadedAcademicResources { get; set; } = new List<AcademicResource>();
        public virtual ICollection<AcademicProgress> AcademicProgressRecords { get; set; } = new List<AcademicProgress>();
        public virtual ICollection<AcademicProgress> AssignedAcademicProgressRecords { get; set; } = new List<AcademicProgress>();
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<NotificationPreference> NotificationPreferences { get; set; } = new List<NotificationPreference>();
    }
}
