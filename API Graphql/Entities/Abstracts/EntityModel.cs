using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OneItb.Entities.Abstracts
{
    public abstract class EntityModel
    {
        public int Id { get; set; }
        public bool Disabled { get; set; } = false;
        public DateTime CreationDate { get; set; } = DateTime.Now;
        public DateTime ModificationDate { get; set; } = DateTime.Now;
        public string CreationUser { get; set; } = "Admin";
        public string ModificationUser { get; set; } = "Admin";
    }
}
