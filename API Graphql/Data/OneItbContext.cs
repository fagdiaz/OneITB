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
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<Reaction> Reactions { get; set; } = null!;
        public DbSet<CommunityReport> CommunityReports { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
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

                entity.Property(e => e.AttachedFileUrl)
                    .HasMaxLength(500)
                    .IsUnicode(true);

                entity.HasOne(i => i.User)
                    .WithMany()
                    .HasForeignKey(i => i.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(i => i.Subject)
                    .WithMany(s => s.Inquiries)
                    .HasForeignKey(i => i.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA COMMENTS
            // ==========================================
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.ToTable("Comments", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Content).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => e.InquiryId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ParentCommentId);

                entity.HasOne(e => e.Inquiry)
                    .WithMany(i => i.Comments)
                    .HasForeignKey(e => e.InquiryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.ParentComment)
                    .WithMany(e => e.Replies)
                    .HasForeignKey(e => e.ParentCommentId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA REACTIONS
            // ==========================================
            modelBuilder.Entity<Reaction>(entity =>
            {
                entity.ToTable("Reactions", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => new { e.InquiryId, e.UserId }).IsUnique();

                entity.HasOne(e => e.Inquiry)
                    .WithMany(i => i.Reactions)
                    .HasForeignKey(e => e.InquiryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany()
                    .HasForeignKey(e => e.UserId)
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
                entity.Property(e => e.Reason).IsRequired().HasMaxLength(500);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(20);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => e.InquiryId);
                entity.HasIndex(e => e.ReporterId);
                entity.HasIndex(e => e.Status);
                entity.HasIndex(e => new { e.InquiryId, e.ReporterId, e.Status })
                    .IsUnique()
                    .HasFilter("[Status] = 'Pending'");

                entity.HasOne(e => e.Inquiry)
                    .WithMany(i => i.Reports)
                    .HasForeignKey(e => e.InquiryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Reporter)
                    .WithMany()
                    .HasForeignKey(e => e.ReporterId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA MESSAGES
            // ==========================================
            modelBuilder.Entity<Message>(entity =>
            {
                entity.ToTable("Messages", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Content).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.SentAt)
                    .IsRequired()
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");
                entity.Property(e => e.IsRead).IsRequired().HasDefaultValue(false);

                entity.HasIndex(e => new { e.SenderId, e.ReceiverId, e.SentAt, e.Id });
                entity.HasIndex(e => new { e.ReceiverId, e.SenderId, e.SentAt, e.Id });
                entity.HasIndex(e => new { e.ReceiverId, e.IsRead, e.SentAt });

                entity.HasOne(e => e.Sender)
                    .WithMany(u => u.SentMessages)
                    .HasForeignKey(e => e.SenderId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Receiver)
                    .WithMany(u => u.ReceivedMessages)
                    .HasForeignKey(e => e.ReceiverId)
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
