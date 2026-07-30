using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Types;
using Services.Users;
using Services.Accounts;
using OneITB.Core.Services.Interfaces;
using OneItb.Data;
using OneItb.Entities.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HotChocolate.Subscriptions;
using OneITB.GraphQL.Subscriptions;
using Services.Academic;
using Services.Notifications;
using Services.Siu;
using Services.Jobs;
using Services.Auth;
using OneItb.GraphQL.Infrastructure;
using OneItb.GraphQL.Services.Security;

namespace OneITB.GraphQL.Mutations
{
    internal static class GraphQlRoles
    {
        public const string Administrator = "Administrador";
        public const string Moderator = "Moderador";
        public const string Professor = "Profesor";
        public const string Student = "Estudiante";
        public const string Graduate = "Egresado";
        public const string Employer = "Empleador";
    }

    public class Mutation
    {
        /// <summary>
        /// Resolver blindado contra inyecciones y DoS para el registro de usuarios.
        /// </summary>
        public async Task<UserPayload> RegisterUserAsync(
            RegisterInput input,
            [Service] IUsersService usersService,
            CancellationToken cancellationToken)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            try
            {
                var userDto = await usersService.RegisterAsync(input, cancellationToken);
                return userDto;
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        /// <summary>
        /// Resolver blindado para la autenticación segura (Login).
        /// </summary>
        public async Task<AuthPayload> Login(
            LoginInput input,
            [Service] IAccountService accountService,
            CancellationToken cancellationToken)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            var authResult = await accountService.Login(input, cancellationToken);
            return authResult;
        }

        public async Task<AuthPayload> MicrosoftLogin(
            string accessToken,
            [Service] IMicrosoftEntraAuthService authService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await authService.LoginAsync(
                    accessToken,
                    GetClientSource(httpContextAccessor),
                    httpContextAccessor.HttpContext?
                        .Response
                        .Headers[CorrelationIdMiddleware.HeaderName]
                        .FirstOrDefault(),
                    cancellationToken);
            }
            catch (MicrosoftEntraAuthenticationException exception)
            {
                throw new GraphQLException(
                    ErrorBuilder.New()
                        .SetMessage(exception.Message)
                        .SetCode(exception.Code)
                        .Build());
            }
        }

