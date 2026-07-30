using System;
using System.Linq;
using System.Security.Cryptography;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using Services.EmployerOnboarding;

namespace Services.Auth
{
    public sealed class EmployerAuthService : IEmployerAuthService
    {
        private const int MagicLinkLifetimeMinutes = 15;
        private const int MagicLinkTokenBytes = 32;

        private readonly OneItbContext _context;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IEmailSender _emailSender;
        private readonly MagicLinkDeliveryOptions _deliveryOptions;
        private readonly TimeProvider _timeProvider;

        public EmployerAuthService(
            OneItbContext context,
            IJwtTokenService jwtTokenService,
            IEmailSender emailSender,
            MagicLinkDeliveryOptions deliveryOptions,
            TimeProvider timeProvider)
        {
            _context = context;
            _jwtTokenService = jwtTokenService;
            _emailSender = emailSender;
            _deliveryOptions = deliveryOptions;
            _timeProvider = timeProvider;
        }

        public async Task<MagicLinkRequestPayload> RequestMagicLinkAsync(
            string email,
            string cuit,
            CancellationToken cancellationToken = default)
        {
            string normalizedEmail = NormalizeEmail(email);
            string normalizedTaxId;
            try
            {
                normalizedTaxId = EmployerRequestValidation.NormalizeTaxId(cuit);
            }
            catch (EmployerRequestException)
            {
                return CreateAcceptedPayload();
            }

            User? user = await _context.Users
                .Include(item => item.Account)
                .SingleOrDefaultAsync(
                    item => item.Account.Email == normalizedEmail,
                    cancellationToken);

            if (user is null ||
                !user.IsActive ||
                !user.Account.MagicLinkEnabled ||
                !string.Equals(user.Role, "Empleador", StringComparison.Ordinal))
            {
                return CreateAcceptedPayload();
            }

            bool approvedIdentity = await _context.EmployerRequests
                .AsNoTracking()
                .AnyAsync(
                    request =>
                        request.Status == EmployerRequestStatus.Approved &&
                        request.Email == normalizedEmail &&
                        request.TaxId == normalizedTaxId &&
                        request.ProvisionedUserId == user.Id,
                    cancellationToken);
            if (!approvedIdentity)
                return CreateAcceptedPayload();

            try
            {
                await IssueAndSendMagicLinkAsync(
                    user,
                    "Acceso temporal a OneITB",
                    "Se solicitó un acceso temporal para empleadores en OneITB.",
                    cancellationToken);
            }
            catch (GraphQLException exception) when (
                exception.Errors.Any(error =>
                    error.Code == "AUTH_MAGIC_LINK_DELIVERY_UNAVAILABLE"))
            {
                return CreateAcceptedPayload();
            }

            return CreateAcceptedPayload();
        }

        public async Task SendWelcomeMagicLinkAsync(
            Guid employerRequestId,
            CancellationToken cancellationToken = default)
        {
            EmployerRequest? request = await _context.EmployerRequests
                .Include(item => item.ProvisionedUser!)
                    .ThenInclude(user => user.Account)
                .SingleOrDefaultAsync(
                    item => item.Id == employerRequestId,
                    cancellationToken);
            User? user = request?.ProvisionedUser;
            if (request is null ||
                request.Status != EmployerRequestStatus.Approved ||
                user is null ||
                !user.IsActive ||
                !user.Account.MagicLinkEnabled ||
                !string.Equals(user.Role, "Empleador", StringComparison.Ordinal))
            {
                throw new InvalidOperationException(
                    "La solicitud aprobada no tiene una cuenta de empleador habilitada.");
            }

            await IssueAndSendMagicLinkAsync(
                user,
                "Bienvenida a OneITB para Empresas",
                $"La solicitud de {request.CompanyName} fue aprobada. Ya puedes acceder al Gestor de Ofertas y Postulaciones.",
                cancellationToken);
        }

        public async Task<string> LoginWithMagicLinkAsync(
            string token,
            CancellationToken cancellationToken = default)
        {
            string tokenDigest = ComputeTokenDigest(NormalizeToken(token));
            DateTime utcNow = _timeProvider.GetUtcNow().UtcDateTime;

            MagicLink? magicLink = await _context.MagicLinks
                .AsNoTracking()
                .Include(item => item.Account)
                    .ThenInclude(account => account.User)
                .SingleOrDefaultAsync(
                    item => item.Token == tokenDigest &&
                            !item.IsUsed &&
                            item.ExpiresAt > utcNow,
                    cancellationToken);

            User? user = magicLink?.Account?.User;
            if (magicLink is null ||
                user is null ||
                !user.IsActive ||
                !magicLink.Account.MagicLinkEnabled ||
                !string.Equals(user.Role, "Empleador", StringComparison.Ordinal))
            {
                throw CreateInvalidMagicLinkError();
            }

            bool consumed = await TryConsumeMagicLinkAsync(
                magicLink.Id,
                utcNow,
                cancellationToken);

            if (!consumed)
                throw CreateInvalidMagicLinkError();

            return _jwtTokenService.IssueAccessToken(user);
        }

