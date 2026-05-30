using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Types;
using Services.Users;
using Services.Accounts;
using OneITB.Core.Services.Interfaces;

namespace OneITB.GraphQL.Mutations
{
    [ExtendObjectType(OperationTypeNames.Mutation)]
    public class Mutation
    {
        /// <summary>
        /// Resolver blindado contra inyecciones y DoS para el registro de usuarios.
        /// </summary>
        public async Task<UserPayload> RegisterUserAsync(
            RegisterInput input,
            [Service] IUsersService usersService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            var userDto = await usersService.RegisterAsync(input);
            return userDto;
        }

        /// <summary>
        /// Resolver blindado para la autenticación segura (Login).
        /// </summary>
        public async Task<LoginPayload> LoginAsync(
            LoginInput input,
            [Service] IAccountService accountService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            var authResult = await accountService.LoginAsync(input);
            return authResult;
        }
    }
}
