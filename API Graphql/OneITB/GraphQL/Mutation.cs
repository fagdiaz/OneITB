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
using OneItb.GraphQL.Services.Email;

namespace OneITB.GraphQL.Mutations
{
    public class Mutation
    {
        /// <summary>
        /// Resolver blindado contra inyecciones y DoS para el registro de usuarios.
        /// </summary>
        public async Task<UserPayload> RegisterUserAsync(
            RegisterInput input,
            [Service] IUsersService usersService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            try
            {
                var userDto = await usersService.RegisterAsync(input);
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
            [Service] IAccountService accountService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            var authResult = await accountService.Login(input);
            return authResult;
        }

        [Authorize]
        public async Task<UpdateProfilePayload> UpdateProfile(
            UpdateProfileInput input,
            [Service] IUsersService usersService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
            string? actorRole = GetAuthenticatedRole(httpContextAccessor);
            if (input.Id != actorUserId && actorRole != "Administrador")
                throw new GraphQLException("No se puede editar el perfil de otro usuario.");

            try
            {
                var payload = await usersService.UpdateProfileAsync(input);
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
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
                return await usersService.ToggleProfilePrivacyAsync(actorUserId, isPublic);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<UserPayload> UpdateUserRole(
            Guid userId,
            string newRole,
            string? adminPassword,
            [Service] IUsersService usersService,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
                UserPayload payload = await usersService.UpdateUserRoleAsync(
                    actorUserId,
                    userId,
                    newRole,
                    adminPassword);
                await moderationService.RecordAuditAsync(
                    actorUserId,
                    "UpdateUserRole",
                    $"Rol actualizado a {newRole}.",
                    targetUserId: userId);
                return payload;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<UserPayload> UpdateUserStatus(
            Guid userId,
            bool isActive,
            [Service] IUsersService usersService,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                UserPayload payload = await usersService.UpdateUserStatusAsync(userId, isActive);
                await moderationService.RecordAuditAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    "UpdateUserStatus",
                    isActive ? "Usuario activado." : "Usuario desactivado.",
                    targetUserId: userId);
                return payload;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { "Administrador", "Moderador" })]
        public async Task<UserPayload> SilenceUser(
            Guid userId,
            int hours,
            [Service] IUsersService usersService,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            UserPayload payload = await usersService.SilenceUserAsync(userId, hours);
            if (payload.Success)
            {
                await moderationService.RecordAuditAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    "SilenceUser",
                    $"Usuario silenciado por {hours} horas.",
                    targetUserId: userId);
            }

            return payload;
        }

        public async Task<string> RequestMagicLink(string email, string cuit, [Service] IEmployerAuthService authService)
        {
            return await authService.RequestMagicLinkAsync(email, cuit);
        }

        public async Task<string> LoginWithMagicLink(string token, [Service] IEmployerAuthService authService)
        {
            return await authService.LoginWithMagicLinkAsync(token);
        }

        [Authorize]
        public async Task<CommunityReport> ReportInquiry(
            Guid inquiryId,
            string reason,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await moderationService.ReportInquiryAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                inquiryId,
                reason);
        }

