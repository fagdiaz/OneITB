namespace OneItb.GraphQL.Services.Email
{
    public sealed record SmtpEmailSettings(
        string Host,
        int Port,
        string User,
        string Pass,
        string? From,
        bool EnableSsl);
}
