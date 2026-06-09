using GraphQL.GraphQL;
using OneITB.GraphQL.Mutations;
using OneITB.Core.Services.Interfaces;
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
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Services.Accounts;

namespace OneItb.GraphQL
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }
        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddCors(options =>
            {
                options.AddPolicy(MyAllowSpecificOrigins,
                builder =>
                {
                    builder.WithOrigins("*").AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin();
                });
            });

            services.AddPooledDbContextFactory<OneItbContext>(opt => opt.UseSqlServer(Configuration.GetConnectionString("DefaultConnection"), b => b.MigrationsAssembly("Data")));
            services.AddScoped<OneItbContext>(p => p.GetRequiredService<IDbContextFactory<OneItbContext>>().CreateDbContext());

            services.AddGraphQLServer()
                .RegisterDbContext<OneItbContext>(DbContextKind.Pooled)
                .AddQueryType<Query>()
                .AddMutationType<Mutation>()
                .AddType(new ObjectType<Account>(d => d.Field(f => f.PasswordHash).Ignore()))
                .AddType(new ObjectType<User>(descriptor => 
                {
                    descriptor.Field(f => f.Id).Name("id");
                    descriptor.Field(f => f.FirstName).Name("firstName");
                    descriptor.Field("alias").Resolve(ctx => ctx.Parent<User>().FirstName);
                    descriptor.Field(f => f.LastName).Name("lastName");
                    descriptor.Field("email").Resolve(ctx => ctx.Parent<User>().Account?.Email);
                    descriptor.Field("fullName").Resolve(ctx => $"{ctx.Parent<User>().FirstName} {ctx.Parent<User>().LastName}".Trim());
                    descriptor.Field("password").Resolve(ctx => "********");
                }));

            services.AddScoped<IUnitOfWork, Services.Repositories.UnitOfWork>();
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IAccountService, AccountsService>();

            services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = false,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = Configuration["Jwt:Issuer"],
                    ValidAudience = Configuration["Jwt:Issuer"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
                };
            });

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

            app.UseAuthentication();
            app.UseAuthorization();
            app.UseCors(MyAllowSpecificOrigins);


            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGraphQL();
            });

            
        }
    }
}
