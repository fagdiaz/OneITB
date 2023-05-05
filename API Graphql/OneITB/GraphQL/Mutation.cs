
using GraphQL.GraphQL.Mutations;
using HotChocolate;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Users;
using System;
using System.Threading.Tasks;

namespace GraphQL.GraphQL
{
    public class Mutation
    {
        public async Task<User> AddUser([Service] UsersService usersService, UserInput input)
        {
            //TODO validate email

            var user = new User
            {
                FullName = input.FullName,
                Email = input.Email,
                Disabled = false,
                Password = input.Password,
                Phone = input.Alias,
                UserName = "repro",
                CreationDate = DateTime.Now,
                ModificationDate = DateTime.Now,
                CreationUser = "Admin",
                ModificationUser = "Admin",
                AccountId = 1
            };
           
            return await usersService.CreateAsync(user);
        }
    }
}
