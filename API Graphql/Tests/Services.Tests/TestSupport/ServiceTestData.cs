using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;

namespace Services.Tests.TestSupport;

internal static class ServiceTestData
{
    public static readonly Guid AdminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
    public static readonly Guid TeacherUserId = Guid.Parse("22222222-2222-2222-2222-222222222222");
    public static readonly Guid StudentUserId = Guid.Parse("33333333-3333-3333-3333-333333333333");
    public static readonly Guid OtherStudentUserId = Guid.Parse("44444444-4444-4444-4444-444444444444");
    public static readonly Guid InactiveUserId = Guid.Parse("55555555-5555-5555-5555-555555555555");

    public const int CareerId = 10;
    public const int OtherCareerId = 20;
    public const int SubjectId = 101;

    public static OneItbContext CreateContext()
    {
        DbContextOptions<OneItbContext> options = new DbContextOptionsBuilder<OneItbContext>()
            .UseInMemoryDatabase($"oneitb-tests-{Guid.NewGuid():N}")
            .EnableSensitiveDataLogging()
            .Options;

        return new OneItbContext(options);
    }

    public static async Task SeedAcademicGraphAsync(OneItbContext context)
    {
        var career = new Career
        {
            Id = CareerId,
            Name = "Analisis de Sistemas",
            Code = "ASI",
            IsActive = true
        };

        var otherCareer = new Career
        {
            Id = OtherCareerId,
            Name = "Diseno Industrial",
            Code = "DIS",
            IsActive = true
        };

        var subject = new Subject
        {
            Id = SubjectId,
            Name = "Programacion I",
            Code = "PRG1",
            CareerId = CareerId,
            Career = career,
            Year = 1,
            IsActive = true
        };

        User admin = CreateUser(AdminUserId, "Ada", "Admin", "Administrador", true);
        User teacher = CreateUser(TeacherUserId, "Tomas", "Profesor", "Profesor", true);
        User student = CreateUser(StudentUserId, "Sofia", "Alumno", "Estudiante", true);
        User otherStudent = CreateUser(OtherStudentUserId, "Omar", "Alumno", "Estudiante", true);
        User inactive = CreateUser(InactiveUserId, "Ines", "Inactiva", "Estudiante", false);

        context.Accounts.AddRange(
            CreateAccount(admin, "admin@itbeltran.test"),
            CreateAccount(teacher, "teacher@itbeltran.test"),
            CreateAccount(student, "student@itbeltran.test"),
            CreateAccount(otherStudent, "other.student@itbeltran.test"),
            CreateAccount(inactive, "inactive@itbeltran.test"));

        context.Careers.AddRange(career, otherCareer);
        context.Subjects.Add(subject);
        context.UserCareers.AddRange(
            new UserCareer { UserId = TeacherUserId, CareerId = CareerId, User = teacher, Career = career },
            new UserCareer { UserId = StudentUserId, CareerId = CareerId, User = student, Career = career },
            new UserCareer { UserId = OtherStudentUserId, CareerId = OtherCareerId, User = otherStudent, Career = otherCareer });

        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
    }

    public static async Task SeedNotificationUsersAsync(OneItbContext context)
    {
        User student = CreateUser(StudentUserId, "Sofia", "Alumno", "Estudiante", true);
        User otherStudent = CreateUser(OtherStudentUserId, "Omar", "Alumno", "Estudiante", true);
        User inactive = CreateUser(InactiveUserId, "Ines", "Inactiva", "Estudiante", false);

        context.Accounts.AddRange(
            CreateAccount(student, "student@itbeltran.test"),
            CreateAccount(otherStudent, "other.student@itbeltran.test"),
            CreateAccount(inactive, "inactive@itbeltran.test"));

        await context.SaveChangesAsync();
        context.ChangeTracker.Clear();
    }

    public static Account CreateAccount(User user, string email, string password = "Test1234!")
    {
        var account = new Account
        {
            Id = user.Id,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 4),
            CreatedAt = DateTime.UtcNow,
            FailedLoginAttempts = 0,
            LockoutEnd = null,
            User = user
        };

        user.Account = account;
        return account;
    }

    public static User CreateUser(Guid id, string firstName, string lastName, string role, bool isActive)
    {
        return new User
        {
            Id = id,
            FirstName = firstName,
            LastName = lastName,
            Role = role,
            IsActive = isActive
        };
    }
}
