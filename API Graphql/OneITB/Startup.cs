using System;
using System.Text;
using System.Threading.Tasks;
using GraphQL.GraphQL;
using HotChocolate.Types;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.GraphQL.Mutations;
using OneITB.Core.Services.Interfaces;
using Services.Accounts;
using Services.Users;
using Services.Social;
using Services.Messaging;
using OneITB.GraphQL.Subscriptions;
using OneItb.GraphQL.Authentication;

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
            services.AddHttpContextAccessor();
            services.AddCors(options =>
            {
                options.AddPolicy(MyAllowSpecificOrigins,
                builder =>
                {
                    string[] allowedOrigins = Configuration
                        .GetSection("Cors:AllowedOrigins")
                        .Get<string[]>() ?? new[] { "http://localhost:5173", "https://localhost:5173" };
                    builder.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
                });
            });

            services.AddPooledDbContextFactory<OneItbContext>(opt =>
                opt.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection"),
                    sql => sql
                        .MigrationsAssembly("Data")
                        .UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));
            services.AddScoped<OneItbContext>(p => p.GetRequiredService<IDbContextFactory<OneItbContext>>().CreateDbContext());

            services.AddGraphQLServer()
                // HC 14 breaking change: RegisterDbContext(DbContextKind.Pooled) →
                // RegisterDbContextFactory<T>() — works with AddPooledDbContextFactory above.
                .RegisterDbContextFactory<OneItbContext>()
                .AddProjections()
                .AddFiltering()
                .AddSorting()
                .AddAuthorization()
                .ModifyRequestOptions(opt =>
                    opt.IncludeExceptionDetails = Configuration.GetValue<bool>("GraphQL:IncludeExceptionDetails"))
                .AddQueryType<Query>()
                .AddMutationType<Mutation>()
                .AddSubscriptionType<Subscription>()
                .AddInMemorySubscriptions()
                .AddSocketSessionInterceptor<AuthenticationSocketSessionInterceptor>()
                .AddType(new ObjectType<Account>(d => d.Field(f => f.PasswordHash).Ignore()))
                .AddType(new ObjectType<User>(descriptor => 
                {
                    descriptor.Field(f => f.Id).Name("id");
                    descriptor.Field(f => f.FirstName).Name("firstName");
                    descriptor.Field("alias").Resolve(ctx => ctx.Parent<User>().FirstName);
                    descriptor.Field(f => f.LastName).Name("lastName");
                    // Temporary compatibility fields for the current feed query.
                    descriptor.Field("idUsuario")
                        .Type<NonNullType<UuidType>>()
                        .Resolve(ctx => ctx.Parent<User>().Id);
                    descriptor.Field("nombre")
                        .Type<NonNullType<StringType>>()
                        .Resolve(ctx => ctx.Parent<User>().FirstName);
                    descriptor.Field("apellidos")
                        .Type<NonNullType<StringType>>()
                        .Resolve(ctx => ctx.Parent<User>().LastName);
                    descriptor.Field("email").Resolve(ctx => ctx.Parent<User>().Account?.Email);
                    descriptor.Field("fullName").Resolve(ctx => $"{ctx.Parent<User>().FirstName} {ctx.Parent<User>().LastName}".Trim());
                    descriptor.Field("password").Resolve(ctx => "********");
                    descriptor.Field(f => f.Biography).Name("biography");
                    descriptor.Field(f => f.LinkedIn).Name("linkedIn");
                    descriptor.Field(f => f.Facebook).Name("facebook");
                    descriptor.Field(f => f.Instagram).Name("instagram");
                    descriptor.Field(f => f.Phone).Name("phone");
                    descriptor.Field(f => f.Role).Name("role");
                }));

            services.AddScoped<IUnitOfWork, Services.Repositories.UnitOfWork>();
            services.AddScoped<IEmployerAuthService, Services.Auth.EmployerAuthService>();
            services.AddScoped<IModerationService, Services.Moderation.ModerationService>();
            services.AddScoped<ISocialService, SocialService>();
            services.AddScoped<IMessagingService, MessagingService>();
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IAccountService, AccountsService>();

            services.AddAuthentication(options =>
            {
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddScheme<AuthenticationSchemeOptions, SkipWebSocketAuthenticationHandler>(
                SkipWebSocketAuthenticationHandler.SchemeName,
                _ => { })
            .AddJwtBearer(options =>
            {
                options.ForwardDefaultSelector = context =>
                    !context.Items.ContainsKey(AuthenticationSocketSessionInterceptor.WebSocketTokenKey) &&
                    context.WebSockets.IsWebSocketRequest
                        ? SkipWebSocketAuthenticationHandler.SchemeName
                        : null;
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        if (context.HttpContext.Items.TryGetValue(
                                AuthenticationSocketSessionInterceptor.WebSocketTokenKey,
                                out object token))
                        {
                            context.Token = token as string;
                        }

                        return Task.CompletedTask;
                    }
                };
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.FromMinutes(1),
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
            app.UseStaticFiles();

            var webSocketOptions = new WebSocketOptions();
            string[] allowedOrigins = Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? new[] { "http://localhost:5173", "https://localhost:5173" };
            foreach (string origin in allowedOrigins)
                webSocketOptions.AllowedOrigins.Add(origin);
            app.UseWebSockets(webSocketOptions);

            app.UseRouting();

            app.UseCors(MyAllowSpecificOrigins);

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGraphQL();
            });
        }
    }
}