        [Authorize(Roles = new[] { "Administrador", "Moderador" })]
        public async Task<CommunityReport> UpdateReportStatus(
            Guid reportId,
            string status,
            [Service] OneItbContext context,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            var report = await context.CommunityReports.FindAsync(reportId);
            if (report == null) throw new GraphQLException("Reporte no encontrado.");
            report.Status = status;
            await context.SaveChangesAsync();
            await moderationService.RecordAuditAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                "UpdateReportStatus",
                $"Reporte actualizado a {status}.",
                targetReportId: reportId,
                targetInquiryId: report.InquiryId);
            return report;
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<Subject> AddSubject(
            string name,
            string code,
            int careerId,
            int? year,
            IReadOnlyList<int>? prerequisiteIds,
            [Service] OneItbContext context)
        {
            string normalizedCode = code.Trim().ToUpperInvariant();
            string normalizedName = name.Trim();
            ValidateSubjectYear(year);

            if (await context.Subjects.AnyAsync(subject =>
                subject.Code == normalizedCode || subject.Name == normalizedName))
                throw new GraphQLException("Ya existe una materia con el mismo codigo o nombre.");

            (Career career, List<Subject> prerequisites) = await LoadSubjectAcademicDataAsync(
                context,
                careerId,
                year,
                prerequisiteIds,
                null);

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
            await context.SaveChangesAsync();
            return subject;
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<Subject> UpdateSubject(
            int id,
            string name,
            string code,
            int careerId,
            int? year,
            IReadOnlyList<int>? prerequisiteIds,
            [Service] OneItbContext context)
        {
            var subject = await context.Subjects
                .Include(item => item.Career)
                .Include(item => item.Prerequisites)
                .SingleOrDefaultAsync(item => item.Id == id);
            if (subject == null) throw new GraphQLException("Materia no encontrada.");

            string normalizedCode = code.Trim().ToUpperInvariant();
            string normalizedName = name.Trim();
            ValidateSubjectYear(year);

            if (await context.Subjects.AnyAsync(item =>
                item.Id != id && (item.Code == normalizedCode || item.Name == normalizedName)))
                throw new GraphQLException("Ya existe otra materia con el mismo codigo o nombre.");

            (Career career, List<Subject> prerequisites) = await LoadSubjectAcademicDataAsync(
                context,
                careerId,
                year,
                prerequisiteIds,
                id);

            subject.Code = normalizedCode;
            subject.Name = normalizedName;
            subject.CareerId = career.Id;
            subject.Career = career;
            subject.Year = year;
            subject.Prerequisites.Clear();
            foreach (Subject prerequisite in prerequisites)
                subject.Prerequisites.Add(prerequisite);

            await context.SaveChangesAsync();
            return subject;
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<Subject> ToggleSubjectStatus(
            int id,
            [Service] OneItbContext context)
        {
            var subject = await context.Subjects.FindAsync(id);
            if (subject == null) throw new GraphQLException("Materia no encontrada.");
            subject.IsActive = !subject.IsActive;
            await context.SaveChangesAsync();
            return subject;
        }

        [Authorize]
        public async Task<Inquiry> AddInquiry(
            int subjectId,
            string title,
            string content,
            string? fileUrl,
            IReadOnlyList<SocialAttachmentInput>? attachments,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await socialService.AddInquiryAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                subjectId,
                title,
                content,
                fileUrl,
                attachments);
        }

        [Authorize]
        public async Task<Comment> AddComment(
            Guid inquiryId,
            string content,
            Guid? parentCommentId,
            string? fileUrl,
            IReadOnlyList<SocialAttachmentInput>? attachments,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await socialService.AddCommentAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                inquiryId,
                content,
                parentCommentId,
                fileUrl,
                attachments);
        }

        [Authorize]
        public async Task<ToggleReactionPayload> ToggleReaction(
            Guid inquiryId,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await socialService.ToggleReactionAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                inquiryId);
        }

