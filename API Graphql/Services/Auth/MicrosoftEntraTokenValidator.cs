using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace Services.Auth
{
    public sealed class MicrosoftEntraTokenValidator : IMicrosoftEntraTokenValidator
    {
        private static readonly TimeSpan ClockSkew = TimeSpan.FromMinutes(2);

        private readonly MicrosoftEntraOptions _options;
        private readonly IConfigurationManager<OpenIdConnectConfiguration> _configurationManager;
        private readonly JwtSecurityTokenHandler _handler = new()
        {
            MapInboundClaims = false
        };

        public MicrosoftEntraTokenValidator(MicrosoftEntraOptions options)
            : this(
                options,
                CreateConfigurationManager(options))
        {
        }

        public MicrosoftEntraTokenValidator(
            MicrosoftEntraOptions options,
            IConfigurationManager<OpenIdConnectConfiguration> configurationManager)
        {
            _options = options;
            _configurationManager = configurationManager;
        }

        public async Task<MicrosoftEntraIdentity> ValidateAsync(
            string accessToken,
            CancellationToken cancellationToken = default)
        {
            if (!_options.Enabled)
                throw Reject("ENTRA_NOT_CONFIGURED");
            if (string.IsNullOrWhiteSpace(accessToken) ||
                accessToken.Length > _options.MaxTokenLength ||
                !_handler.CanReadToken(accessToken))
            {
                throw Reject("ENTRA_INVALID_TOKEN");
            }

            try
            {
                OpenIdConnectConfiguration configuration =
                    await _configurationManager.GetConfigurationAsync(cancellationToken);
                try
                {
                    return ValidateWithConfiguration(accessToken, configuration);
                }
                catch (SecurityTokenSignatureKeyNotFoundException)
                {
                    _configurationManager.RequestRefresh();
                    configuration = await _configurationManager
                        .GetConfigurationAsync(cancellationToken);
                    return ValidateWithConfiguration(accessToken, configuration);
                }
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (MicrosoftEntraAuthenticationException)
            {
                throw;
            }
            catch (Exception exception) when (
                exception is SecurityTokenException or
                InvalidOperationException or
                IOException or
                HttpRequestException)
            {
                throw Reject("ENTRA_INVALID_TOKEN");
            }
        }

        private MicrosoftEntraIdentity ValidateWithConfiguration(
            string accessToken,
            OpenIdConnectConfiguration configuration)
        {
            var validationParameters = new TokenValidationParameters
            {
                RequireSignedTokens = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = configuration.SigningKeys,
                ValidateIssuer = true,
                IssuerValidator = ValidateIssuer,
                ValidateAudience = true,
                ValidAudience = _options.Audience,
                ValidateLifetime = true,
                RequireExpirationTime = true,
                ClockSkew = ClockSkew,
                NameClaimType = "name",
                RoleClaimType = "roles"
            };

            ClaimsPrincipal principal = _handler.ValidateToken(
                accessToken,
                validationParameters,
                out SecurityToken validatedToken);

            if (validatedToken is not JwtSecurityToken jwt ||
                !string.Equals(
                    jwt.Header.Alg,
                    SecurityAlgorithms.RsaSha256,
                    StringComparison.Ordinal))
            {
                throw Reject("ENTRA_INVALID_TOKEN");
            }

            return ReadIdentity(principal);
        }

        private MicrosoftEntraIdentity ReadIdentity(ClaimsPrincipal principal)
        {
            string tenantId = NormalizeTenantId(
                ReadBoundedClaim(principal, "tid", 64));
            string subjectId = ReadBoundedClaim(principal, "oid", 128);
            string email = ReadEmail(principal);
            string scope = ReadBoundedClaim(principal, "scp", 2_048);

            if (!_options.AllowsTenant(tenantId))
                throw Reject("ENTRA_INVALID_TOKEN");
            if (!scope.Split(' ', StringSplitOptions.RemoveEmptyEntries)
                    .Contains(_options.RequiredScope, StringComparer.Ordinal))
            {
                throw Reject("ENTRA_INVALID_TOKEN");
            }

            string normalizedEmail = email.Trim().ToLowerInvariant();
            int separatorIndex = normalizedEmail.LastIndexOf('@');
            if (separatorIndex <= 0 ||
                !string.Equals(
                    normalizedEmail[(separatorIndex + 1)..],
                    _options.AllowedDomain,
                    StringComparison.Ordinal))
            {
                throw Reject("ENTRA_INVALID_TOKEN");
            }

            string firstName = ReadOptionalClaim(principal, "given_name", 100);
            string lastName = ReadOptionalClaim(principal, "family_name", 100);
            PopulateMissingNames(
                principal,
                normalizedEmail,
                ref firstName,
                ref lastName);

            return new MicrosoftEntraIdentity(
                tenantId,
                subjectId,
                normalizedEmail,
                firstName,
                lastName);
        }

        private string ValidateIssuer(
            string issuer,
            SecurityToken securityToken,
            TokenValidationParameters validationParameters)
        {
            if (securityToken is not JwtSecurityToken jwt)
                throw new SecurityTokenInvalidIssuerException();

            string tokenTenantId = NormalizeTenantId(
                jwt.Claims
                    .FirstOrDefault(claim => claim.Type == "tid")
                    ?.Value);
            if (!_options.AllowsTenant(tokenTenantId))
                throw new SecurityTokenInvalidIssuerException();

            string expectedIssuer =
                $"https://login.microsoftonline.com/{tokenTenantId}/v2.0";
            if (!string.Equals(
                issuer,
                expectedIssuer,
                StringComparison.OrdinalIgnoreCase))
            {
                throw new SecurityTokenInvalidIssuerException();
            }

            return issuer;
        }

        private static string NormalizeTenantId(string? tenantId)
        {
            return Guid.TryParse(tenantId, out Guid parsedTenantId) &&
                parsedTenantId != Guid.Empty
                    ? parsedTenantId.ToString("D")
                    : throw new SecurityTokenInvalidIssuerException();
        }

        private static string ReadEmail(ClaimsPrincipal principal)
        {
            foreach (string claimType in new[] { "preferred_username", "email", "upn" })
            {
                string candidate = ReadOptionalClaim(principal, claimType, 150);
                if (!string.IsNullOrWhiteSpace(candidate))
                    return candidate;
            }

            throw Reject("ENTRA_INVALID_TOKEN");
        }

        private static void PopulateMissingNames(
            ClaimsPrincipal principal,
            string email,
            ref string firstName,
            ref string lastName)
        {
            string displayName = ReadOptionalClaim(principal, "name", 201);
            string[] parts = displayName.Split(
                ' ',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            if (string.IsNullOrWhiteSpace(firstName))
                firstName = parts.FirstOrDefault() ?? email.Split('@')[0];
            if (string.IsNullOrWhiteSpace(lastName))
                lastName = parts.Length > 1 ? string.Join(' ', parts.Skip(1)) : "Institucional";

            firstName = firstName[..Math.Min(firstName.Length, 100)];
            lastName = lastName[..Math.Min(lastName.Length, 100)];
        }

        private static string ReadBoundedClaim(
            ClaimsPrincipal principal,
            string claimType,
            int maxLength)
        {
            string value = ReadOptionalClaim(principal, claimType, maxLength);
            return string.IsNullOrWhiteSpace(value)
                ? throw Reject("ENTRA_INVALID_TOKEN")
                : value;
        }

        private static string ReadOptionalClaim(
            ClaimsPrincipal principal,
            string claimType,
            int maxLength)
        {
            string value = principal.FindFirst(claimType)?.Value?.Trim() ?? string.Empty;
            if (value.Length > maxLength)
                throw Reject("ENTRA_INVALID_TOKEN");
            return value;
        }

        private static ConfigurationManager<OpenIdConnectConfiguration>
            CreateConfigurationManager(MicrosoftEntraOptions options)
        {
            if (!options.Enabled)
            {
                return new ConfigurationManager<OpenIdConnectConfiguration>(
                    "https://login.microsoftonline.com/disabled/v2.0/.well-known/openid-configuration",
                    new OpenIdConnectConfigurationRetriever(),
                    new HttpDocumentRetriever { RequireHttps = true });
            }

            return new ConfigurationManager<OpenIdConnectConfiguration>(
                options.MetadataAddress,
                new OpenIdConnectConfigurationRetriever(),
                new HttpDocumentRetriever { RequireHttps = true });
        }

        private static MicrosoftEntraAuthenticationException Reject(string code) =>
            new(code, "No se pudo validar la identidad institucional.");
    }
}
