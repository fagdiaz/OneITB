using HotChocolate;
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
        public IQueryable<User> GetUsers([Service] IUsersService usersService)
        {
            return usersService.GetAllAsync();
        }

        public User GetUserById([Service] IUsersService usersService, Guid id)
        {
            return usersService.GetById(id);
        }
    }
}
