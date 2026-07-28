using System;
using System.Threading;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface IUserRepository
    {
        Task AddAsync(User user, CancellationToken cancellationToken = default);
        IQueryable<User> GetAll();
        User? GetByEmail(string email);
        Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
        User? GetById(Guid id);
        Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    }

    public interface IAccountRepository
    {
        Account? GetById(Guid id);
    }

    public interface IMessageRepository
    {
        IQueryable<Message> Query();
        Task AddAsync(Message message, CancellationToken cancellationToken = default);
    }

    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IAccountRepository Accounts { get; }
        IMessageRepository Messages { get; }
        Task<int> CompleteAsync(CancellationToken cancellationToken = default);
    }
}
