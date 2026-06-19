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
using System.Threading.Tasks;

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

        public User GetUserById([Service] IUsersService usersService, Guid id)
        {
            return usersService.GetById(id);
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
            int[]? subjectIds,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid? currentUserId = TryGetAuthenticatedUserId(httpContextAccessor);
            return socialService.GetInquiries(currentUserId, searchTerm, careerId, subjectIds);
        }

        public async Task<PublicProfileSummary> GetPublicProfile(
            Guid userId,
            [Service] OneItbContext context)
        {
            User user = await context.Users
                .AsNoTracking()
                .Include(item => item.Account)
                .Include(item => item.UserCareers)
                .ThenInclude(link => link.Career)
                .SingleOrDefaultAsync(item => item.Id == userId && item.IsActive)
                ?? throw new GraphQLException("Usuario no encontrado.");

            int totalPublications = await context.Inquiries
                .AsNoTracking()
                .CountAsync(inquiry => inquiry.UserId == userId);

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
                user.UserCareers
                    .Where(link => link.Career.IsActive)
                    .Select(link => link.Career.Name)
                    .OrderBy(name => name)
                    .ToArray(),
                totalPublications);
        }

        [Authorize(Roles = new[] { "Administrador", "Moderador" })]
        [UseProjection]
        public IQueryable<CommunityReport> GetCommunityReports([Service] IModerationService moderationService)
        {
            return moderationService.GetCommunityReports();
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

        private static Guid GetAuthenticatedUserId(IHttpContextAccessor httpContextAccessor)
        {
            string value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(value, out Guid userId))
                throw new GraphQLException("No se pudo identificar al usuario autenticado.");
            return userId;
        }

        private static Guid? TryGetAuthenticatedUserId(IHttpContextAccessor httpContextAccessor)
        {
            string value = httpContextAccessor.HttpContext?.User
                .FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out Guid userId) ? userId : null;
        }
    }
}
