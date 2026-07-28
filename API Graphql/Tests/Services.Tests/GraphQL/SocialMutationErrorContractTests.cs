using System.Security.Claims;
using HotChocolate;
using Microsoft.AspNetCore.Http;
using Moq;
using OneITB.Core.Services.Interfaces;
using OneITB.GraphQL.Mutations;
using Services.Social;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class SocialMutationErrorContractTests
{
    [Fact]
    public async Task ToggleReaction_MapsModerationDenialToControlledUserError()
    {
        Guid userId = Guid.NewGuid();
        Guid inquiryId = Guid.NewGuid();
        var socialService = new Mock<ISocialService>(MockBehavior.Strict);
        socialService
            .Setup(service => service.ToggleReactionAsync(
                userId,
                inquiryId,
                It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException(
                "Tu cuenta esta silenciada temporalmente y no puede reaccionar."));
        var context = new DefaultHttpContext
        {
            User = new ClaimsPrincipal(
                new ClaimsIdentity(
                    new[] { new Claim(ClaimTypes.NameIdentifier, userId.ToString()) },
                    "test"))
        };

        GraphQLException exception = await Assert.ThrowsAsync<GraphQLException>(() =>
            new Mutation().ToggleReaction(
                inquiryId,
                socialService.Object,
                new HttpContextAccessor { HttpContext = context },
                CancellationToken.None));

        IError error = Assert.Single(exception.Errors);
        Assert.Equal("USER_ERROR", error.Code);
        Assert.Contains("silenciada", error.Message, StringComparison.OrdinalIgnoreCase);
        socialService.VerifyAll();
    }
}
