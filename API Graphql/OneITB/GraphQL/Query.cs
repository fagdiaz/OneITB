using HotChocolate;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Users;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GraphQL.GraphQL
{
    public class Query
    {
        public  Task<List<User>> GetUsers([Service] UsersService usersService)
        {
            return  usersService.GetAllAsync().ToListAsync();
        }
    }
}
