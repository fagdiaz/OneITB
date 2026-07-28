using System;
using System.Threading;
using System.Threading.Tasks;
using HotChocolate;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Accounts
{
    public class AccountsService : IAccountService
    {
        private const int MaxFailedLoginAttempts = 5;
        private static readonly TimeSpan LockoutDuration = TimeSpan.FromMinutes(15);

        private readonly IUnitOfWork _uow;
        private readonly IJwtTokenService _jwtTokenService;
        private readonly IPasswordHasher _passwordHasher;

        public AccountsService(
            IUnitOfWork uow,
            IJwtTokenService jwtTokenService,
            IPasswordHasher passwordHasher)
        {
            _uow = uow;
            _jwtTokenService = jwtTokenService;
            _passwordHasher = passwordHasher;
        }

        public async Task<AuthPayload> Login(
            LoginInput input,
            CancellationToken cancellationToken = default)
        {
            var user = await _uow.Users.GetByEmailAsync(
                input.Email.ToLowerInvariant(),
                cancellationToken);
            if (user == null || !user.IsActive || user.Account == null)
                throw CreateAuthenticationError();

            Account account = user.Account;
            DateTime utcNow = DateTime.UtcNow;

            if (account.LockoutEnd.HasValue)
            {
                if (account.LockoutEnd.Value > utcNow)
                    throw CreateLockoutError(account.LockoutEnd.Value, utcNow);

                account.LockoutEnd = null;
                account.FailedLoginAttempts = 0;
                await _uow.CompleteAsync(cancellationToken);
            }

            if (!_passwordHasher.Verify(input.Password, account.PasswordHash))
            {
                account.FailedLoginAttempts++;
                if (account.FailedLoginAttempts >= MaxFailedLoginAttempts)
                    account.LockoutEnd = utcNow.Add(LockoutDuration);

                await _uow.CompleteAsync(cancellationToken);

                if (account.LockoutEnd.HasValue)
                    throw CreateLockoutError(account.LockoutEnd.Value, utcNow);

                throw CreateAuthenticationError();
            }

            bool accountChanged =
                account.FailedLoginAttempts != 0 ||
                account.LockoutEnd.HasValue;
            account.FailedLoginAttempts = 0;
            account.LockoutEnd = null;

            if (_passwordHasher.NeedsRehash(account.PasswordHash))
            {
                account.PasswordHash = _passwordHasher.Hash(input.Password);
                accountChanged = true;
            }

            if (accountChanged)
                await _uow.CompleteAsync(cancellationToken);

            string token = _jwtTokenService.IssueAccessToken(user);
            return new AuthPayload(token, user.FirstName, true, user.Id, user.Role);
        }

        public Account? GetById(Guid id)
        {
            return _uow.Accounts.GetById(id);
        }

        private static GraphQLException CreateAuthenticationError()
        {
            return new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage("Usuario o contrasena incorrectos.")
                    .SetCode("AUTH_INVALID_CREDENTIALS")
                    .Build());
        }

        private static GraphQLException CreateLockoutError(DateTime lockoutEnd, DateTime utcNow)
        {
            int minutes = Math.Max(1, (int)Math.Ceiling((lockoutEnd - utcNow).TotalMinutes));
            return new GraphQLException(
                ErrorBuilder.New()
                    .SetMessage($"Cuenta bloqueada temporalmente por seguridad. Intenta nuevamente en {minutes} minutos.")
                    .SetCode("ACCOUNT_LOCKED")
                    .Build());
        }
    }
}
