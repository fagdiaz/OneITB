using System;
using System.Data;
using System.Linq;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.EmployerOnboarding
{
    public sealed class EmployerRequestService : IEmployerRequestService
    {
        private const string EmployerRole = "Empleador";
        private const string GenericSubmissionMessage =
            "Recibimos la solicitud. Si los datos cumplen los requisitos, el equipo de OneITB se comunicará por correo.";

        private readonly OneItbContext _context;
        private readonly TimeProvider _timeProvider;

        public EmployerRequestService(
            OneItbContext context,
            TimeProvider timeProvider)
        {
            _context = context;
            _timeProvider = timeProvider;
        }

        public async Task<EmployerRequestSubmissionPayload> SubmitAsync(
            EmployerRequestInput input,
            CancellationToken cancellationToken = default)
        {
            Guid publicReference = Guid.NewGuid();

            if (!string.IsNullOrWhiteSpace(input.Website))
                return CreateAcceptedSubmission(publicReference);

            NormalizedEmployerRequest normalized = EmployerRequestValidation.Normalize(input);

            bool conflicts = await _context.Accounts
                .AsNoTracking()
                .AnyAsync(account => account.Email == normalized.Email, cancellationToken);

            conflicts = conflicts || await _context.EmployerRequests
                .AsNoTracking()
                .AnyAsync(
                    request =>
                        (request.Email == normalized.Email || request.TaxId == normalized.TaxId) &&
                        (request.Status == EmployerRequestStatus.Pending ||
                         request.Status == EmployerRequestStatus.Approved),
                    cancellationToken);

            if (conflicts)
                return CreateAcceptedSubmission(publicReference);

            DateTime utcNow = UtcNow();
            var request = new EmployerRequest
            {
                Id = publicReference,
                CompanyName = normalized.CompanyName,
                ContactName = normalized.ContactName,
                Email = normalized.Email,
                Phone = normalized.Phone,
                TaxId = normalized.TaxId,
                Comments = normalized.Comments,
                Status = EmployerRequestStatus.Pending,
                CreatedAt = utcNow,
                PrivacyConsentAt = utcNow,
                EmailDeliveryStatus = EmployerEmailDeliveryStatus.NotRequested
            };

            _context.EmployerRequests.Add(request);

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException)
            {
                _context.Entry(request).State = EntityState.Detached;
            }

            return CreateAcceptedSubmission(publicReference);
        }

        public async Task<EmployerRequestPage> GetPageAsync(
            EmployerRequestStatus? status,
            int first,
            int offset,
            CancellationToken cancellationToken = default)
        {
            int take = Math.Clamp(first, 1, 50);
            int skip = Math.Max(offset, 0);
            IQueryable<EmployerRequest> query = _context.EmployerRequests.AsNoTracking();

            if (status.HasValue)
                query = query.Where(request => request.Status == status.Value);

            int totalCount = await query.CountAsync(cancellationToken);
            EmployerRequest[] items = await query
                .OrderByDescending(request => request.CreatedAt)
                .ThenByDescending(request => request.Id)
                .Skip(skip)
                .Take(take)
                .ToArrayAsync(cancellationToken);
            int nextOffset = skip + items.Length;

            return new EmployerRequestPage(
                items,
                totalCount,
                nextOffset < totalCount,
                nextOffset < totalCount ? nextOffset : null);
        }

        public async Task<EmployerRequestActionPayload> ApproveAsync(
            Guid requestId,
            Guid adminUserId,
            string? correlationId,
            CancellationToken cancellationToken = default)
        {
            await using IDbContextTransaction? transaction =
                await BeginSerializableTransactionAsync(cancellationToken);

            EmployerRequest request = await GetTrackedRequestAsync(requestId, cancellationToken);

            if (request.Status == EmployerRequestStatus.Approved)
            {
                await CommitAsync(transaction, cancellationToken);
                return new EmployerRequestActionPayload(
                    request,
                    false,
                    request.EmailDeliveryStatus,
                    "La solicitud ya estaba aprobada.");
            }

            if (request.Status != EmployerRequestStatus.Pending)
                throw AlreadyProcessed();

            bool accountExists = await _context.Accounts
                .AnyAsync(account => account.Email == request.Email, cancellationToken);
            if (accountExists)
            {
                throw new EmployerRequestException(
                    "EMPLOYER_REQUEST_ACCOUNT_CONFLICT",
                    "No se pudo aprovisionar la cuenta porque el correo ya está registrado.");
            }

            DateTime utcNow = UtcNow();
            Guid userId = Guid.NewGuid();
            (string firstName, string lastName) = SplitContactName(request.ContactName);

            var account = new Account
            {
                Id = userId,
                Email = request.Email,
                PasswordHash = null,
                MagicLinkEnabled = true,
                CreatedAt = utcNow
            };
            var user = new User
            {
                Id = userId,
                FirstName = firstName,
                LastName = lastName,
                Role = EmployerRole,
                IsActive = true,
                IsPublicProfile = true,
                Account = account
            };
            account.User = user;

            request.Status = EmployerRequestStatus.Approved;
            request.ProcessedAt = utcNow;
            request.ProcessedByAdminId = adminUserId;
            request.ProvisionedUserId = userId;
            request.RejectionReason = null;
            request.EmailDeliveryStatus = EmployerEmailDeliveryStatus.Pending;

            _context.Users.Add(user);
            _context.EmployerOnboardingOutboxMessages.Add(new EmployerOnboardingOutboxMessage
            {
                Id = Guid.NewGuid(),
                EmployerRequestId = request.Id,
                Status = EmployerOutboxStatus.Pending,
                CreatedAt = utcNow,
                NextAttemptAt = utcNow
            });
            AddAudit(
                adminUserId,
                correlationId,
                "ApproveEmployerRequest",
                request.Id,
                new { Status = "Approved", ProvisionedRole = EmployerRole },
                utcNow);

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                await CommitAsync(transaction, cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                await RollbackAsync(transaction, cancellationToken);
                throw ConcurrentUpdate();
            }
            catch (DbUpdateException)
            {
                await RollbackAsync(transaction, cancellationToken);
                throw new EmployerRequestException(
                    "EMPLOYER_REQUEST_APPROVAL_CONFLICT",
                    "La solicitud no pudo aprobarse porque sus datos fueron procesados en otra operación.");
            }

            return new EmployerRequestActionPayload(
                request,
                true,
                request.EmailDeliveryStatus,
                "Cuenta de empleador creada. El correo de bienvenida quedó pendiente de entrega.");
        }

        public async Task<EmployerRequestActionPayload> RejectAsync(
            Guid requestId,
            string reason,
            Guid adminUserId,
            string? correlationId,
            CancellationToken cancellationToken = default)
        {
            string normalizedReason = NormalizeReason(reason);
            EmployerRequest request = await GetTrackedRequestAsync(requestId, cancellationToken);

            if (request.Status == EmployerRequestStatus.Rejected)
            {
                return new EmployerRequestActionPayload(
                    request,
                    false,
                    request.EmailDeliveryStatus,
                    "La solicitud ya estaba rechazada.");
            }

            if (request.Status != EmployerRequestStatus.Pending)
                throw AlreadyProcessed();

            DateTime utcNow = UtcNow();
            request.Status = EmployerRequestStatus.Rejected;
            request.RejectionReason = normalizedReason;
            request.ProcessedAt = utcNow;
            request.ProcessedByAdminId = adminUserId;
            AddAudit(
                adminUserId,
                correlationId,
                "RejectEmployerRequest",
                request.Id,
                new { Status = "Rejected", ReasonProvided = true },
                utcNow);

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw ConcurrentUpdate();
            }

            return new EmployerRequestActionPayload(
                request,
                false,
                request.EmailDeliveryStatus,
                "Solicitud rechazada.");
        }

        public async Task<EmployerRequestActionPayload> ResendWelcomeAsync(
            Guid requestId,
            Guid adminUserId,
            string? correlationId,
            CancellationToken cancellationToken = default)
        {
            EmployerRequest request = await GetTrackedRequestAsync(requestId, cancellationToken);
            if (request.Status != EmployerRequestStatus.Approved ||
                !request.ProvisionedUserId.HasValue)
            {
                throw new EmployerRequestException(
                    "EMPLOYER_REQUEST_NOT_APPROVED",
                    "Solo se puede reenviar el acceso de una solicitud aprobada.");
            }

            EmployerOnboardingOutboxMessage? outbox = await _context
                .EmployerOnboardingOutboxMessages
                .SingleOrDefaultAsync(
                    message => message.EmployerRequestId == request.Id,
                    cancellationToken);
            DateTime utcNow = UtcNow();

            if (outbox is null)
            {
                outbox = new EmployerOnboardingOutboxMessage
                {
                    Id = Guid.NewGuid(),
                    EmployerRequestId = request.Id,
                    CreatedAt = utcNow
                };
                _context.EmployerOnboardingOutboxMessages.Add(outbox);
            }

            outbox.Status = EmployerOutboxStatus.Pending;
            outbox.NextAttemptAt = utcNow;
            outbox.LeaseExpiresAt = null;
            outbox.ProcessedAt = null;
            outbox.Attempts = 0;
            outbox.LastErrorCode = null;
            request.EmailDeliveryStatus = EmployerEmailDeliveryStatus.Pending;

            AddAudit(
                adminUserId,
                correlationId,
                "ResendEmployerWelcome",
                request.Id,
                new { DeliveryStatus = "Pending" },
                utcNow);

            try
            {
                await _context.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateConcurrencyException)
            {
                throw ConcurrentUpdate();
            }

            return new EmployerRequestActionPayload(
                request,
                false,
                request.EmailDeliveryStatus,
                "El reenvío quedó pendiente de entrega.");
        }

        private async Task<EmployerRequest> GetTrackedRequestAsync(
            Guid requestId,
            CancellationToken cancellationToken)
        {
            EmployerRequest? request = await _context.EmployerRequests
                .SingleOrDefaultAsync(item => item.Id == requestId, cancellationToken);
            return request ?? throw new EmployerRequestException(
                "EMPLOYER_REQUEST_NOT_FOUND",
                "No se encontró la solicitud de empleador.");
        }

        private void AddAudit(
            Guid adminUserId,
            string? correlationId,
            string action,
            Guid requestId,
            object values,
            DateTime utcNow)
        {
            _context.AuditLogs.Add(new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorUserId = adminUserId,
                CorrelationId = string.IsNullOrWhiteSpace(correlationId)
                    ? null
                    : correlationId[..Math.Min(correlationId.Length, 120)],
                Action = action,
                EntityName = nameof(EmployerRequest),
                EntityId = requestId.ToString("D"),
                NewValuesJson = JsonSerializer.Serialize(values),
                CreatedAt = utcNow
            });
        }

        private async Task<IDbContextTransaction?> BeginSerializableTransactionAsync(
            CancellationToken cancellationToken)
        {
            return _context.Database.IsRelational()
                ? await _context.Database.BeginTransactionAsync(
                    IsolationLevel.Serializable,
                    cancellationToken)
                : null;
        }

        private static Task CommitAsync(
            IDbContextTransaction? transaction,
            CancellationToken cancellationToken)
        {
            return transaction is null
                ? Task.CompletedTask
                : transaction.CommitAsync(cancellationToken);
        }

        private static Task RollbackAsync(
            IDbContextTransaction? transaction,
            CancellationToken cancellationToken)
        {
            return transaction is null
                ? Task.CompletedTask
                : transaction.RollbackAsync(cancellationToken);
        }

        private DateTime UtcNow() => _timeProvider.GetUtcNow().UtcDateTime;

        private static EmployerRequestSubmissionPayload CreateAcceptedSubmission(Guid id)
        {
            return new EmployerRequestSubmissionPayload(
                true,
                id.ToString("N")[..10].ToUpperInvariant(),
                GenericSubmissionMessage);
        }

        private static (string FirstName, string LastName) SplitContactName(string contactName)
        {
            string[] parts = contactName.Split(
                ' ',
                StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
            return parts.Length switch
            {
                0 => ("Contacto", "Empresa"),
                1 => (parts[0], "Empresa"),
                _ => (parts[0], string.Join(' ', parts.Skip(1)))
            };
        }

        private static string NormalizeReason(string reason)
        {
            if (string.IsNullOrWhiteSpace(reason))
            {
                throw new EmployerRequestException(
                    "EMPLOYER_REQUEST_REASON_REQUIRED",
                    "Debes indicar un motivo de rechazo.");
            }

            string normalized = reason.Trim();
            if (normalized.Length > 500)
            {
                throw new EmployerRequestException(
                    "EMPLOYER_REQUEST_REASON_TOO_LONG",
                    "El motivo no puede superar 500 caracteres.");
            }

            return normalized;
        }

        private static EmployerRequestException AlreadyProcessed()
        {
            return new EmployerRequestException(
                "EMPLOYER_REQUEST_ALREADY_PROCESSED",
                "La solicitud ya fue procesada.");
        }

        private static EmployerRequestException ConcurrentUpdate()
        {
            return new EmployerRequestException(
                "EMPLOYER_REQUEST_CONCURRENT_UPDATE",
                "La solicitud cambió durante la operación. Actualiza la lista e intenta nuevamente.");
        }
    }
}
