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
        public DbSet<CommentReaction> CommentReactions { get; set; } = null!;
        public DbSet<SocialAttachment> SocialAttachments { get; set; } = null!;
        public DbSet<CommunityReport> CommunityReports { get; set; } = null!;
        public DbSet<ModerationAudit> ModerationAudits { get; set; } = null!;
        public DbSet<AcademicResource> AcademicResources { get; set; } = null!;
        public DbSet<AcademicProgress> AcademicProgressRecords { get; set; } = null!;
        public DbSet<Notification> Notifications { get; set; } = null!;
        public DbSet<NotificationPreference> NotificationPreferences { get; set; } = null!;
        public DbSet<AuditLog> AuditLogs { get; set; } = null!;
        public DbSet<JobOffer> JobOffers { get; set; } = null!;
        public DbSet<JobApplication> JobApplications { get; set; } = null!;
        public DbSet<Message> Messages { get; set; } = null!;
        public DbSet<MagicLink> MagicLinks { get; set; } = null!;
        public DbSet<UserCvExperience> UserCvExperiences { get; set; } = null!;
        public DbSet<UserCvEducation> UserCvEducations { get; set; } = null!;
        public DbSet<UserCvProject> UserCvProjects { get; set; } = null!;
        public DbSet<UserCvSkill> UserCvSkills { get; set; } = null!;
        public DbSet<UserCvLanguage> UserCvLanguages { get; set; } = null!;

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
                    .HasColumnType("char(60)");

                entity.Property(e => e.ExternalProvider)
                    .HasMaxLength(32)
                    .IsUnicode(false);

                entity.Property(e => e.ExternalTenantId)
                    .HasMaxLength(64)
                    .IsUnicode(false);

                entity.Property(e => e.ExternalSubjectId)
                    .HasMaxLength(128)
                    .IsUnicode(false);

                entity.Property(e => e.LastExternalLoginAt)
                    .HasColumnType("datetime2");

                entity.Property(e => e.CreatedAt)
                    .IsRequired()
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");

                entity.Property(e => e.FailedLoginAttempts)
                    .IsRequired()
                    .HasDefaultValue(0);

                entity.Property(e => e.LockoutEnd)
                    .HasColumnType("datetime2");

                entity.HasIndex(e => e.Email)
                    .IsUnique();

                entity.HasIndex(e => new
                    {
                        e.ExternalProvider,
                        e.ExternalTenantId,
                        e.ExternalSubjectId
                    })
                    .IsUnique()
                    .HasFilter(
                        "[ExternalProvider] IS NOT NULL AND " +
                        "[ExternalTenantId] IS NOT NULL AND " +
                        "[ExternalSubjectId] IS NOT NULL");

                entity.ToTable(tableBuilder =>
                {
                    tableBuilder.HasCheckConstraint(
                        "CK_Accounts_ExternalIdentityCompleteness",
                        "([ExternalProvider] IS NULL AND [ExternalTenantId] IS NULL AND [ExternalSubjectId] IS NULL) OR " +
                        "([ExternalProvider] IS NOT NULL AND [ExternalTenantId] IS NOT NULL AND [ExternalSubjectId] IS NOT NULL)");
                    tableBuilder.HasCheckConstraint(
                        "CK_Accounts_AuthenticationCredential",
                        "[PasswordHash] IS NOT NULL OR " +
                        "([ExternalProvider] IS NOT NULL AND [ExternalTenantId] IS NOT NULL AND [ExternalSubjectId] IS NOT NULL)");
                });
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

                entity.Property(e => e.AvatarUrl)
                    .HasMaxLength(500)
                    .IsUnicode(true);

                entity.Property(e => e.MutedUntil)
                    .HasColumnType("datetime2");

                entity.Property(e => e.IsPublicProfile)
                    .IsRequired()
                    .HasDefaultValue(true);

                entity.HasOne(u => u.Account)
                    .WithOne(a => a.User)
                    .HasForeignKey<User>(u => u.Id)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ==========================================
            // MAPEO: TABLAS NORMALIZADAS DE CV
            // ==========================================
            modelBuilder.Entity<UserCvExperience>(entity =>
            {
                entity.ToTable("UserCvExperiences", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Company).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Role).IsRequired().HasMaxLength(200);
                entity.Property(e => e.StartDate).HasMaxLength(50);
                entity.Property(e => e.EndDate).HasMaxLength(50);
                entity.Property(e => e.Location).HasMaxLength(150);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.IsHidden).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.SortOrder).IsRequired();

                entity.HasIndex(e => new { e.UserId, e.SortOrder });

                entity.HasOne(e => e.User)
                    .WithMany(user => user.CvExperiences)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserCvEducation>(entity =>
            {
                entity.ToTable("UserCvEducations", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Institution).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Degree).IsRequired().HasMaxLength(200);
                entity.Property(e => e.StartDate).HasMaxLength(50);
                entity.Property(e => e.EndDate).HasMaxLength(50);
                entity.Property(e => e.Location).HasMaxLength(150);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.IsHidden).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.SortOrder).IsRequired();

                entity.HasIndex(e => new { e.UserId, e.SortOrder });

                entity.HasOne(e => e.User)
                    .WithMany(user => user.CvEducations)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserCvProject>(entity =>
            {
                entity.ToTable("UserCvProjects", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Role).HasMaxLength(200);
                entity.Property(e => e.StartDate).HasMaxLength(50);
                entity.Property(e => e.EndDate).HasMaxLength(50);
                entity.Property(e => e.Url).HasMaxLength(300);
                entity.Property(e => e.Description).HasMaxLength(2000);
                entity.Property(e => e.IsHidden).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.SortOrder).IsRequired();

                entity.HasIndex(e => new { e.UserId, e.SortOrder });

                entity.HasOne(e => e.User)
                    .WithMany(user => user.CvProjects)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserCvSkill>(entity =>
            {
                entity.ToTable("UserCvSkills", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(120);
                entity.Property(e => e.Level).HasMaxLength(80);
                entity.Property(e => e.IsHidden).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.SortOrder).IsRequired();

                entity.HasIndex(e => new { e.UserId, e.SortOrder });

                entity.HasOne(e => e.User)
                    .WithMany(user => user.CvSkills)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<UserCvLanguage>(entity =>
            {
                entity.ToTable("UserCvLanguages", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(120);
                entity.Property(e => e.Level).HasMaxLength(80);
                entity.Property(e => e.IsHidden).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.SortOrder).IsRequired();

                entity.HasIndex(e => new { e.UserId, e.SortOrder });

                entity.HasOne(e => e.User)
                    .WithMany(user => user.CvLanguages)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
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
            // MAPEO: TABLA ACADEMIC_RESOURCES
            // ==========================================
            modelBuilder.Entity<AcademicResource>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).HasMaxLength(1000);
                entity.Property(e => e.FileUrl).HasMaxLength(500).IsUnicode(true);
                entity.Property(e => e.ExternalUrl).HasMaxLength(500).IsUnicode(true);
                entity.Property(e => e.ResourceType).IsRequired().HasMaxLength(20).IsUnicode(false);
                entity.Property(e => e.Category)
                    .IsRequired()
                    .HasConversion<string>()
                    .HasMaxLength(20)
                    .IsUnicode(false)
                    .HasDefaultValue(AcademicResourceCategory.Otro);
                entity.Property(e => e.Version).IsRequired().HasDefaultValue(1);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime2");
                entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);
                entity.ToTable("AcademicResources", "dbo", table =>
                {
                    table.HasCheckConstraint(
                        "CK_AcademicResources_Content",
                        "([FileUrl] IS NOT NULL AND LEN([FileUrl]) > 0) OR ([ExternalUrl] IS NOT NULL AND LEN([ExternalUrl]) > 0)");
                    table.HasCheckConstraint(
                        "CK_AcademicResources_Version",
                        "[Version] >= 1");
                });

                entity.HasQueryFilter(e => e.IsActive);
                entity.HasIndex(e => e.SubjectId);
                entity.HasIndex(e => e.UploaderId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => new { e.SubjectId, e.IsActive, e.CreatedAt });
                entity.HasIndex(e => new { e.SubjectId, e.Category, e.IsActive, e.CreatedAt });

                entity.HasOne(e => e.Subject)
                    .WithMany(subject => subject.AcademicResources)
                    .HasForeignKey(e => e.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Uploader)
                    .WithMany(user => user.UploadedAcademicResources)
                    .HasForeignKey(e => e.UploaderId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA ACADEMIC_PROGRESS
            // ==========================================
            modelBuilder.Entity<AcademicProgress>(entity =>
            {
                entity.ToTable("AcademicProgress", "dbo", table =>
                    table.HasCheckConstraint(
                        "CK_AcademicProgress_Score",
                        "[Score] IS NULL OR ([Score] >= 0 AND [Score] <= 10)"));
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Score).HasColumnType("decimal(5,2)");
                entity.Property(e => e.Status).IsRequired().HasConversion<string>().HasMaxLength(20).IsUnicode(false);
                entity.Property(e => e.Notes).HasMaxLength(1000);
                entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => new { e.UserId, e.SubjectId }).IsUnique();
                entity.HasIndex(e => e.SubjectId);
                entity.HasIndex(e => e.AssignedById);
                entity.HasIndex(e => e.UpdatedAt);

                entity.HasOne(e => e.User)
                    .WithMany(user => user.AcademicProgressRecords)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Subject)
                    .WithMany(subject => subject.AcademicProgressRecords)
                    .HasForeignKey(e => e.SubjectId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.AssignedBy)
                    .WithMany(user => user.AssignedAcademicProgressRecords)
                    .HasForeignKey(e => e.AssignedById)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA NOTIFICATIONS
            // ==========================================
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.ToTable("Notifications", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasMaxLength(40).IsUnicode(false);
                entity.Property(e => e.Message).IsRequired().HasMaxLength(500);
                entity.Property(e => e.ActionUrl).HasMaxLength(300);
                entity.Property(e => e.IsRead).IsRequired().HasDefaultValue(false);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
                entity.Property(e => e.GroupKey).HasMaxLength(160).IsUnicode(false);
                entity.Property(e => e.AggregateCount).IsRequired().HasDefaultValue(1);
                entity.Property(e => e.UpdatedAt).HasColumnType("datetime2");
                entity.Property(e => e.RowVersion).IsRowVersion().IsConcurrencyToken();

                entity.HasIndex(e => new { e.UserId, e.IsRead, e.CreatedAt });
                entity.HasIndex(e => new { e.UserId, e.CreatedAt });
                entity.HasIndex(e => new { e.UserId, e.GroupKey })
                    .IsUnique()
                    .HasFilter("[GroupKey] IS NOT NULL");

                entity.HasOne(e => e.User)
                    .WithMany(user => user.Notifications)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.RelatedInquiry)
                    .WithMany()
                    .HasForeignKey(e => e.RelatedInquiryId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA NOTIFICATION_PREFERENCES
            // ==========================================
            modelBuilder.Entity<NotificationPreference>(entity =>
            {
                entity.ToTable("NotificationPreferences", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Type).IsRequired().HasConversion<string>().HasMaxLength(40).IsUnicode(false);
                entity.Property(e => e.IsEnabled).IsRequired().HasDefaultValue(true);
                entity.Property(e => e.UpdatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => new { e.UserId, e.Type }).IsUnique();

                entity.HasOne(e => e.User)
                    .WithMany(user => user.NotificationPreferences)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA JOB_OFFERS
            // ==========================================
            modelBuilder.Entity<JobOffer>(entity =>
            {
                entity.ToTable("JobOffers", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.Title).IsRequired().HasMaxLength(180);
                entity.Property(e => e.Company).IsRequired().HasMaxLength(160);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(2000);
                entity.Property(e => e.Location).IsRequired().HasMaxLength(160);
                entity.Property(e => e.IsActive).IsRequired().HasDefaultValue(true);
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => e.EmployerId);
                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => new { e.IsActive, e.CreatedAt });

                entity.HasOne(e => e.Employer)
                    .WithMany(user => user.JobOffers)
                    .HasForeignKey(e => e.EmployerId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA JOB_APPLICATIONS
            // ==========================================
            modelBuilder.Entity<JobApplication>(entity =>
            {
                entity.ToTable("JobApplications", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.AppliedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");
                entity.Property(e => e.Status).IsRequired().HasConversion<string>().HasMaxLength(24).IsUnicode(false);

                entity.HasIndex(e => e.JobOfferId);
                entity.HasIndex(e => e.ApplicantId);
                entity.HasIndex(e => new { e.JobOfferId, e.ApplicantId }).IsUnique();
                entity.HasIndex(e => new { e.JobOfferId, e.Status, e.AppliedAt });

                entity.HasOne(e => e.JobOffer)
                    .WithMany(offer => offer.Applications)
                    .HasForeignKey(e => e.JobOfferId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Applicant)
                    .WithMany(user => user.JobApplications)
                    .HasForeignKey(e => e.ApplicantId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA AUDIT_LOGS
            // ==========================================
            modelBuilder.Entity<AuditLog>(entity =>
            {
                entity.ToTable("AuditLogs", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.CorrelationId).HasMaxLength(128).IsUnicode(false);
                entity.Property(e => e.Action).IsRequired().HasMaxLength(24).IsUnicode(false);
                entity.Property(e => e.EntityName).IsRequired().HasMaxLength(120).IsUnicode(false);
                entity.Property(e => e.EntityId).IsRequired().HasMaxLength(120).IsUnicode(false);
                entity.Property(e => e.OldValuesJson).HasColumnType("nvarchar(max)");
                entity.Property(e => e.NewValuesJson).HasColumnType("nvarchar(max)");
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => e.CreatedAt);
                entity.HasIndex(e => e.ActorUserId);
                entity.HasIndex(e => new { e.EntityName, e.EntityId, e.CreatedAt });

                entity.HasOne(e => e.ActorUser)
                    .WithMany()
                    .HasForeignKey(e => e.ActorUserId)
                    .OnDelete(DeleteBehavior.Restrict);
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

                entity.HasIndex(e => new { e.ObserverId, e.TargetId, e.Type }).IsUnique();
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

                entity.Property(e => e.IsHiddenByModerator)
                    .IsRequired()
                    .HasDefaultValue(false);

                entity.Property(e => e.PreferAttachmentCover)
                    .IsRequired()
                    .HasDefaultValue(false);

                entity.Property(e => e.FileUrl)
                    .HasMaxLength(500)
                    .IsUnicode(true);

                entity.HasQueryFilter(e => e.IsActive && !e.IsHiddenByModerator);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.SubjectId);
                entity.HasIndex(e => e.PublishDate);
                entity.HasIndex(e => new { e.IsActive, e.IsHiddenByModerator, e.PublishDate });

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
                entity.Property(e => e.IsHiddenByModerator).IsRequired().HasDefaultValue(false);

                entity.HasQueryFilter(e => e.IsActive && !e.IsHiddenByModerator);

                entity.HasIndex(e => e.InquiryId);
                entity.HasIndex(e => e.UserId);
                entity.HasIndex(e => e.ParentCommentId);
                entity.HasIndex(e => e.ReplyToUserId);
                entity.HasIndex(e => new { e.InquiryId, e.IsActive, e.IsHiddenByModerator });

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

                entity.HasOne(e => e.ReplyToUser)
                    .WithMany()
                    .HasForeignKey(e => e.ReplyToUserId)
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

                entity.HasQueryFilter(e => e.Inquiry.IsActive && !e.Inquiry.IsHiddenByModerator);
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
            // MAPEO: TABLA COMMENT_REACTIONS
            // ==========================================
            modelBuilder.Entity<CommentReaction>(entity =>
            {
                entity.ToTable("CommentReactions", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasQueryFilter(e =>
                    e.Comment.IsActive &&
                    !e.Comment.IsHiddenByModerator &&
                    e.Comment.Inquiry.IsActive &&
                    !e.Comment.Inquiry.IsHiddenByModerator);
                entity.HasIndex(e => new { e.CommentId, e.UserId }).IsUnique();
                entity.HasIndex(e => e.UserId);

                entity.HasOne(e => e.Comment)
                    .WithMany(comment => comment.Reactions)
                    .HasForeignKey(e => e.CommentId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.User)
                    .WithMany(user => user.CommentReactions)
                    .HasForeignKey(e => e.UserId)
                    .OnDelete(DeleteBehavior.Restrict);
            });

            // ==========================================
            // MAPEO: TABLA SOCIAL_ATTACHMENTS
            // ==========================================
            modelBuilder.Entity<SocialAttachment>(entity =>
            {
                entity.ToTable(
                    "SocialAttachments",
                    "dbo",
                    table => table.HasCheckConstraint(
                        "CK_SocialAttachments_ExactlyOneOwner",
                        "([InquiryId] IS NOT NULL AND [CommentId] IS NULL) OR ([InquiryId] IS NULL AND [CommentId] IS NOT NULL)"));
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id).ValueGeneratedNever();
                entity.Property(e => e.FileUrl).IsRequired().HasMaxLength(500);
                entity.Property(e => e.OriginalFileName).IsRequired().HasMaxLength(255);
                entity.Property(e => e.ContentType).IsRequired().HasMaxLength(100).IsUnicode(false);
                entity.Property(e => e.Size).IsRequired();
                entity.Property(e => e.SortOrder).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired().HasColumnType("datetime2").HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasIndex(e => new { e.InquiryId, e.SortOrder });
                entity.HasIndex(e => new { e.CommentId, e.SortOrder });
                entity.HasIndex(e => e.FileUrl);

                entity.HasOne(e => e.Inquiry)
                    .WithMany(inquiry => inquiry.Attachments)
                    .HasForeignKey(e => e.InquiryId)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Comment)
                    .WithMany(comment => comment.Attachments)
                    .HasForeignKey(e => e.CommentId)
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
