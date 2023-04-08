
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
            var user = new User
            {
                FullName = input.FullName,
                Email = input.Email,
                Disabled = false,
                Password = input.Password,
                Phone = input.Phone,
                UserName = input.UserName,
                CreationDate = DateTime.Now,
                ModificationDate = DateTime.Now,
                CreationUser = "Admin",
                ModificationUser = "Admin"
            };
           
            return await usersService.CreateAsync(user);
        }
    }
}
