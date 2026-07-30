using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Authorization;
using HotChocolate.Types;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Services.LinkPreviews;
using Services.Social;
using Services.Academic;
using Services.Notifications;
using Services.Jobs;

namespace GraphQL.GraphQL
{
    public class Query
    {
        [Authorize(Roles = new[] { "Administrador" })]
        [UseProjection]
        public IQueryable<User> GetUsers([Service] IUsersService usersService)
        {
            return usersService.GetAllAsync();
        }

        [Authorize]
        public async Task<User> GetMe(
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid userId = GetAuthenticatedUserId(httpContextAccessor);
            return await context.Users
                .AsNoTracking()
                .Include(user => user.Account)
                .Include(user => user.UserCareers)
                .ThenInclude(link => link.Career)
                .Include(user => user.CvExperiences)
                .Include(user => user.CvEducations)
                .Include(user => user.CvProjects)
                .Include(user => user.CvSkills)
                .Include(user => user.CvLanguages)
                .AsSplitQuery()
                .SingleOrDefaultAsync(user => user.Id == userId && user.IsActive)
                ?? throw new GraphQLException("Usuario no encontrado.");
        }

        [UseProjection]
        public IQueryable<Career> GetCareers([Service] OneItbContext context)
        {
            return context.Careers.AsNoTracking().Where(career => career.IsActive).OrderBy(career => career.Name);
        }

        [Authorize]
        [UseProjection]
        public IQueryable<Career> GetMyCareers(
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid userId = GetAuthenticatedUserId(httpContextAccessor);
            return context.UserCareers
                .AsNoTracking()
                .Where(link => link.UserId == userId && link.Career.IsActive)
                .Select(link => link.Career)
                .OrderBy(career => career.Name);
        }

        [UseProjection]
        public IQueryable<Subject> GetSubjects(int? careerId, [Service] OneItbContext context)
        {
            IQueryable<Subject> query = context.Subjects
                .AsNoTracking()
                .Where(subject => subject.IsActive);

            if (careerId.HasValue)
            {
                int selectedCareerId = careerId.Value;
                query = query.Where(subject => subject.CareerId == selectedCareerId);
            }

            return query.OrderBy(subject => subject.Name);
        }

        [Authorize]
        public async Task<IReadOnlyList<Guid>> GetMyFollowedUserIds(
            [Service] ISocialGraphService socialGraphService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await socialGraphService.GetFollowedUserIdsAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw CreateUserError(ex.Message);
            }
        }

