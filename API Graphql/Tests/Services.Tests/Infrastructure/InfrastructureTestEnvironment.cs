namespace Services.Tests.Infrastructure;

internal static class InfrastructureTestEnvironment
{
    public static bool IsEnabled =>
        string.Equals(
            Environment.GetEnvironmentVariable("ONEITB_RUN_INFRA_TESTS"),
            "true",
            StringComparison.OrdinalIgnoreCase);

    public static string Require(string name)
    {
        string? value = Environment.GetEnvironmentVariable(name);
        if (string.IsNullOrWhiteSpace(value))
            throw new InvalidOperationException($"{name} is required for infrastructure tests.");

        return value.Trim();
    }

    public static int RequireInt(string name)
    {
        string value = Require(name);
        if (!int.TryParse(value, out int result) || result is < 1 or > 65535)
            throw new InvalidOperationException($"{name} must be a valid TCP port.");

        return result;
    }
}
