using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using Services.Auth;
using Xunit;

namespace Services.Tests.Auth;

public sealed class MicrosoftEntraTokenValidatorTests : IDisposable
{
    private const string TenantId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
    private const string ClientId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
    private const string Issuer =
        "https://login.microsoftonline.com/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/v2.0";

    private readonly RSA _rsa = RSA.Create(2048);
    private readonly RsaSecurityKey _signingKey;
    private readonly MicrosoftEntraOptions _options;

    public MicrosoftEntraTokenValidatorTests()
    {
        _signingKey = new RsaSecurityKey(_rsa) { KeyId = "entra-test-key" };
        _options = CreateOptions();
    }

    [Fact]
    public async Task ValidateAsync_ValidApiAccessToken_ReturnsMinimalIdentity()
    {
        var validator = CreateValidator();

        MicrosoftEntraIdentity identity = await validator.ValidateAsync(CreateToken());

        Assert.Equal(TenantId, identity.TenantId);
        Assert.Equal("object-123", identity.SubjectId);
        Assert.Equal("ana.perez@itbeltran.com.ar", identity.Email);
        Assert.Equal("Ana", identity.FirstName);
        Assert.Equal("Perez", identity.LastName);
    }

    [Fact]
    public async Task ValidateAsync_CommonAuthority_AcceptsOrganizationalTenant()
    {
        MicrosoftEntraOptions options = CreateOptions(
            MicrosoftEntraOptions.MultiTenantAuthority);
        var validator = CreateValidator(options);

        MicrosoftEntraIdentity identity = await validator.ValidateAsync(CreateToken());

        Assert.True(options.IsMultiTenant);
        Assert.Equal(TenantId, identity.TenantId);
        Assert.Equal(
            "https://login.microsoftonline.com/common/v2.0",
            options.Authority);
    }

    [Fact]
    public async Task ValidateAsync_CommonAuthority_RejectsIssuerTenantMismatch()
    {
        const string otherTenantId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
        MicrosoftEntraOptions options = CreateOptions(
            MicrosoftEntraOptions.MultiTenantAuthority);
        var validator = CreateValidator(options);

        MicrosoftEntraAuthenticationException exception =
            await Assert.ThrowsAsync<MicrosoftEntraAuthenticationException>(() =>
                validator.ValidateAsync(CreateToken(
                    tenantId: TenantId,
                    issuer: $"https://login.microsoftonline.com/{otherTenantId}/v2.0")));

        Assert.Equal("ENTRA_INVALID_TOKEN", exception.Code);
    }

    [Theory]
    [InlineData("wrong-audience", TenantId, "access_as_user", "ana.perez@itbeltran.com.ar")]
    [InlineData(ClientId, "cccccccc-cccc-4ccc-8ccc-cccccccccccc", "access_as_user", "ana.perez@itbeltran.com.ar")]
    [InlineData(ClientId, TenantId, "other_scope", "ana.perez@itbeltran.com.ar")]
    [InlineData(ClientId, TenantId, "access_as_user", "ana.perez@outlook.com")]
    public async Task ValidateAsync_InvalidBoundary_RejectsWithoutIdentityDetails(
        string audience,
        string tenantId,
        string scope,
        string email)
    {
        var validator = CreateValidator();

        MicrosoftEntraAuthenticationException exception =
            await Assert.ThrowsAsync<MicrosoftEntraAuthenticationException>(() =>
                validator.ValidateAsync(CreateToken(
                    audience: audience,
                    tenantId: tenantId,
                    scope: scope,
                    email: email)));

        Assert.Equal("ENTRA_INVALID_TOKEN", exception.Code);
        Assert.DoesNotContain(email, exception.Message, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ValidateAsync_ExpiredToken_IsRejected()
    {
        var validator = CreateValidator();

        MicrosoftEntraAuthenticationException exception =
            await Assert.ThrowsAsync<MicrosoftEntraAuthenticationException>(() =>
                validator.ValidateAsync(CreateToken(
                    notBefore: DateTime.UtcNow.AddHours(-2),
                    expires: DateTime.UtcNow.AddHours(-1))));

        Assert.Equal("ENTRA_INVALID_TOKEN", exception.Code);
    }

    [Fact]
    public async Task ValidateAsync_IdTokenWithoutApiScope_IsRejected()
    {
        var validator = CreateValidator();
        string token = CreateToken(scope: null);

        MicrosoftEntraAuthenticationException exception =
            await Assert.ThrowsAsync<MicrosoftEntraAuthenticationException>(() =>
                validator.ValidateAsync(token));

        Assert.Equal("ENTRA_INVALID_TOKEN", exception.Code);
    }

    [Fact]
    public async Task ValidateAsync_UnknownSigningKey_RefreshesMetadataOnce()
    {
        var staleConfiguration = new OpenIdConnectConfiguration
        {
            Issuer = Issuer
        };
        using RSA staleRsa = RSA.Create(2048);
        staleConfiguration.SigningKeys.Add(
            new RsaSecurityKey(staleRsa) { KeyId = "stale-key" });

        var currentConfiguration = new OpenIdConnectConfiguration
        {
            Issuer = Issuer
        };
        currentConfiguration.SigningKeys.Add(_signingKey);
        var configurationManager = new RefreshingConfigurationManager(
            staleConfiguration,
            currentConfiguration);
        var validator = new MicrosoftEntraTokenValidator(
            _options,
            configurationManager);

        MicrosoftEntraIdentity identity =
            await validator.ValidateAsync(CreateToken());

        Assert.Equal("object-123", identity.SubjectId);
        Assert.True(configurationManager.RefreshRequested);
        Assert.Equal(2, configurationManager.RequestCount);
    }

    [Fact]
    public void Options_EnabledPartialConfiguration_FailsClosed()
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["EntraId:Enabled"] = "true",
                ["EntraId:TenantId"] = TenantId
            })
            .Build();