        [Authorize]
        public async Task<UpdateProfilePayload> UpdateProfile(
            UpdateProfileInput input,
            [Service] IUsersService usersService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
            string? actorRole = GetAuthenticatedRole(httpContextAccessor);
            if (input.Id != actorUserId && actorRole != "Administrador")
                throw new GraphQLException("No se puede editar el perfil de otro usuario.");

            try
            {
                var payload = await usersService.UpdateProfileAsync(input, cancellationToken);
                return payload;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<UserPayload> ToggleProfilePrivacy(
            bool isPublic,
            [Service] IUsersService usersService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
                return await usersService.ToggleProfilePrivacyAsync(
                    actorUserId,
                    isPublic,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator })]
        public async Task<UserPayload> UpdateUserRole(
            Guid userId,
            string newRole,
            string? adminPassword,
            [Service] IUsersService usersService,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
                UserPayload payload = await usersService.UpdateUserRoleAsync(
                    actorUserId,
                    userId,
                    newRole,
                    adminPassword,
                    cancellationToken);
                await moderationService.RecordAuditAsync(
                    actorUserId,
                    "UpdateUserRole",
                    $"Rol actualizado a {newRole}.",
                    targetUserId: userId,
                    cancellationToken: cancellationToken);
                return payload;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator })]
        public async Task<UserPayload> UpdateUserStatus(
            Guid userId,
            bool isActive,
            [Service] IUsersService usersService,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                UserPayload payload = await usersService.UpdateUserStatusAsync(
                    userId,
                    isActive,
                    cancellationToken);
                await moderationService.RecordAuditAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    "UpdateUserStatus",
                    isActive ? "Usuario activado." : "Usuario desactivado.",
                    targetUserId: userId,
                    cancellationToken: cancellationToken);
                return payload;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Moderator })]
        public async Task<UserPayload> SilenceUser(
            Guid userId,
            int hours,
            [Service] IUsersService usersService,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            UserPayload payload = await usersService.SilenceUserAsync(
                userId,
                hours,
                cancellationToken);
            if (payload.Success)
            {
                await moderationService.RecordAuditAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    "SilenceUser",
                    $"Usuario silenciado por {hours} horas.",
                    targetUserId: userId,
                    cancellationToken: cancellationToken);
            }

            return payload;
        }

        public async Task<MagicLinkRequestPayload> RequestMagicLink(
            string email,
            string cuit,
            [Service] IEmployerAuthService authService,
            [Service] IMagicLinkRateLimiter rateLimiter,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] ILogger<Mutation> logger,
            CancellationToken cancellationToken)
        {
            MagicLinkRateLimitDecision decision = await rateLimiter.TryAcquireRequestAsync(
                GetClientSource(httpContextAccessor),
                email,
                cancellationToken);
            EnsureMagicLinkRequestAllowed(decision, "request", logger);
            return await authService.RequestMagicLinkAsync(email, cuit, cancellationToken);
        }

        public async Task<string> LoginWithMagicLink(
            string token,
            [Service] IEmployerAuthService authService,
            [Service] IMagicLinkRateLimiter rateLimiter,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] ILogger<Mutation> logger,
            CancellationToken cancellationToken)
        {
            MagicLinkRateLimitDecision decision = await rateLimiter.TryAcquireRedemptionAsync(
                GetClientSource(httpContextAccessor),
                token,
                cancellationToken);
            EnsureMagicLinkRequestAllowed(decision, "redemption", logger);
            return await authService.LoginWithMagicLinkAsync(token, cancellationToken);
        }

        [Authorize]
        public async Task<CommunityReport> ReportInquiry(
            Guid inquiryId,
            string reason,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            return await moderationService.ReportInquiryAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                inquiryId,
                reason,
                cancellationToken);
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Moderator })]
        public async Task<CommunityReport> UpdateReportStatus(
            Guid reportId,
            string status,
            [Service] OneItbContext context,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            var report = await context.CommunityReports.FindAsync(
                new object[] { reportId },
                cancellationToken);
            if (report == null) throw new GraphQLException("Reporte no encontrado.");
            report.Status = status;
            await context.SaveChangesAsync(cancellationToken);
            await moderationService.RecordAuditAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                "UpdateReportStatus",
                $"Reporte actualizado a {status}.",
                targetReportId: reportId,
                targetInquiryId: report.InquiryId,
                cancellationToken: cancellationToken);
            return report;
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator })]
        public async Task<Subject> AddSubject(
            string name,
            string code,
            int careerId,
            int? year,
            IReadOnlyList<int>? prerequisiteIds,
            [Service] OneItbContext context,
            CancellationToken cancellationToken)
        {
            string normalizedCode = code.Trim().ToUpperInvariant();
            string normalizedName = name.Trim();
            ValidateSubjectYear(year);

            if (await context.Subjects.AnyAsync(
                    subject =>
                        subject.Code == normalizedCode ||
                        subject.Name == normalizedName,
                    cancellationToken))
                throw new GraphQLException("Ya existe una materia con el mismo codigo o nombre.");

            (Career career, List<Subject> prerequisites) = await LoadSubjectAcademicDataAsync(
                context,
                careerId,
                year,
                prerequisiteIds,
                null,
                cancellationToken);

            var subject = new Subject
            {
                Code = normalizedCode,
                Name = normalizedName,
                CareerId = career.Id,
                Career = career,
                Year = year,
                IsActive = true,
                Prerequisites = prerequisites
            };

            context.Subjects.Add(subject);
            await context.SaveChangesAsync(cancellationToken);
            return subject;
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator })]
        public async Task<Subject> UpdateSubject(
            int id,
            string name,
            string code,
            int careerId,
            int? year,
            IReadOnlyList<int>? prerequisiteIds,
            [Service] OneItbContext context,
            CancellationToken cancellationToken)
        {
            var subject = await context.Subjects
                .Include(item => item.Career)
                .Include(item => item.Prerequisites)
                .SingleOrDefaultAsync(item => item.Id == id, cancellationToken);
            if (subject == null) throw new GraphQLException("Materia no encontrada.");

            string normalizedCode = code.Trim().ToUpperInvariant();
            string normalizedName = name.Trim();
            ValidateSubjectYear(year);

            if (await context.Subjects.AnyAsync(
                    item =>
                        item.Id != id &&
                        (item.Code == normalizedCode || item.Name == normalizedName),
                    cancellationToken))
                throw new GraphQLException("Ya existe otra materia con el mismo codigo o nombre.");

            (Career career, List<Subject> prerequisites) = await LoadSubjectAcademicDataAsync(
                context,
                careerId,
                year,
                prerequisiteIds,
                id,
                cancellationToken);

            subject.Code = normalizedCode;
            subject.Name = normalizedName;
            subject.CareerId = career.Id;
            subject.Career = career;
            subject.Year = year;
            subject.Prerequisites.Clear();
            foreach (Subject prerequisite in prerequisites)
                subject.Prerequisites.Add(prerequisite);

            await context.SaveChangesAsync(cancellationToken);
            return subject;
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator })]
        public async Task<Subject> ToggleSubjectStatus(
            int id,
            [Service] OneItbContext context,
            CancellationToken cancellationToken)
        {
            var subject = await context.Subjects.FindAsync(
                new object[] { id },
                cancellationToken);
            if (subject == null) throw new GraphQLException("Materia no encontrada.");
            subject.IsActive = !subject.IsActive;
            await context.SaveChangesAsync(cancellationToken);
            return subject;
        }

        [Authorize]
        public async Task<Inquiry> AddInquiry(
            int subjectId,
            string title,
            string content,
            string? fileUrl,
            IReadOnlyList<SocialAttachmentInput>? attachments,
            bool? preferAttachmentCover,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialService.AddInquiryAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    subjectId,
                    title,
                    content,
                    fileUrl,
                    attachments,
                    preferAttachmentCover ?? false,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize]
        public async Task<Comment> AddComment(
            Guid inquiryId,
            string content,
            Guid? parentCommentId,
            Guid? replyTargetCommentId,
            string? fileUrl,
            IReadOnlyList<SocialAttachmentInput>? attachments,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialService.AddCommentAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    inquiryId,
                    content,
                    parentCommentId,
                    fileUrl,
                    attachments,
                    replyTargetCommentId,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize]
        public async Task<ToggleReactionPayload> ToggleReaction(
            Guid inquiryId,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialService.ToggleReactionAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    inquiryId,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize]
        public async Task<ToggleCommentReactionPayload> ToggleCommentReaction(
            Guid commentId,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            return await socialService.ToggleCommentReactionAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                commentId,
                cancellationToken);
        }

        [Authorize]
        public async Task<IReadOnlyList<Career>> LinkUserToCareers(
            IReadOnlyList<int> careerIds,
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            Guid userId = GetAuthenticatedUserId(httpContextAccessor);
            int[] normalizedIds = careerIds?.Distinct().ToArray() ?? Array.Empty<int>();
            if (normalizedIds.Length == 0)
                throw new GraphQLException("SeleccionÃ¡ al menos una carrera.");

            var careers = await context.Careers
                .Where(career => normalizedIds.Contains(career.Id) && career.IsActive)
                .OrderBy(career => career.Name)
                .ToListAsync(cancellationToken);

            if (careers.Count != normalizedIds.Length)
                throw new GraphQLException("Una o mÃ¡s carreras seleccionadas no existen.");

            var existingLinks = await context.UserCareers
                .Where(link => link.UserId == userId)
                .ToListAsync(cancellationToken);

            context.UserCareers.RemoveRange(existingLinks);
            context.UserCareers.AddRange(careers.Select(career => new UserCareer
            {
                UserId = userId,
                CareerId = career.Id
            }));

            await context.SaveChangesAsync(cancellationToken);
            return careers;
        }

        [Authorize]
        public async Task<Inquiry> EditInquiry(
            Guid inquiryId,
            string newTitle,
            string newContent,
            IReadOnlyList<SocialAttachmentInput>? attachments,
            bool? preferAttachmentCover,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialService.EditInquiryAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    inquiryId,
                    newTitle,
                    newContent,
                    attachments,
                    preferAttachmentCover,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<Inquiry> ToggleInquiryStatus(
            Guid inquiryId,
            [Service] ISocialService socialService,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
                Inquiry inquiry = await socialService.ToggleInquiryStatusAsync(
                    actorUserId,
                    inquiryId,
                    cancellationToken);
                await moderationService.RecordAuditAsync(
                    actorUserId,
                    "ToggleInquiryStatus",
                    inquiry.IsActive ? "Publicacion reactivada." : "Publicacion desactivada.",
                    targetInquiryId: inquiryId,
                    cancellationToken: cancellationToken);
                return inquiry;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<Comment> EditComment(
            Guid commentId,
            string newContent,
            IReadOnlyList<SocialAttachmentInput>? attachments,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialService.EditCommentAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    commentId,
                    newContent,
                    attachments,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<Comment> ToggleCommentStatus(
            Guid commentId,
            [Service] ISocialService socialService,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
                Comment comment = await socialService.ToggleCommentStatusAsync(
                    actorUserId,
                    commentId,
                    cancellationToken);
                await moderationService.RecordAuditAsync(
                    actorUserId,
                    "ToggleCommentStatus",
                    comment.IsActive ? "Comentario reactivado." : "Comentario desactivado.",
                    targetCommentId: commentId,
                    targetInquiryId: comment.InquiryId,
                    cancellationToken: cancellationToken);
                return comment;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Moderator })]
        public async Task<Inquiry> ModerateInquiryVisibility(
            Guid inquiryId,
            bool isHidden,
            string reason,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await moderationService.ModerateInquiryVisibilityAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    inquiryId,
                    isHidden,
                    reason,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Moderator })]
        public async Task<Comment> ModerateCommentVisibility(
            Guid commentId,
            bool isHidden,
            string reason,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await moderationService.ModerateCommentVisibilityAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    commentId,
                    isHidden,
                    reason,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize]
        public async Task<UserInteraction> InteractWithUser(
            Guid targetUserId,
            InteractionType type,
            [Service] ISocialGraphService socialGraphService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialGraphService.SetInteractionAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    targetUserId,
                    type,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize]
        public async Task<FollowStatePayload> FollowUser(
            Guid targetUserId,
            [Service] ISocialGraphService socialGraphService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialGraphService.FollowUserAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    targetUserId,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize]
        public async Task<FollowStatePayload> UnfollowUser(
            Guid targetUserId,
            [Service] ISocialGraphService socialGraphService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialGraphService.UnfollowUserAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    targetUserId,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Professor })]
        public async Task<AcademicResource> AddAcademicResource(
            int subjectId,
            string title,
            string? description,
            AcademicResourceCategory? category,
            int? version,
            string? fileUrl,
            string? externalUrl,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await academicService.AddAcademicResourceAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    subjectId,
                    title,
                    description,
                    category,
                    version,
                    fileUrl,
                    externalUrl,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Professor })]
        public async Task<AcademicResource> UploadAcademicResource(
            int subjectId,
            string title,
            string? description,
            AcademicResourceCategory? category,
            int? version,
            string? fileUrl,
            string? externalUrl,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await academicService.AddAcademicResourceAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    subjectId,
                    title,
                    description,
                    category,
                    version,
                    fileUrl,
                    externalUrl,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Professor })]
        public async Task<AcademicResource> DeleteResource(
            Guid resourceId,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await academicService.DeleteResourceAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    resourceId,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Professor })]
        public async Task<AcademicResource> ToggleAcademicResourceStatus(
            Guid resourceId,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await academicService.ToggleAcademicResourceStatusAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    resourceId,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator, GraphQlRoles.Professor })]
        public async Task<AcademicProgress> UpsertAcademicProgress(
            Guid userId,
            int subjectId,
            decimal? score,
            AcademicProgressStatus status,
            string? notes,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await academicService.UpsertAcademicProgressAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    userId,
                    subjectId,
                    score,
                    status,
                    notes,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Administrator })]
        public async Task<SiuSyncResult> SyncSiuGrades(
            int subjectId,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await academicService.SyncSiuGradesAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    subjectId,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<Notification> MarkNotificationRead(
            Guid notificationId,
            [Service] INotificationService notificationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await notificationService.MarkReadAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    notificationId,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<int> MarkAllNotificationsRead(
            [Service] INotificationService notificationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await notificationService.MarkAllReadAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<NotificationPreference> UpdateNotificationPreference(
            NotificationType type,
            bool isEnabled,
            [Service] INotificationService notificationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await notificationService.UpdatePreferenceAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    type,
                    isEnabled,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Employer, GraphQlRoles.Administrator })]
        public async Task<JobOffer> CreateJobOffer(
            string title,
            string company,
            string description,
            string location,
            [Service] IJobService jobService,
            [Service] INotificationService notificationService,
            [Service] ITopicEventSender eventSender,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] ILogger<Mutation> logger,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid employerId = GetAuthenticatedUserId(httpContextAccessor);
                string? role = GetAuthenticatedRole(httpContextAccessor);
                JobOffer jobOffer = await jobService.CreateJobOfferAsync(
                    employerId,
                    role,
                    title,
                    company,
                    description,
                    location,
                    cancellationToken);

                try
                {
                    await eventSender.SendAsync(JobOfferTopics.Created, jobOffer, cancellationToken);
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    logger.LogWarning(
                        ex,
                        "Job offer {JobOfferId} persisted but real-time publication failed.",
                        jobOffer.Id);
                }

                Guid[] recipients = await jobService.GetJobNotificationRecipientIdsAsync(
                    employerId,
                    cancellationToken);
                await notificationService.CreateNotificationsAsync(
                    recipients,
                    NotificationType.JobOffer,
                    $"Nueva oferta laboral: {jobOffer.Title} en {jobOffer.Company}.",
                    $"/empleos?jobOfferId={jobOffer.Id:D}",
                    cancellationToken);

                return jobOffer;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Student, GraphQlRoles.Graduate })]
        public async Task<JobApplication> ApplyToJob(
            Guid jobOfferId,
            [Service] IJobService jobService,
            [Service] INotificationService notificationService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid applicantId = GetAuthenticatedUserId(httpContextAccessor);
                JobApplication application = await jobService.ApplyToJobAsync(
                    applicantId,
                    GetAuthenticatedRole(httpContextAccessor),
                    jobOfferId,
                    cancellationToken);

                await notificationService.CreateNotificationsAsync(
                    new[] { application.JobOffer.EmployerId },
                    NotificationType.JobApplication,
                    $"{application.Applicant.FirstName} {application.Applicant.LastName} se postulo a {application.JobOffer.Title}.",
                    "/empleos/mis-ofertas",
                    cancellationToken);

                return application;
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize(Roles = new[] { GraphQlRoles.Employer, GraphQlRoles.Administrator })]
        public async Task<JobApplication> UpdateApplicationStatus(
            Guid applicationId,
            JobApplicationStatus status,
            [Service] IJobService jobService,
            [Service] INotificationService notificationService,
            [Service] IEmailSender emailSender,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] ILogger<Mutation> logger,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid actorId = GetAuthenticatedUserId(httpContextAccessor);
                JobApplication application = await jobService.UpdateApplicationStatusAsync(
                    actorId,
                    GetAuthenticatedRole(httpContextAccessor),
                    applicationId,
                    status,
                    cancellationToken);

                string statusLabel = status switch
                {
                    JobApplicationStatus.Reviewed => "revisada",
                    JobApplicationStatus.Rejected => "rechazada",
                    _ => "actualizada"
                };

                await notificationService.CreateNotificationsAsync(
                    new[] { application.ApplicantId },
                    NotificationType.JobApplication,
                    $"Tu postulacion a {application.JobOffer.Title} fue {statusLabel}.",
                    $"/empleos?jobOfferId={application.JobOfferId:D}",
                    cancellationToken);

                if (status is JobApplicationStatus.Reviewed or JobApplicationStatus.Rejected)
                {
                    await TrySendApplicationStatusEmailAsync(
                        application,
                        statusLabel,
                        emailSender,
                        logger,
                        cancellationToken);
                }

                return application;
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize]
        public async Task<Message> SendMessage(
            Guid receiverId,
            string content,
            [Service] IMessagingService messagingService,
            [Service] ITopicEventSender eventSender,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] ILogger<Mutation> logger,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid senderId = GetAuthenticatedUserId(httpContextAccessor);
                Message message = await messagingService.SendMessageAsync(
                    senderId,
                    receiverId,
                    content,
                    cancellationToken);

                try
                {
                    await eventSender.SendAsync(
                        PrivateMessageTopics.ForUser(senderId),
                        message,
                        cancellationToken);
                    await eventSender.SendAsync(
                        PrivateMessageTopics.ForUser(receiverId),
                        message,
                        cancellationToken);
                }
                catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
                {
                    throw;
                }
                catch (Exception ex)
                {
                    logger.LogWarning(
                        ex,
                        "Message {MessageId} persisted but real-time publication failed.",
                        message.Id);
                }

                return message;
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<MarkConversationReadPayload> MarkConversationRead(
            Guid otherUserId,
            [Service] IMessagingService messagingService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await messagingService.MarkConversationReadAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    otherUserId,
                    cancellationToken);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        private static Guid GetAuthenticatedUserId(IHttpContextAccessor httpContextAccessor)
        {
            string? value = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(value, out Guid userId))
                throw new GraphQLException("No se pudo identificar al usuario autenticado.");
            return userId;
        }

        private static string GetClientSource(IHttpContextAccessor httpContextAccessor)
        {
            return httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
                ?? "unknown";
        }

        private static void EnsureMagicLinkRequestAllowed(
            MagicLinkRateLimitDecision decision,
            string operation,
            ILogger<Mutation> logger)
        {
            if (decision.IsAllowed)
                return;

            logger.LogWarning(
                "Magic Link {Operation} rejected by the operation-specific limiter. Reason: {ReasonCode}.",
                operation,
                decision.ReasonCode);
            string code = decision.ReasonCode == "provider-unavailable"
                ? "AUTH_TEMPORARILY_UNAVAILABLE"
                : "AUTH_RATE_LIMITED";
            string message = decision.ReasonCode == "provider-unavailable"
                ? "El acceso temporal no esta disponible en este momento. Intenta nuevamente mas tarde."
                : "Se alcanzo el limite temporal de intentos. Intenta nuevamente mas tarde.";

            IErrorBuilder builder = ErrorBuilder.New()
                .SetMessage(message)
                .SetCode(code);
            if (decision.RetryAfter.HasValue)
            {
                builder.SetExtension(
                    "retryAfterSeconds",
                    Math.Max(1, (int)Math.Ceiling(decision.RetryAfter.Value.TotalSeconds)));
            }

            throw new GraphQLException(builder.Build());
        }

        private static bool CanModerate(IHttpContextAccessor httpContextAccessor)
        {
            string? role = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
            return role is "Administrador" or "Moderador";
        }

        private static string? GetAuthenticatedRole(IHttpContextAccessor httpContextAccessor)
        {
            return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
        }

        private static GraphQLException CreateUserError(string message)
        {
            return new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage(message)
                    .SetCode("USER_ERROR")
                    .Build());
        }

        private static async Task TrySendApplicationStatusEmailAsync(
            JobApplication application,
            string statusLabel,
            IEmailSender emailSender,
            ILogger<Mutation> logger,
            CancellationToken cancellationToken)
        {
            string? recipient = application.Applicant.Account?.Email;
            if (string.IsNullOrWhiteSpace(recipient))
            {
                logger.LogWarning(
                    "Application {ApplicationId} changed status but applicant email is missing.",
                    application.Id);
                return;
            }

            string applicantName = $"{application.Applicant.FirstName} {application.Applicant.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(applicantName))
                applicantName = "postulante";

            string subject = "Actualizacion de tu postulacion en OneITB";
            string body = BuildApplicationStatusEmailBody(application, applicantName, statusLabel);

            try
            {
                await emailSender.SendAsync(recipient, subject, body, cancellationToken);
            }
            catch (OperationCanceledException) when (cancellationToken.IsCancellationRequested)
            {
                throw;
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "Application {ApplicationId} status changed but email delivery failed.",
                    application.Id);
            }
        }

        private static string BuildApplicationStatusEmailBody(
            JobApplication application,
            string applicantName,
            string statusLabel)
        {
            return
                $"Hola {applicantName},\n\n" +
                "Tu postulacion en OneITB cambio de estado.\n\n" +
                $"Oferta: {application.JobOffer.Title}\n" +
                $"Empresa: {application.JobOffer.Company}\n" +
                $"Estado actual: {statusLabel}\n\n" +
                "Podes revisar el detalle desde la seccion Empleos de la plataforma.\n\n" +
                "Equipo OneITB";
        }

        private static void ValidateSubjectYear(int? year)
        {
            if (year.HasValue && (year.Value < 1 || year.Value > 6))
                throw new GraphQLException("El anio de cursada debe estar entre 1 y 6.");
        }

        private static async Task<(Career Career, List<Subject> Prerequisites)> LoadSubjectAcademicDataAsync(
            OneItbContext context,
            int careerId,
            int? year,
            IReadOnlyList<int>? prerequisiteIds,
            int? subjectId,
            CancellationToken cancellationToken)
        {
            ValidateSubjectYear(year);

            Career career = await context.Careers
                .SingleOrDefaultAsync(
                    item => item.Id == careerId && item.IsActive,
                    cancellationToken)
                ?? throw new GraphQLException("La carrera seleccionada no existe o esta inactiva.");

            int[] normalizedIds = prerequisiteIds?
                .Distinct()
                .ToArray() ?? Array.Empty<int>();

            if (subjectId.HasValue && normalizedIds.Contains(subjectId.Value))
                throw new GraphQLException("Una materia no puede ser correlativa de si misma.");

            List<Subject> prerequisites = await context.Subjects
                .Where(item => normalizedIds.Contains(item.Id) && item.IsActive && item.CareerId == careerId)
                .OrderBy(item => item.Name)
                .ToListAsync(cancellationToken);

            if (prerequisites.Count != normalizedIds.Length)
                throw new GraphQLException("Todas las correlativas deben existir, estar activas y pertenecer a la carrera seleccionada.");

            return (career, prerequisites);
        }
    }
}
