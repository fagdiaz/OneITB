using HotChocolate;
using HotChocolate.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Users;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GraphQL.GraphQL
{
    public class Query
    {
        public Task<List<User>> GetUsers([Service] UsersService usersService)
        {
            return  usersService.GetAllAsync().ToListAsync();
        }

        public User GetUserById([Service] UsersService usersService, int id)
        {
            return usersService.GetById(id);
        }
        
        //[Authorize]
        //public Task<List<User>> GetUserss([Service] UsersService usersService, [Service] IHttpContextAccessor contextAccessor)
        //{
        //    var accountId = int.Parse(contextAccessor.HttpContext.User.Claims.FirstOrDefault(x => x.Type == "accountId").Value);
        //    var userId = int.Parse(contextAccessor.HttpContext.User.Claims.FirstOrDefault(x => x.Type == "userId").Value);
        //    return usersService.GetAllAsync().ToListAsync();
        //}
    }
}
