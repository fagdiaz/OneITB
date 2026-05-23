using System;
using System.Threading.Tasks;
using BCrypt.Net;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Accounts
{
    public class AccountsService : IAccountService
    {
        private readonly IUnitOfWork _uow;

        public AccountsService(IUnitOfWork uow)
        {
            _uow = uow;
        }

        public async Task<LoginPayload> LoginAsync(LoginInput input)
        {
            var user = await _uow.Users.GetByEmailAsync(input.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(input.Password, user.PasswordHash))
                throw new Exception("Credenciales inválidas.");

            return new LoginPayload("token_generado_aqui", user.Username, true);
        }

        public Account GetById(Guid id)
        {
            return _uow.Accounts.GetById(id);
        }
    }
}