        [Authorize]
        public async Task<ToggleCommentReactionPayload> ToggleCommentReaction(
            Guid commentId,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await socialService.ToggleCommentReactionAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                commentId);
        }

        [Authorize]
        public async Task<IReadOnlyList<Career>> LinkUserToCareers(
            IReadOnlyList<int> careerIds,
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid userId = GetAuthenticatedUserId(httpContextAccessor);
            int[] normalizedIds = careerIds?.Distinct().ToArray() ?? Array.Empty<int>();
            if (normalizedIds.Length == 0)
                throw new GraphQLException("SeleccionÃ¡ al menos una carrera.");

            var careers = await context.Careers
                .Where(career => normalizedIds.Contains(career.Id) && career.IsActive)
                .OrderBy(career => career.Name)
                .ToListAsync();

            if (careers.Count != normalizedIds.Length)
                throw new GraphQLException("Una o mÃ¡s carreras seleccionadas no existen.");

            var existingLinks = await context.UserCareers
                .Where(link => link.UserId == userId)
                .ToListAsync();

            context.UserCareers.RemoveRange(existingLinks);
            context.UserCareers.AddRange(careers.Select(career => new UserCareer
            {
                UserId = userId,
                CareerId = career.Id
            }));

            await context.SaveChangesAsync();
            return careers;
        }

        [Authorize]
        public async Task<Inquiry> EditInquiry(
            Guid inquiryId,
            string newTitle,
            string newContent,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await socialService.EditInquiryAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    CanModerate(httpContextAccessor),
                    inquiryId,
                    newTitle,
                    newContent);
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
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
                Inquiry inquiry = await socialService.ToggleInquiryStatusAsync(
                    actorUserId,
                    CanModerate(httpContextAccessor),
                    inquiryId);
                await moderationService.RecordAuditAsync(
                    actorUserId,
                    "ToggleInquiryStatus",
                    inquiry.IsActive ? "Publicacion reactivada." : "Publicacion desactivada.",
                    targetInquiryId: inquiryId);
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
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await socialService.EditCommentAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    CanModerate(httpContextAccessor),
                    commentId,
                    newContent);
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
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                Guid actorUserId = GetAuthenticatedUserId(httpContextAccessor);
                Comment comment = await socialService.ToggleCommentStatusAsync(
                    actorUserId,
                    CanModerate(httpContextAccessor),
                    commentId);
                await moderationService.RecordAuditAsync(
                    actorUserId,
                    "ToggleCommentStatus",
                    comment.IsActive ? "Comentario reactivado." : "Comentario desactivado.",
                    targetCommentId: commentId,
                    targetInquiryId: comment.InquiryId);
                return comment;
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<UserInteraction> InteractWithUser(
            Guid targetUserId,
            InteractionType type,
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid observerId = GetAuthenticatedUserId(httpContextAccessor);
            if (observerId == targetUserId)
                throw new GraphQLException("No podÃ©s interactuar socialmente con tu propio usuario.");

            bool targetExists = await context.Users.AnyAsync(user => user.Id == targetUserId && user.IsActive);
            if (!targetExists)
                throw new GraphQLException("Usuario objetivo no encontrado.");

            UserInteraction? interaction = await context.UserInteractions
                .SingleOrDefaultAsync(item => item.ObserverId == observerId && item.TargetId == targetUserId);

            if (interaction is null)
            {
                interaction = new UserInteraction
                {
                    Id = Guid.NewGuid(),
                    ObserverId = observerId,
                    TargetId = targetUserId,
                    Type = type,
                    CreatedAt = DateTime.UtcNow
                };
                context.UserInteractions.Add(interaction);
            }
            else
            {
                interaction.Type = type;
                interaction.CreatedAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();
            return interaction;
        }

        [Authorize(Roles = new[] { "Administrador", "Profesor" })]
        public async Task<AcademicResource> AddAcademicResource(
            int subjectId,
            string title,
            string? description,
            AcademicResourceCategory? category,
            int? version,
            string? fileUrl,
            string? externalUrl,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
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
                    externalUrl);
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
        public async Task<AcademicResource> UploadAcademicResource(
            int subjectId,
            string title,
            string? description,
            AcademicResourceCategory? category,
            int? version,
            string? fileUrl,
            string? externalUrl,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
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
                    externalUrl);
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
        public async Task<AcademicResource> DeleteResource(
            Guid resourceId,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await academicService.DeleteResourceAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    resourceId);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { "Administrador", "Profesor" })]
        public async Task<AcademicResource> ToggleAcademicResourceStatus(
            Guid resourceId,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await academicService.ToggleAcademicResourceStatusAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    resourceId);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { "Administrador", "Profesor" })]
        public async Task<AcademicProgress> UpsertAcademicProgress(
            Guid userId,
            int subjectId,
            decimal? score,
            AcademicProgressStatus status,
            string? notes,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
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
                    notes);
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

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<SiuSyncResult> SyncSiuGrades(
            int subjectId,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await academicService.SyncSiuGradesAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    subjectId);
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
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await notificationService.MarkReadAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    notificationId);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<int> MarkAllNotificationsRead(
            [Service] INotificationService notificationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await notificationService.MarkAllReadAsync(
                    GetAuthenticatedUserId(httpContextAccessor));
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
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await notificationService.UpdatePreferenceAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    type,
                    isEnabled);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
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
                    "/empleos");

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

        [Authorize]
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
                    "/empleos/mis-ofertas");

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
                    "/empleos");

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
            [Service] ILogger<Mutation> logger)
        {
            try
            {
                Guid senderId = GetAuthenticatedUserId(httpContextAccessor);
                Message message = await messagingService.SendMessageAsync(senderId, receiverId, content);

                try
                {
                    await eventSender.SendAsync(PrivateMessageTopics.ForUser(senderId), message);
                    await eventSender.SendAsync(PrivateMessageTopics.ForUser(receiverId), message);
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
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await messagingService.MarkConversationReadAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    otherUserId);
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
            int? subjectId)
        {
            ValidateSubjectYear(year);

            Career career = await context.Careers
                .SingleOrDefaultAsync(item => item.Id == careerId && item.IsActive)
                ?? throw new GraphQLException("La carrera seleccionada no existe o esta inactiva.");

            int[] normalizedIds = prerequisiteIds?
                .Distinct()
                .ToArray() ?? Array.Empty<int>();

            if (subjectId.HasValue && normalizedIds.Contains(subjectId.Value))
                throw new GraphQLException("Una materia no puede ser correlativa de si misma.");

            List<Subject> prerequisites = await context.Subjects
                .Where(item => normalizedIds.Contains(item.Id) && item.IsActive && item.CareerId == careerId)
                .OrderBy(item => item.Name)
                .ToListAsync();

            if (prerequisites.Count != normalizedIds.Length)
                throw new GraphQLException("Todas las correlativas deben existir, estar activas y pertenecer a la carrera seleccionada.");

            return (career, prerequisites);
        }
    }
}
