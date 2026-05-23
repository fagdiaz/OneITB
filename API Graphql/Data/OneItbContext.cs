using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;

namespace OneItb.Data
{
    public class OneItbContext : DbContext
    {
        public OneItbContext(DbContextOptions<OneItbContext> options) : base(options)
        {
        }

        public DbSet<Account> Cuentas { get; set; } = null!;
        public DbSet<User> Usuarios { get; set; } = null!;
        public DbSet<Materia> Materias { get; set; } = null!;
        public DbSet<Consulta> Consultas { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ==========================================
            // MAPEO: TABLA CUENTAS
            // ==========================================
            modelBuilder.Entity<Account>(entity =>
            {
                entity.ToTable("Cuentas", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("IdCuenta")
                    .ValueGeneratedNever();

                entity.Property(e => e.Email)
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.PasswordHash)
                    .IsRequired()
                    .HasColumnType("char(60)");

                entity.Property(e => e.FechaCreacion)
                    .IsRequired()
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");
            });

            // ==========================================
            // MAPEO: TABLA USUARIOS (Relación 1:1 con Cuentas)
            // ==========================================
            modelBuilder.Entity<User>(entity =>
            {
                entity.ToTable("Usuarios", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("IdUsuario")
                    .ValueGeneratedNever();

                entity.Property(e => e.Nombre)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Apellido)
                    .IsRequired()
                    .HasMaxLength(100);

                entity.Property(e => e.Rol)
                    .IsRequired()
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.HasOne(u => u.Account)
                    .WithOne(a => a.User)
                    .HasForeignKey<User>(u => u.Id)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // ==========================================
            // MAPEO: TABLA MATERIAS
            // ==========================================
            modelBuilder.Entity<Materia>(entity =>
            {
                entity.ToTable("Materias", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("IdMateria")
                    .ValueGeneratedOnAdd();

                entity.Property(e => e.NombreMateria)
                    .IsRequired()
                    .HasMaxLength(150);

                entity.Property(e => e.CodigoMateria)
                    .IsRequired()
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.HasIndex(e => e.NombreMateria).IsUnique();
                entity.HasIndex(e => e.CodigoMateria).IsUnique();
            });

            // ==========================================
            // MAPEO: TABLA CONSULTAS (Modificado por QA P0)
            // ==========================================
            modelBuilder.Entity<Consulta>(entity =>
            {
                entity.ToTable("Consultas", "dbo");
                entity.HasKey(e => e.Id);

                entity.Property(e => e.Id)
                    .HasColumnName("IdConsulta")
                    .ValueGeneratedNever();

                entity.Property(e => e.Titulo)
                    .IsRequired()
                    .HasMaxLength(200);

                entity.Property(e => e.Contenido)
                    .IsRequired()
                    .HasColumnType("nvarchar(max)");

                entity.Property(e => e.FechaPublicacion)
                    .IsRequired()
                    .HasColumnType("datetime2")
                    .HasDefaultValueSql("SYSUTCDATETIME()");

                entity.HasOne<User>()
                    .WithMany()
                    .HasForeignKey(c => c.IdUsuario)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne<Materia>()
                    .WithMany()
                    .HasForeignKey(c => c.IdMateria)
                    .OnDelete(DeleteBehavior.Restrict);
            });
        }
    }
}