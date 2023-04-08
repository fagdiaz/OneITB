using OneItb.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace OneItb.Data
{
    public class OneItbContext : DbContext
    {
        public OneItbContext(DbContextOptions options) : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
    }
}