        Assert.Throws<InvalidOperationException>(() =>
            MicrosoftEntraOptions.FromConfiguration(configuration));
    }

    [Fact]
    public void Options_CommonTenant_IsAcceptedWithoutGuidParsing()
    {
        MicrosoftEntraOptions options = CreateOptions("COMMON");

        Assert.Equal(MicrosoftEntraOptions.MultiTenantAuthority, options.TenantId);
        Assert.True(options.IsMultiTenant);
    }

    [Fact]
    public void Options_UnknownTenantAuthority_FailsClosed()
    {
        Assert.Throws<InvalidOperationException>(() =>
            CreateOptions("organizations"));
    }

    private MicrosoftEntraTokenValidator CreateValidator(
        MicrosoftEntraOptions? options = null)
    {
        var configuration = new OpenIdConnectConfiguration
        {
            Issuer = Issuer
        };
        configuration.SigningKeys.Add(_signingKey);
        return new MicrosoftEntraTokenValidator(
            options ?? _options,
            new StaticConfigurationManager(configuration));
    }

    private string CreateToken(
        string audience = ClientId,
        string tenantId = TenantId,
        string? scope = "access_as_user",
        string email = "ana.perez@itbeltran.com.ar",
        DateTime? notBefore = null,
        DateTime? expires = null,
        string issuer = Issuer)
    {
        var claims = new List<Claim>
        {
            new("tid", tenantId),
            new("oid", "object-123"),
            new("preferred_username", email),
            new("given_name", "Ana"),
            new("family_name", "Perez"),
            new("name", "Ana Perez")
        };
        if (scope is not null)
            claims.Add(new Claim("scp", scope));

        DateTime start = notBefore ?? DateTime.UtcNow.AddMinutes(-1);
        DateTime end = expires ?? DateTime.UtcNow.AddMinutes(10);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            start,
            end,
            new SigningCredentials(_signingKey, SecurityAlgorithms.RsaSha256));
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private static MicrosoftEntraOptions CreateOptions(
        string tenantId = TenantId)
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["EntraId:Enabled"] = "true",
                ["EntraId:TenantId"] = tenantId,
                ["EntraId:ClientId"] = ClientId,
                ["EntraId:Audience"] = ClientId,
                ["EntraId:RequiredScope"] = "access_as_user",
                ["EntraId:AllowedDomain"] = "itbeltran.com.ar"
            })
            .Build();
        return MicrosoftEntraOptions.FromConfiguration(configuration);
    }

    public void Dispose()
    {
        _rsa.Dispose();
    }

    private sealed class StaticConfigurationManager :
        IConfigurationManager<OpenIdConnectConfiguration>
    {
        private readonly OpenIdConnectConfiguration _configuration;

        public StaticConfigurationManager(OpenIdConnectConfiguration configuration)
        {
            _configuration = configuration;
        }

        public Task<OpenIdConnectConfiguration> GetConfigurationAsync(
            CancellationToken cancel) => Task.FromResult(_configuration);

        public void RequestRefresh()
        {
        }
    }

    private sealed class RefreshingConfigurationManager :
        IConfigurationManager<OpenIdConnectConfiguration>
    {
        private readonly OpenIdConnectConfiguration _stale;
        private readonly OpenIdConnectConfiguration _current;

        public RefreshingConfigurationManager(
            OpenIdConnectConfiguration stale,
            OpenIdConnectConfiguration current)
        {
            _stale = stale;
            _current = current;
        }

        public bool RefreshRequested { get; private set; }
        public int RequestCount { get; private set; }

        public Task<OpenIdConnectConfiguration> GetConfigurationAsync(
            CancellationToken cancel)
        {
            RequestCount++;
            return Task.FromResult(RefreshRequested ? _current : _stale);
        }

        public void RequestRefresh()
        {
            RefreshRequested = true;
        }
    }
}
