using Microsoft.EntityFrameworkCore;

namespace OneItb.Data
{
    public sealed record DbSeedOptions(
        bool EnableDemoData = false,
        string? DemoPassword = null,
        Func<string, string>? HashPassword = null);

    public static class DbInitializer
    {
        public static readonly Guid AdminId = EnterpriseDemoSeeder.Admin1Id;
        public static readonly Guid StudentId = EnterpriseDemoSeeder.StudentAds1Id;
        public static readonly Guid TeacherId = EnterpriseDemoSeeder.ProfessorAds1Id;
        public static readonly Guid ModeratorId = EnterpriseDemoSeeder.Moderator1Id;
        public static readonly Guid EmployerId = EnterpriseDemoSeeder.Employer1Id;

        public static void Initialize(OneItbContext context, DbSeedOptions? options = null)
        {
            context.Database.Migrate();

            DbSeedOptions seedOptions = options ?? new DbSeedOptions(
                EnableDemoData: true,
                DemoPassword: Environment.GetEnvironmentVariable("ONEITB_SEED_DEMO_PASSWORD"));

            if (!seedOptions.EnableDemoData)
                return;

            string demoPassword = NormalizeDemoPassword(seedOptions.DemoPassword);
            Func<string, string> hashPassword = seedOptions.HashPassword ??
                throw new InvalidOperationException(
                    "A password hashing policy must be supplied before seeding demo accounts.");
            EnterpriseDemoSeeder
                .SeedAsync(context, demoPassword, hashPassword)
                .GetAwaiter()
                .GetResult();
        }

        private static string NormalizeDemoPassword(string? password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException(
                    "Seed:DemoPassword or ONEITB_SEED_DEMO_PASSWORD must be configured before seeding demo accounts.");
            }

            string normalized = password.Trim();
            if (normalized.Length is < 8 or > 64)
            {
                throw new InvalidOperationException(
                    "The demo seed password must contain between 8 and 64 characters.");
            }

            return normalized;
        }
    }
}
