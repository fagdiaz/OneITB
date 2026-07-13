using System;
using System.Collections.Generic;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public class Inquiry : EntityModel<Guid>
    {
        private string _title = default!;
        private string _content = default!;

        public string Title
        {
            get => _title;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El titulo de la consulta no puede estar vacio o contener espacios en blanco.", nameof(Title));
                _title = value;
            }
        }

        public string Content
        {
            get => _content;
            set
            {
                if (string.IsNullOrWhiteSpace(value))
                    throw new ArgumentException("El contenido de la consulta no puede estar vacio.", nameof(Content));
                _content = value;
            }
        }

        public string? FileUrl { get; set; }
        public DateTime PublishDate { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsHiddenByModerator { get; set; }
        public bool PreferAttachmentCover { get; set; }
        public Guid UserId { get; set; }
        public int SubjectId { get; set; }
        public virtual User User { get; set; } = default!;
        public virtual Subject Subject { get; set; } = default!;
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        public virtual ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
        public virtual ICollection<SocialAttachment> Attachments { get; set; } = new List<SocialAttachment>();
        public virtual ICollection<CommunityReport> Reports { get; set; } = new List<CommunityReport>();
    }
}
