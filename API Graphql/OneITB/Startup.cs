using GraphQL.GraphQL;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using OneItb.Data;
using OneItb.Entities.Models;
using Services.Users;
using HotChocolate.Types;
using HotChocolate.Types.Pagination;
using HotChocolate.Data;

namespace OneItb.GraphQL
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            

            //services.AddScoped<OneItbContext>();
             
            services.AddPooledDbContextFactory<OneItbContext>(opt => opt.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"), b => b.MigrationsAssembly("Data")));

            services.AddGraphQLServer()
                .RegisterDbContext<OneItbContext>(DbContextKind.Pooled)
                .RegisterService<User>()
                .AddQueryType<Query>()
                .AddMutationType<Mutation>();

            services.AddTransient<UsersService>();
           
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseAuthorization();
            

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGraphQL();
            });

            
        }
    }
}
