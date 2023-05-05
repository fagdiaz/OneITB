using OneItb.Entities.Models;
using Microsoft.EntityFrameworkCore;
using Entities.Models;

namespace OneItb.Data
{
    public class OneItbContext : DbContext
    {
        public OneItbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Account> Accounts { get; set; }
    }
}