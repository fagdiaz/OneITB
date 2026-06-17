using System;
using OneItb.Entities.Abstracts;

namespace OneItb.Entities.Models
{
    public enum InteractionType
    {
        Follow = 0,
        Mute = 1,
        Block = 2
    }

    public class UserInteraction : EntityModel<Guid>
    {
        public Guid ObserverId { get; set; }
        public Guid TargetId { get; set; }
        public InteractionType Type { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public virtual User Observer { get; set; } = null!;
        public virtual User Target { get; set; } = null!;
    }
}
