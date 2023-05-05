using Entities.Enums;
using OneItb.Entities.Abstracts;

namespace Entities.Models
{
    public class Account : EntityModel
    {
        public string Name { get; set; }
        public string TimeZone { get; set; }
        public string Domain { get; set; }        
        public Countries Country { get; set; }
                 
    }
}