        private async Task<bool> TryConsumeMagicLinkAsync(
            Guid magicLinkId,
            DateTime utcNow,
            CancellationToken cancellationToken)
        {
            if (_context.Database.IsRelational())
            {
                int affectedRows = await _context.MagicLinks
                    .Where(item => item.Id == magicLinkId &&
                                   !item.IsUsed &&
                                   item.ExpiresAt > utcNow)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(item => item.IsUsed, true),
                        cancellationToken);

                return affectedRows == 1;
            }

            MagicLink? trackedLink = await _context.MagicLinks
                .SingleOrDefaultAsync(
                    item => item.Id == magicLinkId &&
                            !item.IsUsed &&
                            item.ExpiresAt > utcNow,
                    cancellationToken);

            if (trackedLink is null)
                return false;

            trackedLink.IsUsed = true;
            await _context.SaveChangesAsync(cancellationToken);
            return true;
        }

        private static string NormalizeEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email) || email.Length > 256)
                throw CreateInvalidMagicLinkError();

            return email.Trim().ToLowerInvariant();
        }

        private static string NormalizeToken(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
                throw CreateInvalidMagicLinkError();

            string normalized = token.Trim().ToLowerInvariant();
            if (normalized.Length != MagicLinkTokenBytes * 2 ||
                normalized.Any(character => !Uri.IsHexDigit(character)))
            {
                throw CreateInvalidMagicLinkError();
            }

            return normalized;
        }

        private async Task IssueAndSendMagicLinkAsync(
            User user,
            string subject,
            string introduction,
            CancellationToken cancellationToken)
        {
            DateTime utcNow = _timeProvider.GetUtcNow().UtcDateTime;
            await InvalidatePriorLinksAsync(user.Account.Id, cancellationToken);

            string credential = Convert.ToHexString(
                    RandomNumberGenerator.GetBytes(MagicLinkTokenBytes))
                .ToLowerInvariant();
            var magicLink = new MagicLink
            {
                Id = Guid.NewGuid(),
                AccountId = user.Account.Id,
                Token = ComputeTokenDigest(credential),
                ExpiresAt = utcNow.AddMinutes(MagicLinkLifetimeMinutes),
                CreatedAt = utcNow,
                IsUsed = false
            };

            _context.MagicLinks.Add(magicLink);
            await _context.SaveChangesAsync(cancellationToken);

            string loginUrl =
                $"{_deliveryOptions.FrontendBaseUrl}/employer-login#token={credential}";
            string body =
                $"{introduction}\n\n" +
                $"Abrir enlace: {loginUrl}\n\n" +
                $"El enlace vence en {MagicLinkLifetimeMinutes} minutos y puede utilizarse una sola vez.\n" +
                "Si no solicitaste este acceso, ignora este mensaje.";

            try
            {
                await _emailSender.SendAsync(
                    user.Account.Email,
                    subject,
                    body,
                    cancellationToken);
            }
            catch (OperationCanceledException)
            {
                throw;
            }
            catch
            {
                _context.MagicLinks.Remove(magicLink);
                await _context.SaveChangesAsync(cancellationToken);
                throw CreateDeliveryUnavailableError();
            }
        }

        private async Task InvalidatePriorLinksAsync(
            Guid accountId,
            CancellationToken cancellationToken)
        {
            if (_context.Database.IsRelational())
            {
                await _context.MagicLinks
                    .Where(link => link.AccountId == accountId && !link.IsUsed)
                    .ExecuteUpdateAsync(
                        setters => setters.SetProperty(link => link.IsUsed, true),
                        cancellationToken);
                return;
            }

            MagicLink[] links = await _context.MagicLinks
                .Where(link => link.AccountId == accountId && !link.IsUsed)
                .ToArrayAsync(cancellationToken);
            foreach (MagicLink link in links)
                link.IsUsed = true;
        }

        private static GraphQLException CreateInvalidMagicLinkError()
        {
            return new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("No se pudo validar el acceso del empleador.")
                    .SetCode("AUTH_MAGIC_LINK_INVALID")
                    .Build());
        }

        private static string ComputeTokenDigest(string credential)
        {
            byte[] digest = SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes(credential));
            return Convert.ToHexString(digest).ToLowerInvariant();
        }

        private static MagicLinkRequestPayload CreateAcceptedPayload()
        {
            return new MagicLinkRequestPayload(
                true,
                "Si los datos son validos, recibiras un enlace de acceso por correo.");
        }

        private static GraphQLException CreateDeliveryUnavailableError()
        {
            return new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage(
                        "No se pudo procesar el envio del enlace en este momento. Intenta nuevamente mas tarde.")
                    .SetCode("AUTH_MAGIC_LINK_DELIVERY_UNAVAILABLE")
                    .Build());
        }
    }
}
