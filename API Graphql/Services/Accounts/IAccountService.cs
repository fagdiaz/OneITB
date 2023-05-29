using Entities.Models;
namespace Services.Accounts
{
    public interface IAccountService
    {
        public Account GetById(int id);
    }
}
