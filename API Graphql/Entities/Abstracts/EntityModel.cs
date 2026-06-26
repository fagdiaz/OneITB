using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OneItb.Entities.Abstracts
{
    public abstract class EntityModel<T>
    {
        public T Id { get; set; } = default!;
        public bool Disabled { get; set; } = false;
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public DateTime ModificationDate { get; set; } = DateTime.Now;
        public string CreationUser { get; set; } = "Admin";
        public string ModificationUser { get; set; } = "Admin";
    }

    public abstract class EntityModel : EntityModel<int>
    {
    }
}
