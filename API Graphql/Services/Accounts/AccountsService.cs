using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OneItb.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Services.Accounts
{
    public class AccountsService : IAccountService
    {
        private OneItbContext context;
        public AccountsService(OneItbContext oneItbContext, IConfiguration configuration)
        {
            context = oneItbContext;
            this.Configuration = configuration;
        }

        public AccountsService(IDbContextFactory<OneItbContext> oneItbContextFactory, CancellationToken? token = null)
        {
            context = oneItbContextFactory.CreateDbContext();
        }
        public IConfiguration Configuration { get; }
    }
}
