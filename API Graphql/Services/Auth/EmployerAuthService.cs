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

namespace Services.Auth
{
    public sealed class EmployerAuthService : IEmployerAuthService
    {
        private const int MagicLinkLifetimeMinutes = 15;
        private const int MagicLinkTokenBytes = 32;

        private readonly OneItbContext _context;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IEmailSender _emailSender;
        private readonly MagicLinkDeliveryOptions _deliveryOptions;
        private readonly TimeProvider _timeProvider;

        public EmployerAuthService(
            OneItbContext context,
            IJwtTokenService jwtTokenService,
            IPasswordHasher passwordHasher,
            IEmailSender emailSender,
            MagicLinkDeliveryOptions deliveryOptions,
            TimeProvider timeProvider)
        {
            _context = context;
            _jwtTokenService = jwtTokenService;
            _passwordHasher = passwordHasher;
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
            ValidateCuit(cuit);

            User? user = await _context.Users
                .Include(item => item.Account)
                .SingleOrDefaultAsync(
                    item => item.Account.Email == normalizedEmail,
                    cancellationToken);

            if (user is null)
            {
                Guid userId = Guid.NewGuid();
                var account = new Account
                {
                    Id = userId,
                    Email = normalizedEmail,
                    PasswordHash = _passwordHasher.Hash(
                        Convert.ToHexString(RandomNumberGenerator.GetBytes(32))),
                    CreatedAt = _timeProvider.GetUtcNow().UtcDateTime
                };

                user = new User
                {
                    Id = userId,
                    FirstName = "Empresa",
                    LastName = "Empleadora",
                    Role = "Empleador",
                    IsActive = true,
                    Account = account
                };
                account.User = user;

                _context.Users.Add(user);
                await _context.SaveChangesAsync(cancellationToken);
            }
            else if (!user.IsActive ||
                     !string.Equals(user.Role, "Empleador", StringComparison.Ordinal))
            {
                return CreateAcceptedPayload();
            }

            DateTime utcNow = _timeProvider.GetUtcNow().UtcDateTime;
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
            const string subject = "Acceso temporal a OneITB";
            string body =
                "Se solicito un acceso temporal para empleadores en OneITB.\n\n" +
                $"Abrir enlace: {loginUrl}\n\n" +
                $"El enlace vence en {MagicLinkLifetimeMinutes} minutos y puede utilizarse una sola vez.\n" +
                "Si no solicitaste este acceso, ignora este mensaje.";

            try
            {
                await _emailSender.SendAsync(
                    normalizedEmail,
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

            return CreateAcceptedPayload();
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

        private static void ValidateCuit(string cuit)
        {
            if (string.IsNullOrWhiteSpace(cuit) ||
                cuit.Length != 11 ||
                !cuit.All(char.IsDigit))
            {
                throw CreateInvalidMagicLinkError();
            }
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
