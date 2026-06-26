using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate.AspNetCore;
using HotChocolate.AspNetCore.Subscriptions;
using HotChocolate.AspNetCore.Subscriptions.Protocols;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using OneItb.Data;

namespace OneItb.GraphQL.Authentication
{
    public sealed class SkipWebSocketAuthenticationHandler
        : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public const string SchemeName = "WebSocket";

        public SkipWebSocketAuthenticationHandler(
            IOptionsMonitor<AuthenticationSchemeOptions> options,
            ILoggerFactory logger,
            UrlEncoder encoder)
            : base(options, logger, encoder)
        {
        }

        protected override Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            return Task.FromResult(
                Context.WebSockets.IsWebSocketRequest
                    ? AuthenticateResult.NoResult()
                    : AuthenticateResult.Fail("WebSocket authentication is not applicable."));
        }
    }

    public sealed class AuthenticationSocketSessionInterceptor
        : DefaultSocketSessionInterceptor
    {
        public const string WebSocketTokenKey = "websocket-auth-token";
        private const string AuthorizationPayloadKey = "authorization";

        public override async ValueTask<ConnectionStatus> OnConnectAsync(
            ISocketSession session,
            IOperationMessagePayload connectionInitMessage,
            CancellationToken cancellationToken = default)
        {
            var context = session.Connection.HttpContext;
            var payload = connectionInitMessage.As<Dictionary<string, string>>();

            if (payload is null ||
                !payload.TryGetValue(AuthorizationPayloadKey, out string? authorization) ||
                string.IsNullOrWhiteSpace(authorization))
            {
                return ConnectionStatus.Reject("Autenticación requerida.");
            }

            string token = authorization.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                ? authorization["Bearer ".Length..].Trim()
                : authorization.Trim();
            if (token.Length == 0)
                return ConnectionStatus.Reject("Autenticación requerida.");

            context.Items[WebSocketTokenKey] = token;
            var result = await context.AuthenticateAsync(JwtBearerDefaults.AuthenticationScheme);
            if (result.Principal is null)
                return ConnectionStatus.Reject("Token inválido o vencido.");

            string? userIdValue = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(userIdValue, out Guid userId))
                return ConnectionStatus.Reject("Identidad inválida.");

            var dbContext = context.RequestServices.GetRequiredService<OneItbContext>();
            bool activeUser = await dbContext.Users
                .AsNoTracking()
                .AnyAsync(user => user.Id == userId && user.IsActive, cancellationToken);
            if (!activeUser)
                return ConnectionStatus.Reject("Usuario inactivo.");

            context.User = result.Principal;
            return ConnectionStatus.Accept();
        }
    }
}
