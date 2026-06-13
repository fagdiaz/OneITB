using HotChocolate;
using HotChocolate.Data;
using HotChocolate.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
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
    }
}
