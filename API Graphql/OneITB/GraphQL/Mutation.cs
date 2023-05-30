using GraphQL.GraphQL.Mutations;
using HotChocolate;
using Microsoft.Extensions.Configuration;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Accounts;
using Services.Users;
using System;
using System.Threading.Tasks;

namespace GraphQL.GraphQL
{
    public class Mutation
    {
        public async Task<User> AddUser([Service] UsersService usersService, [Service] AccountsService accountService, UserInput input)
        {
            var account = accountService.GetById(input.AccountId);

            if(input.Email.Split('@')[1] != account.EmailDomain)
            {
                throw new Exception($"El email no corresponde a esta institución");
            }

            if(usersService.GetByEmail(input.Email) != null)
            {
                throw new Exception($"El email ya está en uso. Prueba con otro.");
            }
            
            var user = new User
            {
                FullName = input.FullName,
                Email = input.Email,
                Disabled = false,
                Password = input.Password,
                Phone = input.Alias,
                UserName = input.Alias,
                CreationDate = DateTime.Now,
                ModificationDate = DateTime.Now,
                CreationUser = "Admin",
                ModificationUser = "Admin",
                AccountId = input.AccountId
            };
           
            return await usersService.CreateAsync(user);
        }

        public UserPayload AuthenticateUser([Service] UsersService usersService, [Service] IConfiguration configuration, string email, string password)
        {
            var user = usersService.GetByEmailAndPassword(email, password);

            if(user == null)
            {
                throw new Exception($"Contraseña o Email incorrecto. Vuelve a intentarlo.");
            }

            return new UserPayload(user, usersService.GenerateToken(user, configuration));
        }


    }
}
