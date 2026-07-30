namespace OneItb.GraphQL.Infrastructure
{
    public sealed record EmployerOnboardingOptions(
        bool Enabled,
        TimeSpan InitialDelay,
        TimeSpan PollInterval,
        TimeSpan LeaseDuration,
        int MaxAttempts,
        TimeSpan BaseRetryDelay)
    {
        public static EmployerOnboardingOptions FromConfiguration(
            IConfiguration configuration)
        {
            var options = new EmployerOnboardingOptions(
                configuration.GetValue("EmployerOnboarding:Enabled", true),
                TimeSpan.FromSeconds(Math.Clamp(
                    configuration.GetValue("EmployerOnboarding:InitialDelaySeconds", 5),
                    0,
                    300)),
                TimeSpan.FromSeconds(Math.Clamp(
                    configuration.GetValue("EmployerOnboarding:PollIntervalSeconds", 15),
                    2,
                    3600)),
                TimeSpan.FromMinutes(Math.Clamp(
                    configuration.GetValue("EmployerOnboarding:LeaseMinutes", 5),
                    1,
                    60)),
                Math.Clamp(
                    configuration.GetValue("EmployerOnboarding:MaxAttempts", 5),
                    1,
                    20),
                TimeSpan.FromSeconds(Math.Clamp(
                    configuration.GetValue("EmployerOnboarding:BaseRetrySeconds", 30),
                    5,
                    3600)));
            return options;
        }
    }
}
