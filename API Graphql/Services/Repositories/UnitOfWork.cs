using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly OneItbContext _context;

        public UserRepository(OneItbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
        }

        public IQueryable<User> GetAll()
        {
            return _context.Users.Include(u => u.Account).AsQueryable();
        }

        public User GetByEmail(string email)
        {
            return _context.Users
                .Include(u => u.Account)
                .FirstOrDefault(u => u.Account.Email == email)!;
        }

        public async Task<User> GetByEmailAsync(string email)
        {
            return (await _context.Users
                .Include(u => u.Account)
                .FirstOrDefaultAsync(u => u.Account.Email == email))!;
        }

        public User GetById(Guid id)
        {
            return _context.Users
                .Include(u => u.Account)
                .FirstOrDefault(u => u.Id == id)!;
        }
    }

    public class AccountRepository : IAccountRepository
    {
        private readonly OneItbContext _context;

        public AccountRepository(OneItbContext context)
        {
            _context = context;
        }

        public Account GetById(Guid id)
        {
            return _context.Accounts
                .Include(a => a.User)
                .FirstOrDefault(a => a.Id == id)!;
        }
    }

    public class MessageRepository : IMessageRepository
    {
        private readonly OneItbContext _context;

        public MessageRepository(OneItbContext context)
        {
            _context = context;
        }

        public IQueryable<Message> Query()
        {
            return _context.Messages.AsNoTracking();
        }

        public async Task AddAsync(Message message)
        {
            await _context.Messages.AddAsync(message);
        }
    }

    public class UnitOfWork : IUnitOfWork
    {
        private readonly OneItbContext _context;
        private IUserRepository? _users;
        private IAccountRepository? _accounts;
        private IMessageRepository? _messages;

        public UnitOfWork(OneItbContext context)
        {
            _context = context;
        }

        public IUserRepository Users => _users ??= new UserRepository(_context);

        public IAccountRepository Accounts => _accounts ??= new AccountRepository(_context);

        public IMessageRepository Messages => _messages ??= new MessageRepository(_context);

        public async Task<int> CompleteAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
