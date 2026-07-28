using System.Net;
using HotChocolate;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging.Abstractions;
using Moq;
using OneItb.GraphQL.Services.Security;
using OneITB.Core.Services.Interfaces;
using OneITB.GraphQL.Mutations;
using Xunit;

namespace Services.Tests.Auth;

public sealed class MagicLinkMutationRateLimitTests
{
    [Fact]
    public async Task RequestMagicLink_StopsBeforeAuthenticationService_WhenLimitIsExceeded()
    {
        var authService = new Mock<IEmployerAuthService>(MockBehavior.Strict);
        var rateLimiter = new Mock<IMagicLinkRateLimiter>(MockBehavior.Strict);
        rateLimiter
            .Setup(service => service.TryAcquireRequestAsync(
                "203.0.113.25",
                "employer@itbeltran.com.ar",
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(MagicLinkRateLimitDecision.RateLimited(TimeSpan.FromMinutes(2)));
        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse("203.0.113.25");
        var accessor = new HttpContextAccessor { HttpContext = httpContext };

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(() =>
            new Mutation().RequestMagicLink(
                "employer@itbeltran.com.ar",
                "30-12345678-9",
                authService.Object,
                rateLimiter.Object,
                accessor,
                NullLogger<Mutation>.Instance,
                CancellationToken.None));

        Assert.Equal("AUTH_RATE_LIMITED", Assert.Single(exception.Errors).Code);
        authService.Verify(
            service => service.RequestMagicLinkAsync(
                It.IsAny<string>(),
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
        rateLimiter.VerifyAll();
    }

    [Fact]
    public async Task LoginWithMagicLink_FailsClosed_WhenDistributedLimiterIsUnavailable()
    {
        var authService = new Mock<IEmployerAuthService>(MockBehavior.Strict);
        var rateLimiter = new Mock<IMagicLinkRateLimiter>(MockBehavior.Strict);
        rateLimiter
            .Setup(service => service.TryAcquireRedemptionAsync(
                "203.0.113.26",
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync(MagicLinkRateLimitDecision.ProviderUnavailable());
        var httpContext = new DefaultHttpContext();
        httpContext.Connection.RemoteIpAddress = IPAddress.Parse("203.0.113.26");
        var accessor = new HttpContextAccessor { HttpContext = httpContext };

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(() =>
            new Mutation().LoginWithMagicLink(
                new string('a', 64),
                authService.Object,
                rateLimiter.Object,
                accessor,
                NullLogger<Mutation>.Instance,
                CancellationToken.None));

        Assert.Equal("AUTH_TEMPORARILY_UNAVAILABLE", Assert.Single(exception.Errors).Code);
        authService.Verify(
            service => service.LoginWithMagicLinkAsync(
                It.IsAny<string>(),
                It.IsAny<CancellationToken>()),
            Times.Never);
        rateLimiter.VerifyAll();
    }
}
