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
        public DbSet<Career> Careers { get; set; } = null!;
        public DbSet<UserCareer> UserCareers { get; set; } = null!;
        public DbSet<SubjectPrerequisite> SubjectPrerequisites { get; set; } = null!;
        public DbSet<UserInteraction> UserInteractions { get; set; } = null!;
        public DbSet<Inquiry> Inquiries { get; set; } = null!;
        public DbSet<Comment> Comments { get; set; } = null!;
        public DbSet<Reaction> Reactions { get; set; } = null!;
        public DbSet<CommunityReport> CommunityReports { get; set; } = null!;
        public DbSet<ModerationAudit> ModerationAudits { get; set; } = null!;
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

                entity.Property(e => e.MutedUntil)
                    .HasColumnType("datetime2");

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
                entity.ToTable("Subjects", "dbo", table =>
                    table.HasCheckConstraint(
                        "CK_Subjects_Year",
                        "[Year] IS NULL OR ([Year] BETWEEN 1 AND 6)"));
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

                entity.Property(e => e.Year);

                entity.HasIndex(e => e.Name).IsUnique();
                entity.HasIndex(e => e.Code).IsUnique();
                entity.HasIndex(e => e.CareerId);

                entity.HasOne(e => e.Career)
                    .WithMany(career => career.Subjects)
                    .HasForeignKey(e => e.CareerId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasMany(e => e.Prerequisites)
                    .WithMany(e => e.RequiredBy)
                    .UsingEntity<SubjectPrerequisite>(
                        right => right
                            .HasOne(link => link.Prerequisite)
                            .WithMany()
                            .HasForeignKey(link => link.PrerequisiteId)
                            .OnDelete(DeleteBehavior.Restrict),
                        left => left
                            .HasOne(link => link.Subject)
                            .WithMany()
                            .HasForeignKey(link => link.SubjectId)
                            .OnDelete(DeleteBehavior.Restrict),
                        join =>
                        {
                            join.ToTable("SubjectPrerequisites", "dbo", table =>
                                table.HasCheckConstraint(
                                    "CK_SubjectPrerequisites_NoSelfReference",
                                    "[SubjectId] <> [PrerequisiteId]"));
                            join.HasKey(link => new { link.SubjectId, link.PrerequisiteId });
                            join.HasIndex(link => link.PrerequisiteId);
                        });
            });

            // ==========================================
            // MAPEO: TABLA CAREERS
            // ==========================================
            modelBuilder.Entity<Career>(entity =>
            {
                entity.ToTable("Careers", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.Name)
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.HasIndex(e => e.Name).IsUnique();
            });

            // ==========================================
            // MAPEO: TABLA USER_CAREERS
            // ==========================================
            modelBuilder.Entity<UserCareer>(entity =>
            {
                entity.ToTable("UserCareers", "dbo");
                entity.HasKey(e => new { e.UserId, e.CareerId });

                entity.HasOne(e => e.User)
                    .WithMany(u => u.UserCareers)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Career)
                    .WithMany(c => c.UserCareers)
                    .HasForeignKey(e => e.CareerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA USER_INTERACTIONS
            // ==========================================
            modelBuilder.Entity<UserInteraction>(entity =>
            {
                entity.ToTable("UserInteractions", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasMaxLength(20);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => new { e.ObserverId, e.TargetId }).IsUnique();
                entity.HasIndex(e => new { e.ObserverId, e.Type });

                entity.HasOne(e => e.Observer)
                    .WithMany(u => u.ObservedInteractions)
                    .HasForeignKey(e => e.ObserverId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Target)
                    .WithMany(u => u.TargetedInteractions)
                    .HasForeignKey(e => e.TargetId)
                    .OnDelete(DeleteBehavior.Restrict);
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

                entity.Property(e => e.UpdatedAt)
                    .HasColumnType("datetime2");

                entity.Property(e => e.IsActive)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.Property(e => e.FileUrl)
                    .HasMaxLength(500)
                    .IsUnicode(true);

                entity.HasQueryFilter(e => e.IsActive);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.SubjectId);
                entity.HasIndex(e => e.PublishDate);

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
                entity.Property(e => e.FileUrl).HasMaxLength(500).IsUnicode(true);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime2");
                entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);

                entity.HasQueryFilter(e => e.IsActive);

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

                entity.HasQueryFilter(e => e.Inquiry.IsActive);
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

                entity.HasQueryFilter(e => e.Inquiry.IsActive);
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
            // MAPEO: TABLA MODERATION_AUDITS
            // ==========================================
            modelBuilder.Entity<ModerationAudit>(entity =>
            {
                entity.ToTable("ModerationAudits", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Action).IsRequired().HasMaxLength(80).IsUnicode(false);
                entity.Property(e => e.Summary).IsRequired().HasMaxLength(500);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ActorUserId);
                entity.HasIndex(e => e.TargetUserId);
                entity.HasIndex(e => e.TargetInquiryId);
                entity.HasIndex(e => e.TargetCommentId);
                entity.HasIndex(e => e.TargetReportId);

                entity.HasOne(e => e.ActorUser)
                    .WithMany()
                    .HasForeignKey(e => e.ActorUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.TargetUser)
                    .WithMany()
                    .HasForeignKey(e => e.TargetUserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.TargetInquiry)
                    .WithMany()
                    .HasForeignKey(e => e.TargetInquiryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.TargetComment)
                    .WithMany()
                    .HasForeignKey(e => e.TargetCommentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.TargetReport)
                    .WithMany()
                    .HasForeignKey(e => e.TargetReportId)
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