        public async Task<InquiryPage> GetInquiriesPage(
            string? searchTerm,
            int? careerId,
            int[]? careerIds,
            int[]? subjectIds,
            Guid? inquiryId,
            Guid? authorId,
            int first,
            string? after,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                Guid? currentUserId = TryGetAuthenticatedUserId(httpContextAccessor);
                return await socialService.GetInquiriesPageAsync(
                    currentUserId,
                    searchTerm,
                    careerId,
                    careerIds,
                    subjectIds,
                    first,
                    after,
                    inquiryId,
                    authorId,
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
        public async Task<ReactionUserPage> GetInquiryReactionUsersPage(
            Guid inquiryId,
            int first,
            string? after,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                string? role = GetAuthenticatedRole(httpContextAccessor);
                bool canModerate = role == "Administrador" || role == "Moderador";
                return await socialService.GetInquiryReactionUsersPageAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    canModerate,
                    inquiryId,
                    first,
                    after,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public Task<LinkPreviewResult> GetLinkPreview(
            string url,
            [Service] ILinkPreviewService linkPreviewService,
            CancellationToken cancellationToken)
        {
            return linkPreviewService.GetPreviewAsync(url, cancellationToken);
        }

        public async Task<PublicProfileSummary> GetPublicProfile(
            Guid userId,
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            User user = await context.Users
                .AsNoTracking()
                .Include(item => item.Account)
                .Include(item => item.UserCareers)
                .ThenInclude(link => link.Career)
                .Include(item => item.CvExperiences)
                .Include(item => item.CvEducations)
                .Include(item => item.CvProjects)
                .Include(item => item.CvSkills)
                .Include(item => item.CvLanguages)
                .AsSplitQuery()
                .SingleOrDefaultAsync(item => item.Id == userId && item.IsActive)
                ?? throw new GraphQLException("Usuario no encontrado.");

            IQueryable<Inquiry> publicationMetricsQuery = context.Inquiries
                .AsNoTracking()
                .Where(inquiry => inquiry.UserId == userId);

            IQueryable<Comment> commentMetricsQuery = context.Comments
                .AsNoTracking()
                .Where(comment => comment.UserId == userId);

            Guid? viewerId = TryGetAuthenticatedUserId(httpContextAccessor);
            if (!viewerId.HasValue)
            {
                publicationMetricsQuery = publicationMetricsQuery.Where(inquiry => false);
                commentMetricsQuery = commentMetricsQuery.Where(comment => false);
            }
            else
            {
                bool hasGlobalCareerVisibility = await context.Users.AnyAsync(item =>
                    item.Id == viewerId.Value &&
                    (item.Role == "Administrador" || item.Role == "Moderador"));

                if (!hasGlobalCareerVisibility)
                {
                    IQueryable<int> viewerCareerIds = context.UserCareers
                        .Where(link => link.UserId == viewerId.Value && link.Career.IsActive)
                        .Select(link => link.CareerId);

                    publicationMetricsQuery = publicationMetricsQuery
                        .Where(inquiry => viewerCareerIds.Contains(inquiry.Subject.CareerId));
                    commentMetricsQuery = commentMetricsQuery
                        .Where(comment => viewerCareerIds.Contains(comment.Inquiry.Subject.CareerId));
                }
            }

            int totalPublications = await publicationMetricsQuery.CountAsync();
            int totalComments = await commentMetricsQuery.CountAsync();
            bool canViewSensitiveProfile = await CanViewSensitiveProfileAsync(context, user, viewerId);

            return new PublicProfileSummary(
                user.Id,
                user.FirstName,
                user.LastName,
                $"{user.FirstName} {user.LastName}".Trim(),
                user.Role,
                viewerId == user.Id && user.Account.HasExternalIdentity,
                canViewSensitiveProfile ? user.Biography : null,
                canViewSensitiveProfile ? user.LinkedIn : null,
                canViewSensitiveProfile ? user.Facebook : null,
                canViewSensitiveProfile ? user.Instagram : null,
                canViewSensitiveProfile ? user.Phone : null,
                user.AvatarUrl,
                user.IsPublicProfile,
                canViewSensitiveProfile,
                canViewSensitiveProfile ? MapExperiences(user.CvExperiences) : Array.Empty<CvExperienceDto>(),
                canViewSensitiveProfile ? MapEducations(user.CvEducations) : Array.Empty<CvEducationDto>(),
                canViewSensitiveProfile ? MapProjects(user.CvProjects) : Array.Empty<CvProjectDto>(),
                canViewSensitiveProfile ? MapSkills(user.CvSkills) : Array.Empty<CvSkillDto>(),
                canViewSensitiveProfile ? MapLanguages(user.CvLanguages) : Array.Empty<CvLanguageDto>(),
                canViewSensitiveProfile
                    ? user.UserCareers
                        .Where(link => link.Career.IsActive)
                        .Select(link => link.Career.Name)
                        .OrderBy(name => name)
                        .ToArray()
                    : Array.Empty<string>(),
                canViewSensitiveProfile ? totalPublications : 0,
                canViewSensitiveProfile ? totalComments : 0);
        }

        public async Task<IReadOnlyList<PublicProfileSearchResult>> SearchPublicProfiles(
            string? searchTerm,
            int first,
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            string normalizedTerm = (searchTerm ?? string.Empty).Trim();
            int take = Math.Clamp(first, 1, 8);

            if (normalizedTerm.Length < 2)
            {
                return Array.Empty<PublicProfileSearchResult>();
            }

            List<User> users = await context.Users
                .AsNoTracking()
                .Include(user => user.Account)
                .Include(user => user.UserCareers)
                .ThenInclude(link => link.Career)
                .Where(user => user.IsActive)
                .Where(user =>
                    (user.FirstName + " " + user.LastName).Contains(normalizedTerm) ||
                    user.FirstName.Contains(normalizedTerm) ||
                    user.LastName.Contains(normalizedTerm) ||
                    user.Account.Email.Contains(normalizedTerm))
                .OrderBy(user => user.FirstName)
                .ThenBy(user => user.LastName)
                .Take(take)
                .AsSplitQuery()
                .ToListAsync();

            Guid? viewerId = TryGetAuthenticatedUserId(httpContextAccessor);
            string? viewerRole = null;
            HashSet<Guid> followedTargetIds = new();

            if (viewerId.HasValue)
            {
                viewerRole = await context.Users
                    .AsNoTracking()
                    .Where(user => user.Id == viewerId.Value && user.IsActive)
                    .Select(user => user.Role)
                    .SingleOrDefaultAsync();

                Guid[] targetIds = users.Select(user => user.Id).ToArray();
                followedTargetIds = (await context.UserInteractions
                        .AsNoTracking()
                        .Where(item =>
                            item.ObserverId == viewerId.Value &&
                            targetIds.Contains(item.TargetId) &&
                            item.Type == InteractionType.Follow)
                        .Select(item => item.TargetId)
                        .ToListAsync())
                    .ToHashSet();
            }

            return users
                .Select(user =>
                {
                    bool canViewSensitiveProfile = CanViewSensitiveProfileFromLoadedData(
                        user,
                        viewerId,
                        viewerRole,
                        followedTargetIds);

                    return new PublicProfileSearchResult(
                        user.Id,
                        $"{user.FirstName} {user.LastName}".Trim(),
                        user.Role,
                        user.AvatarUrl,
                        user.IsPublicProfile,
                        canViewSensitiveProfile,
                        canViewSensitiveProfile
                            ? user.UserCareers
                                .Where(link => link.Career.IsActive)
                                .Select(link => link.Career.Name)
                                .OrderBy(name => name)
                                .ToArray()
                            : Array.Empty<string>());
                })
                .ToArray();
        }

        [Authorize(Roles = new[] { "Administrador", "Moderador" })]
        [UseProjection]
        public IQueryable<CommunityReport> GetCommunityReports([Service] IModerationService moderationService)
        {
            return moderationService.GetCommunityReports();
        }

        [Authorize(Roles = new[] { "Administrador" })]
        [UseProjection]
        public IQueryable<ModerationAudit> GetModerationAudits(int first, [Service] IModerationService moderationService)
        {
            return moderationService.GetModerationAudits(first);
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public IQueryable<AuditLog> GetAuditLogs(
            int first,
            string? entityName,
            Guid? actorUserId,
            [Service] OneItbContext context)
        {
            int take = Math.Clamp(first, 1, 200);
            string? normalizedEntityName = string.IsNullOrWhiteSpace(entityName)
                ? null
                : entityName.Trim();

            if (normalizedEntityName is { Length: > 120 })
                throw new GraphQLException("El filtro de entidad no puede superar 120 caracteres.");

            IQueryable<AuditLog> query = context.AuditLogs
                .AsNoTracking()
                .Include(log => log.ActorUser);

            if (normalizedEntityName is not null)
                query = query.Where(log => log.EntityName == normalizedEntityName);

            if (actorUserId.HasValue)
                query = query.Where(log => log.ActorUserId == actorUserId.Value);

            return query
                .OrderByDescending(log => log.CreatedAt)
                .Take(take);
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<bool> TestSmtpConnection(
            string targetEmail,
            [Service] IEmailSender emailSender,
            [Service] ILogger<Query> logger,
            CancellationToken cancellationToken)
        {
            string recipient = NormalizeSmokeTestEmail(targetEmail);
            const string subject = "OneITB: Prueba de configuracion SMTP exitosa";
            string body =
                "Este correo confirma que la configuracion SMTP de OneITB pudo enviar mensajes desde el backend.\n\n" +
                $"Fecha UTC: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}\n\n" +
                "Equipo OneITB";

            try
            {
                await emailSender.SendAsync(recipient, subject, body, cancellationToken);
                return true;
            }
            catch (Exception ex)
            {
                logger.LogWarning(
                    ex,
                    "SMTP smoke test failed for target email {TargetEmail}.",
                    recipient);

                string reason = ex is SmtpException
                    ? "El proveedor SMTP rechazo o no pudo completar el envio."
                    : "El servicio de correo no pudo completar la prueba.";
                throw CreateUserError($"{reason} Revisa las variables SMTP y vuelve a intentarlo.");
            }
        }

        public async Task<PublicCertificateDto> GetPublicCertificate(
            Guid id,
            [Service] OneItbContext context)
        {
            AcademicProgress progress = await context.AcademicProgressRecords
                .AsNoTracking()
                .Include(item => item.User)
                .Include(item => item.Subject)
                .ThenInclude(subject => subject.Career)
                .AsSplitQuery()
                .SingleOrDefaultAsync(item =>
                    item.Id == id &&
                    item.Status == AcademicProgressStatus.Approved &&
                    item.User.IsActive &&
                    item.Subject.IsActive &&
                    item.Subject.Career.IsActive)
                ?? throw new GraphQLException("Certificado no encontrado o no disponible publicamente.");

            return new PublicCertificateDto(
                progress.Id,
                $"{progress.User.FirstName} {progress.User.LastName}".Trim(),
                progress.Subject.Name,
                progress.Subject.Code,
                progress.Subject.Career.Name,
                progress.Score,
                progress.Status.ToString(),
                progress.UpdatedAt);
        }

        [Authorize]
        public async Task<IReadOnlyList<AcademicResource>> GetAcademicResources(
            int subjectId,
            string? searchTerm,
            AcademicResourceCategory? category,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await academicService.GetAcademicResourcesAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    subjectId,
                    searchTerm,
                    category);
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
        public async Task<IReadOnlyList<AcademicResource>> GetResourcesBySubject(
            int subjectId,
            string? searchTerm,
            AcademicResourceCategory? category,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await academicService.GetAcademicResourcesAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    subjectId,
                    searchTerm,
                    category);
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
        public async Task<IReadOnlyList<AcademicProgress>> GetMyAcademicProgress(
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await academicService.GetMyAcademicProgressAsync(GetAuthenticatedUserId(httpContextAccessor));
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<IReadOnlyList<AcademicProgress>> GetAcademicProgressForUser(
            Guid userId,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await academicService.GetAcademicProgressForUserAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    userId);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize(Roles = new[] { "Administrador", "Profesor" })]
        public async Task<AcademicStudentPage> GetAcademicStudents(
            int subjectId,
            int first,
            string? after,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor,
            CancellationToken cancellationToken)
        {
            try
            {
                return await academicService.GetAcademicStudentsPageAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    subjectId,
                    first,
                    after,
                    cancellationToken);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        [UsePaging(MaxPageSize = 50, IncludeTotalCount = true)]
        [UseFiltering]
        [UseSorting]
        public IQueryable<JobOffer> GetJobOffers(
            bool? onlyActive,
            [Service] IJobService jobService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid? currentUserId = TryGetAuthenticatedUserId(httpContextAccessor);
            return jobService.GetJobOffers(onlyActive ?? true, currentUserId);
        }

        [Authorize]
        [UsePaging(MaxPageSize = 50, IncludeTotalCount = true)]
        [UseFiltering]
        [UseSorting]
        public IQueryable<JobOffer> GetMyJobOffers(
            [Service] IJobService jobService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return jobService.GetMyJobOffers(
                GetAuthenticatedUserId(httpContextAccessor),
                GetAuthenticatedRole(httpContextAccessor));
        }

        [Authorize]
        public async Task<IReadOnlyList<Notification>> GetMyNotifications(
            int first,
            [Service] INotificationService notificationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await notificationService.GetNotificationsAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    first);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<int> GetUnreadNotificationCount(
            [Service] INotificationService notificationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await notificationService.GetUnreadCountAsync(
                    GetAuthenticatedUserId(httpContextAccessor));
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<IReadOnlyList<NotificationPreference>> GetMyNotificationPreferences(
            [Service] INotificationService notificationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await notificationService.GetPreferencesAsync(
                    GetAuthenticatedUserId(httpContextAccessor));
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        [UsePaging(MaxPageSize = 50, IncludeTotalCount = true)]
        public IQueryable<MessagingContact> GetMessagingContacts(
            [Service] IMessagingService messagingService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return messagingService.GetContacts(GetAuthenticatedUserId(httpContextAccessor));
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        [UsePaging(MaxPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        public IQueryable<Message> GetConversation(
            Guid otherUserId,
            [Service] IMessagingService messagingService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return messagingService.GetConversation(
                    GetAuthenticatedUserId(httpContextAccessor),
                    otherUserId);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        [UsePaging(MaxPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        public IQueryable<ActiveConversationDto> GetActiveConversations(
            [Service] IMessagingService messagingService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return messagingService.GetActiveConversations(GetAuthenticatedUserId(httpContextAccessor));
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        [UsePaging(MaxPageSize = 50, IncludeTotalCount = true)]
        [UseProjection]
        public IQueryable<Message> SearchMyMessages(
            string searchTerm,
            [Service] IMessagingService messagingService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return messagingService.SearchMyMessages(GetAuthenticatedUserId(httpContextAccessor), searchTerm);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        private static IReadOnlyList<CvExperienceDto> MapExperiences(IEnumerable<UserCvExperience> items)
        {
            return items
                .OrderBy(item => item.SortOrder)
                .Select(item => new CvExperienceDto(
                    item.Id,
                    item.Company,
                    item.Role,
                    item.StartDate,
                    item.EndDate,
                    item.Location,
                    item.Description,
                    item.IsHidden,
                    item.SortOrder))
                .ToArray();
        }

        private static IReadOnlyList<CvEducationDto> MapEducations(IEnumerable<UserCvEducation> items)
        {
            return items
                .OrderBy(item => item.SortOrder)
                .Select(item => new CvEducationDto(
                    item.Id,
                    item.Institution,
                    item.Degree,
                    item.StartDate,
                    item.EndDate,
                    item.Location,
                    item.Description,
                    item.IsHidden,
                    item.SortOrder))
                .ToArray();
        }

        private static IReadOnlyList<CvProjectDto> MapProjects(IEnumerable<UserCvProject> items)
        {
            return items
                .OrderBy(item => item.SortOrder)
                .Select(item => new CvProjectDto(
                    item.Id,
                    item.Name,
                    item.Role,
                    item.StartDate,
                    item.EndDate,
                    item.Url,
                    item.Description,
                    item.IsHidden,
                    item.SortOrder))
                .ToArray();
        }

        private static IReadOnlyList<CvSkillDto> MapSkills(IEnumerable<UserCvSkill> items)
        {
            return items
                .OrderBy(item => item.SortOrder)
                .Select(item => new CvSkillDto(
                    item.Id,
                    item.Name,
                    item.Level,
                    item.IsHidden,
                    item.SortOrder))
                .ToArray();
        }

        private static IReadOnlyList<CvLanguageDto> MapLanguages(IEnumerable<UserCvLanguage> items)
        {
            return items
                .OrderBy(item => item.SortOrder)
                .Select(item => new CvLanguageDto(
                    item.Id,
                    item.Name,
                    item.Level,
                    item.IsHidden,
                    item.SortOrder))
                .ToArray();
        }

        private static async Task<bool> CanViewSensitiveProfileAsync(
            OneItbContext context,
            User targetUser,
            Guid? viewerId)
        {
            if (targetUser.IsPublicProfile)
                return true;

            if (!viewerId.HasValue)
                return false;

            if (viewerId.Value == targetUser.Id)
                return true;

            string? viewerRole = await context.Users
                .AsNoTracking()
                .Where(user => user.Id == viewerId.Value && user.IsActive)
                .Select(user => user.Role)
                .SingleOrDefaultAsync();

            if (CanViewPrivateProfilesByRole(viewerRole))
                return true;

            return await context.UserInteractions
                .AsNoTracking()
                .AnyAsync(item =>
                    item.ObserverId == viewerId.Value &&
                    item.TargetId == targetUser.Id &&
                    item.Type == InteractionType.Follow);
        }

        private static bool CanViewSensitiveProfileFromLoadedData(
            User targetUser,
            Guid? viewerId,
            string? viewerRole,
            IReadOnlySet<Guid> followedTargetIds)
        {
            return targetUser.IsPublicProfile ||
                   (viewerId.HasValue && viewerId.Value == targetUser.Id) ||
                   CanViewPrivateProfilesByRole(viewerRole) ||
                   followedTargetIds.Contains(targetUser.Id);
        }

        private static bool CanViewPrivateProfilesByRole(string? role)
        {
            return role is "Administrador" or "Moderador";
        }

        private static string NormalizeSmokeTestEmail(string? targetEmail)
        {
            string normalized = (targetEmail ?? string.Empty).Trim();
            if (normalized.Length is < 6 or > 254)
                throw CreateUserError("El correo de destino no tiene un formato valido.");

            try
            {
                var address = new MailAddress(normalized);
                if (!string.Equals(address.Address, normalized, StringComparison.OrdinalIgnoreCase))
                    throw CreateUserError("El correo de destino no tiene un formato valido.");
                return address.Address;
            }
            catch (FormatException)
            {
                throw CreateUserError("El correo de destino no tiene un formato valido.");
            }
        }

        private static GraphQLException CreateUserError(string message)
        {
            return new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage(message)
                    .SetCode("USER_ERROR")
                    .Build());
        }

        private static Guid GetAuthenticatedUserId(IHttpContextAccessor httpContextAccessor)
        {
            string? value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(value, out Guid userId))
                throw new GraphQLException("No se pudo identificar al usuario autenticado.");
            return userId;
        }

        private static Guid? TryGetAuthenticatedUserId(IHttpContextAccessor httpContextAccessor)
        {
            string? value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out Guid userId) ? userId : null;
        }

        private static string? GetAuthenticatedRole(IHttpContextAccessor httpContextAccessor)
        {
            return httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
        }
    }
}
