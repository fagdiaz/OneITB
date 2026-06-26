using System;
using System.Threading.Tasks;
using OneItb.Entities.Models;

namespace OneITB.Core.Services.Interfaces
{
    public interface IUserRepository
    {
        Task AddAsync(User user);
        IQueryable<User> GetAll();
        User? GetByEmail(string email);
        Task<User?> GetByEmailAsync(string email);
        User? GetById(Guid id);
    }

    public interface IAccountRepository
    {
        Account? GetById(Guid id);
    }

    public interface IMessageRepository
    {
        IQueryable<Message> Query();
        Task AddAsync(Message message);
    }

    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IAccountRepository Accounts { get; }
        IMessageRepository Messages { get; }
        Task<int> CompleteAsync();
    }
}
