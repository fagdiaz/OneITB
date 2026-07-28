using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Services.Auth;
using Services.Tests.TestSupport;
using Xunit;

namespace Services.Tests.Auth;

public sealed class JwtTokenServiceTests
{
    private const string SigningKey = "oneitb23-test-signing-key-with-at-least-32-bytes";
    private const string Issuer = "OneITB23.Tests";
    private const string Audience = "OneITB23.Tests.Web";

    [Fact]
    public void IssueAccessToken_ProducesSignedCanonicalClaims()
    {
        var options = new JwtTokenOptions(
            SigningKey,
            Issuer,
            Audience,
            TimeSpan.FromHours(2));
        var service = new JwtTokenService(options, TimeProvider.System);
        var user = ServiceTestData.CreateUser(
            ServiceTestData.StudentUserId,
            "Sofia",
            "Alumno",
            "Estudiante",
            true);
        ServiceTestData.CreateAccount(user, "student@itbeltran.test");

        string token = service.IssueAccessToken(user);

        var handler = new JwtSecurityTokenHandler();
        ClaimsPrincipal principal = handler.ValidateToken(
            token,
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = Issuer,
                ValidateAudience = true,
                ValidAudience = Audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(SigningKey))
            },
            out SecurityToken validatedToken);

        var jwt = Assert.IsType<JwtSecurityToken>(validatedToken);
        Assert.Equal(ServiceTestData.StudentUserId.ToString(), principal.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal("Estudiante", principal.FindFirstValue(ClaimTypes.Role));
        Assert.Equal("Sofia Alumno", principal.FindFirstValue(ClaimTypes.Name));
        Assert.Equal("student@itbeltran.test", principal.FindFirstValue(ClaimTypes.Email));
        Assert.Contains(jwt.Claims, claim => claim.Type == JwtRegisteredClaimNames.Jti);
        Assert.Equal(Issuer, jwt.Issuer);
        Assert.Contains(Audience, jwt.Audiences);
        Assert.InRange(jwt.ValidTo - jwt.ValidFrom, TimeSpan.FromMinutes(119), TimeSpan.FromMinutes(121));
    }

    [Fact]
    public void FromConfiguration_RejectsMissingOrWeakSigningKey()
    {
        IConfiguration missing = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Issuer"] = Issuer,
                ["Jwt:Audience"] = Audience
            })
            .Build();
        IConfiguration weak = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = "short",
                ["Jwt:Issuer"] = Issuer,
                ["Jwt:Audience"] = Audience
            })
            .Build();
        IConfiguration lowDiversity = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Key"] = new string('a', 64),
                ["Jwt:Issuer"] = Issuer,
                ["Jwt:Audience"] = Audience
            })
            .Build();

        Assert.Throws<InvalidOperationException>(() => JwtTokenOptions.FromConfiguration(missing));
        Assert.Throws<InvalidOperationException>(() => JwtTokenOptions.FromConfiguration(weak));
        Assert.Throws<InvalidOperationException>(
            () => JwtTokenOptions.FromConfiguration(lowDiversity));
    }

    [Fact]
    public void IssueAccessToken_RejectsInactiveUser()
    {
        var service = new JwtTokenService(
            new JwtTokenOptions(SigningKey, Issuer, Audience, TimeSpan.FromHours(2)),
            TimeProvider.System);
        var user = ServiceTestData.CreateUser(
            ServiceTestData.InactiveUserId,
            "Ines",
            "Inactiva",
            "Estudiante",
            false);

        Assert.Throws<InvalidOperationException>(() => service.IssueAccessToken(user));
    }
}
