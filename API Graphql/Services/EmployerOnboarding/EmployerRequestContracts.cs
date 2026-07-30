using System;
using System.Collections.Generic;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public sealed record EmployerRequestInput(
        string CompanyName,
        string ContactName,
        string Email,
        string Phone,
        string TaxId,
        string? Comments,
        bool PrivacyConsent,
        string? Website);

    public sealed record EmployerRequestSubmissionPayload(
        bool Accepted,
        string ReferenceCode,
        string Message);

    public sealed record EmployerRequestActionPayload(
        EmployerRequest Request,
        bool AccountCreated,
        EmployerEmailDeliveryStatus EmailDeliveryStatus,
        string Message);

    public sealed record EmployerRequestPage(
        IReadOnlyList<EmployerRequest> Items,
        int TotalCount,
        bool HasNextPage,
        int? NextOffset);

    public sealed class EmployerRequestException : InvalidOperationException
    {
        public EmployerRequestException(string code, string message)
            : base(message)
        {
            Code = code;
        }

        public string Code { get; }
    }

    public interface IEmployerRequestService
    {
        Task<EmployerRequestSubmissionPayload> SubmitAsync(
            EmployerRequestInput input,
            CancellationToken cancellationToken = default);

        Task<EmployerRequestPage> GetPageAsync(
            EmployerRequestStatus? status,
            int first,
            int offset,
            CancellationToken cancellationToken = default);

        Task<EmployerRequestActionPayload> ApproveAsync(
            Guid requestId,
            Guid adminUserId,
            string? correlationId,
            CancellationToken cancellationToken = default);

        Task<EmployerRequestActionPayload> RejectAsync(
            Guid requestId,
            string reason,
            Guid adminUserId,
            string? correlationId,
            CancellationToken cancellationToken = default);

        Task<EmployerRequestActionPayload> ResendWelcomeAsync(
            Guid requestId,
            Guid adminUserId,
            string? correlationId,
            CancellationToken cancellationToken = default);
    }
}
