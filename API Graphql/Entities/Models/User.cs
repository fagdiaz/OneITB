using Entities.Enums;
using Entities.Models;
using OneItb.Entities.Abstracts;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace OneItb.Entities.Models
{
    public class User : EntityModel
    {
        public string UserName { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Password { get; set; }
        public Account Account { get; set; }
        public int? AccountId { get; set; }
        public States State { get; set; }
    } 
}
