using OneItb.Entities.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Users
{
    public interface IUsersService
    {
        Task<User> CreateAsync(User user);
    }
}
