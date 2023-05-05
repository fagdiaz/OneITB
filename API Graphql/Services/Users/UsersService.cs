using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Users
{
    public class UsersService : IUsersService
    {
        private OneItbContext context;
        public UsersService(OneItbContext oneItbContext) 
        {
            context = oneItbContext;
        }

        public UsersService(IDbContextFactory<OneItbContext> oneItbContextFactory, CancellationToken? token = null) 
        {
            context = oneItbContextFactory.CreateDbContext();
        }

        public async Task<User> CreateAsync(User user)
        {
            try
            {
                await context.Users.AddAsync(user);
                await context.SaveChangesAsync();
                return user;
            } catch (Exception ex)
            {
                return null;
            }
        }

        public IQueryable<User> GetAllAsync()
        {
            return context.Users.AsQueryable();
        }        

    }
}
