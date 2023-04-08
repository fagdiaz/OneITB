using HotChocolate;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace GraphQL.GraphQL
{
    public class Query
    {
        public async Task<List<User>> GetUsers([Service]OneItbContext context)
        {
            return await context.Users.ToListAsync();
        }
    }
}
