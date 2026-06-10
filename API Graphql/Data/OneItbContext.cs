using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;

namespace OneItb.Data
{
    public class OneItbContext : DbContext
    {
        public OneItbContext(DbContextOptions<OneItbContext> options) : base(options)
        {
        }

        public DbSet<Account> Accounts { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Subject> Subjects { get; set; } = null!;
        public DbSet<Inquiry> Inquiries { get; set; } = null!;
        public DbSet<CommunityReport> CommunityReports { get; set; } = null!;
        public DbSet<MagicLink> MagicLinks { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // MAPEO: TABLA ACCOUNTS
            // ==========================================
            modelBuilder.Entity<Account>(entity =>
            {
                entity.ToTable("Accounts", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .ValueGeneratedNever();

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasColumnType("char(60)");

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");
            });

            // ==========================================
            // MAPEO: TABLA USERS (Relación 1:1 con Cuentas)
            // ==========================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Users", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .ValueGeneratedNever();

                entity.Property(e => e.FirstName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.LastName)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Role)
                    .IsRequired()
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Biography)
                    .HasMaxLength(500);

                entity.Property(e => e.LinkedIn)
                    .HasMaxLength(200);

                entity.Property(e => e.Facebook)
                    .HasMaxLength(200);

                entity.Property(e => e.Instagram)
                    .HasMaxLength(200);

                entity.Property(e => e.Phone)
                    .HasMaxLength(50);

                entity.HasOne(u => u.Account)
                    .WithOne(a => a.User)
                    .HasForeignKey<User>(u => u.Id)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ==========================================
            // MAPEO: TABLA SUBJECTS
            // ==========================================
            modelBuilder.Entity<Subject>(entity =>
            {
                entity.ToTable("Subjects", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.Code)
                    .IsRequired()
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.HasIndex(e => e.Name).IsUnique();
                entity.HasIndex(e => e.Code).IsUnique();
            });

            // ==========================================
            // MAPEO: TABLA INQUIRIES
            // ==========================================
            modelBuilder.Entity<Inquiry>(entity =>
            {
                entity.ToTable("Inquiries", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .ValueGeneratedNever();

                entity.Property(e => e.Title)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Content)
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.PublishDate)
                    .IsRequired()
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<Subject>()
                    .WithMany()
                    .HasForeignKey(c => c.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA COMMUNITY_REPORTS
            // ==========================================
            modelBuilder.Entity<CommunityReport>(entity =>
            {
                entity.ToTable("CommunityReports", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.ContentId).IsRequired().HasMaxLength(100);
                entity.Property(e => e.ContentType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Reason).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasOne(e => e.Reporter)
                    .WithMany()
                    .HasForeignKey(e => e.ReporterId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA MAGIC_LINKS
            // ==========================================
            modelBuilder.Entity<MagicLink>(entity =>
            {
                entity.ToTable("MagicLinks", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Token).IsRequired().HasMaxLength(256);
                entity.Property(e => e.ExpiresAt).IsRequired().HasColumnType("datetime2");
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
                
                entity.HasOne(e => e.Account)
                    .WithMany()
                    .HasForeignKey(e => e.AccountId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}