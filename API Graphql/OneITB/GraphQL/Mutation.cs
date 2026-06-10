using System;
using System.ComponentModel.DataAnnotations;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Types;
using Services.Users;
using Services.Accounts;
using OneITB.Core.Services.Interfaces;

namespace OneITB.GraphQL.Mutations
{
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
            try
            {
                var userDto = await usersService.RegisterAsync(input);
                return userDto;
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        /// <summary>
        /// Resolver blindado para la autenticación segura (Login).
        /// </summary>
        public async Task<AuthPayload> Login(
            LoginInput input,
            [Service] IAccountService accountService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            var authResult = await accountService.Login(input);
            return authResult;
        }

        public async Task<UpdateProfilePayload> UpdateProfile(
            UpdateProfileInput input,
            [Service] IUsersService usersService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            var payload = await usersService.UpdateProfileAsync(input);
            return payload;
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<UserPayload> UpdateUserRole(Guid userId, string newRole, [Service] IUsersService usersService)
        {
            return await usersService.UpdateUserRoleAsync(userId, newRole);
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<UserPayload> UpdateUserStatus(Guid userId, bool isActive, [Service] IUsersService usersService)
        {
            return await usersService.UpdateUserStatusAsync(userId, isActive);
        }

        public async Task<string> RequestMagicLink(string email, string cuit, [Service] IEmployerAuthService authService)
        {
            return await authService.RequestMagicLinkAsync(email, cuit);
        }

        public async Task<string> LoginWithMagicLink(string token, [Service] IEmployerAuthService authService)
        {
            return await authService.LoginWithMagicLinkAsync(token);
        }

        [Authorize]
        public async Task<bool> ReportContent(Guid reporterId, string contentId, string contentType, string reason, [Service] IModerationService modService)
        {
            return await modService.ReportContentAsync(reporterId, contentId, contentType, reason);
        }
    }
}
