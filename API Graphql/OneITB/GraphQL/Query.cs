using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Authorization;
using HotChocolate.Types;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Services.LinkPreviews;
using Services.Social;
using Services.Academic;
using Services.Notifications;

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

        public User? GetUserById([Service] IUsersService usersService, Guid id)
        {
            return usersService.GetById(id);
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

        [UseProjection]
        public IQueryable<Inquiry> GetInquiries(
            string? searchTerm,
            int? careerId,
            int[]? careerIds,
            int[]? subjectIds,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid? currentUserId = TryGetAuthenticatedUserId(httpContextAccessor);
            return socialService.GetInquiries(currentUserId, searchTerm, careerId, careerIds, subjectIds);
        }

        public async Task<InquiryPage> GetInquiriesPage(
            string? searchTerm,
            int? careerId,
            int[]? careerIds,
            int[]? subjectIds,
            int first,
            string? after,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
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
                    after);
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

            return new PublicProfileSummary(
                user.Id,
                user.FirstName,
                user.LastName,
                $"{user.FirstName} {user.LastName}".Trim(),
                user.Role,
                user.Biography,
                user.LinkedIn,
                user.Facebook,
                user.Instagram,
                user.Phone,
                user.AvatarUrl,
                MapExperiences(user.CvExperiences),
                MapEducations(user.CvEducations),
                MapProjects(user.CvProjects),
                MapSkills(user.CvSkills),
                MapLanguages(user.CvLanguages),
                user.UserCareers
                    .Where(link => link.Career.IsActive)
                    .Select(link => link.Career.Name)
                    .OrderBy(name => name)
                    .ToArray(),
                totalPublications,
                totalComments);
        }

        public async Task<IReadOnlyList<PublicProfileSearchResult>> SearchPublicProfiles(
            string? searchTerm,
            int first,
            [Service] OneItbContext context)
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

            return users
                .Select(user => new PublicProfileSearchResult(
                    user.Id,
                    $"{user.FirstName} {user.LastName}".Trim(),
                    user.Role,
                    user.AvatarUrl,
                    user.UserCareers
                        .Where(link => link.Career.IsActive)
                        .Select(link => link.Career.Name)
                        .OrderBy(name => name)
                        .ToArray()))
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
        public async Task<IReadOnlyList<User>> GetAcademicStudents(
            int subjectId,
            [Service] IAcademicService academicService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await academicService.GetAcademicStudentsAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    GetAuthenticatedRole(httpContextAccessor),
                    subjectId);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
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
