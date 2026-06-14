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
        public IQueryable<Subject> GetSubjects([Service] OneItbContext context)
        {
            return context.Subjects;
        }

        [UseProjection]
        public IQueryable<Inquiry> GetInquiries([Service] ISocialService socialService)
        {
            return socialService.GetInquiries();
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
        public IQueryable<User> GetActiveConversations(
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
    }
}
