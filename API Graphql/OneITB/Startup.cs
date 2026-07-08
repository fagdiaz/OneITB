using System;
using System.IO;
using System.Text;
using System.Threading.RateLimiting;
using System.Threading.Tasks;
using Microsoft.AspNetCore.DataProtection;
using GraphQL.GraphQL;
using HotChocolate.Execution.Configuration;
using HotChocolate.Types;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
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
using Services.LinkPreviews;
using Services.Uploads;
using OneItb.GraphQL.Infrastructure;
using Services.Academic;
using Services.Notifications;
using Services.Siu;
using Services.Jobs;
using OneItb.GraphQL.Services.Email;
using OneItb.GraphQL.Services.Storage;
using StackExchange.Redis;

namespace OneItb.GraphQL
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }
        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
        private const string FixedWindowRateLimitPolicy = "fixed-window-per-ip";

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddControllers();
            services.AddHttpContextAccessor();
            services.AddHealthChecks();
            services.AddRateLimiter(options =>
            {
                options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
                options.AddPolicy(FixedWindowRateLimitPolicy, httpContext =>
                {
                    string key = httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
                    int permitLimit = Math.Max(1, Configuration.GetValue("RateLimiting:PermitLimit", 100));
                    int windowMinutes = Math.Max(1, Configuration.GetValue("RateLimiting:WindowMinutes", 1));

                    return RateLimitPartition.GetFixedWindowLimiter(
                        key,
                        _ => new FixedWindowRateLimiterOptions
                        {
                            PermitLimit = permitLimit,
                            Window = TimeSpan.FromMinutes(windowMinutes),
                            QueueLimit = 0,
                            AutoReplenishment = true
                        });
                });
            });
            if (Environment.IsDevelopment())
            {
                var keyDirectory = new DirectoryInfo(System.IO.Path.Combine(
                    Environment.ContentRootPath,
                    "App_Data",
                    "DataProtection-Keys"));
                keyDirectory.Create();

                var dataProtectionBuilder = services.AddDataProtection()
                    .PersistKeysToFileSystem(keyDirectory);
                if (OperatingSystem.IsWindows())
                {
                    dataProtectionBuilder.ProtectKeysWithDpapi();
                }
            }
            services.AddCors(options =>
            {
                options.AddPolicy(MyAllowSpecificOrigins,
                builder =>
                {
                    string[] allowedOrigins = Configuration
                        .GetSection("Cors:AllowedOrigins")
                        .Get<string[]>() ?? new[] { "http://localhost:5173", "https://localhost:5173", "http://127.0.0.1:5173", "https://127.0.0.1:5173" };
                    builder
                        .WithOrigins(allowedOrigins)
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                        // Note: AllowCredentials() intentionally omitted — JWT is in Authorization header, not cookies.
                });
            });

            services.AddSingleton<AuditSaveChangesInterceptor>();
            services.AddPooledDbContextFactory<OneItbContext>((serviceProvider, opt) =>
                opt.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection"),
                    sql => sql
                        .MigrationsAssembly("Data")
                        .UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery))
                    .AddInterceptors(serviceProvider.GetRequiredService<AuditSaveChangesInterceptor>()));
            services.AddScoped<OneItbContext>(p => p.GetRequiredService<IDbContextFactory<OneItbContext>>().CreateDbContext());

            var graphQlBuilder = services.AddGraphQLServer()
                // HC 14 breaking change: RegisterDbContext(DbContextKind.Pooled) →
                // RegisterDbContextFactory<T>() — works with AddPooledDbContextFactory above.
                .RegisterDbContextFactory<OneItbContext>()
                .AddProjections()
                .AddFiltering()
                .AddSorting()
                .AddAuthorization()
                .AddErrorFilter<GraphQLErrorFilter>()
                .AddMaxExecutionDepthRule(Configuration.GetValue("GraphQL:MaxExecutionDepth", 15))
                .ModifyCostOptions(options =>
                {
                    options.MaxFieldCost = Configuration.GetValue("GraphQL:MaxFieldCost", 200000);
                    options.MaxTypeCost = Configuration.GetValue("GraphQL:MaxTypeCost", 200000);
                    options.EnforceCostLimits = true;
                })
                .ModifyParserOptions(options =>
                {
                    options.MaxAllowedNodes = Configuration.GetValue("GraphQL:MaxAllowedNodes", 50000);
                    options.MaxAllowedTokens = Configuration.GetValue("GraphQL:MaxAllowedTokens", 100000);
                    options.MaxAllowedFields = Configuration.GetValue("GraphQL:MaxAllowedFields", 20000);
                })
                .ModifyPagingOptions(options =>
                {
                    options.DefaultPageSize = Configuration.GetValue("GraphQL:DefaultPageSize", 20);
                    options.MaxPageSize = Configuration.GetValue("GraphQL:MaxPageSize", 50);
                    options.IncludeTotalCount = true;
                })
                .ModifyRequestOptions(opt =>
                    opt.IncludeExceptionDetails = Configuration.GetValue<bool>("GraphQL:IncludeExceptionDetails"))
                .AddQueryType<Query>()
                .AddMutationType<Mutation>()
                .AddSubscriptionType<Subscription>();

            ConfigureSubscriptionProvider(graphQlBuilder, services);

            graphQlBuilder
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
                    descriptor.Field(f => f.AvatarUrl).Name("avatarUrl");
                    descriptor.Field(f => f.UserCareers).Name("userCareers");
                    descriptor.Field(f => f.CvExperiences).Name("cvExperiences");
                    descriptor.Field(f => f.CvEducations).Name("cvEducations");
                    descriptor.Field(f => f.CvProjects).Name("cvProjects");
                    descriptor.Field(f => f.CvSkills).Name("cvSkills");
                    descriptor.Field(f => f.CvLanguages).Name("cvLanguages");
                    descriptor.Field(f => f.Role).Name("role");
                    descriptor.Field(f => f.MutedUntil).Name("mutedUntil");
                    descriptor.Field(f => f.IsPublicProfile).Name("isPublicProfile");
                    descriptor.Field("totalPosts")
                        .Type<NonNullType<IntType>>()
                        .Resolve(ctx =>
                        {
                            User user = ctx.Parent<User>();
                            return ctx.DataLoader<UserPostCountDataLoader>()
                                .LoadAsync(user.Id, ctx.RequestAborted);
                        });
                    descriptor.Field("totalComments")
                        .Type<NonNullType<IntType>>()
                        .Resolve(ctx =>
                        {
                            User user = ctx.Parent<User>();
                            return ctx.DataLoader<UserCommentCountDataLoader>()
                                .LoadAsync(user.Id, ctx.RequestAborted);
                        });
                    descriptor.Field("totalLikesReceived")
                        .Type<NonNullType<IntType>>()
                        .Resolve(ctx =>
                        {
                            User user = ctx.Parent<User>();
                            return ctx.DataLoader<UserLikesReceivedCountDataLoader>()
                                .LoadAsync(user.Id, ctx.RequestAborted);
                        });
                    descriptor.Field("totalReportsReceived")
                        .Type<NonNullType<IntType>>()
                        .Resolve(ctx =>
                        {
                            User user = ctx.Parent<User>();
                            return ctx.DataLoader<UserReportsReceivedCountDataLoader>()
                                .LoadAsync(user.Id, ctx.RequestAborted);
                        });
                }))
                .AddType(new ObjectType<UserCvExperience>(descriptor =>
                {
                    descriptor.Field(f => f.User).Ignore();
                    descriptor.Field(f => f.IsHidden).Name("isHidden");
                }))
                .AddType(new ObjectType<UserCvEducation>(descriptor =>
                {
                    descriptor.Field(f => f.User).Ignore();
                    descriptor.Field(f => f.IsHidden).Name("isHidden");
                }))
                .AddType(new ObjectType<UserCvProject>(descriptor =>
                {
                    descriptor.Field(f => f.User).Ignore();
                    descriptor.Field(f => f.IsHidden).Name("isHidden");
                }))
                .AddType(new ObjectType<UserCvSkill>(descriptor =>
                {
                    descriptor.Field(f => f.User).Ignore();
                    descriptor.Field(f => f.IsHidden).Name("isHidden");
                }))
                .AddType(new ObjectType<UserCvLanguage>(descriptor =>
                {
                    descriptor.Field(f => f.User).Ignore();
                    descriptor.Field(f => f.IsHidden).Name("isHidden");
                }))
                .AddType(new ObjectType<Inquiry>(descriptor =>
                {
                    descriptor.Field("reportCount")
                        .Type<NonNullType<IntType>>()
                        .Resolve(ctx =>
                        {
                            Inquiry inquiry = ctx.Parent<Inquiry>();
                            return ctx.DataLoader<InquiryReportCountDataLoader>()
                                .LoadAsync(inquiry.Id, ctx.RequestAborted);
                        });
                }))
                .AddType(new ObjectType<Comment>(descriptor =>
                {
                    descriptor.Field("reportCount")
                        .Type<NonNullType<IntType>>()
                        .Resolve(_ => 0);
                }));

            services.AddScoped<IUnitOfWork, global::Services.Repositories.UnitOfWork>();
            services.AddScoped<IEmployerAuthService, global::Services.Auth.EmployerAuthService>();
            services.AddScoped<IModerationService, global::Services.Moderation.ModerationService>();
            services.AddScoped<ISocialService, SocialService>();
            services.AddScoped<IAcademicService, AcademicService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<ISiuIntegrationService, MockSiuIntegrationService>();
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<IMessagingService, MessagingService>();
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IAccountService, AccountsService>();
            services.AddScoped<IUploadCleanupService, UploadCleanupService>();
            ConfigureEmailSender(services);
            ConfigureFileStorage(services);
            services.AddSingleton<ILinkPreviewService, LinkPreviewService>();
            services.AddHostedService<UploadCleanupHostedService>();

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
                                out object? token))
                        {
                            context.Token = token?.ToString();
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
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]!))
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
            else
            {
                app.UseHsts();
            }

            app.UseMiddleware<CorrelationIdMiddleware>();
            app.UseMiddleware<SecurityHeadersMiddleware>();
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            var webSocketOptions = new WebSocketOptions();
            string[] allowedOrigins = Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? new[] { "http://localhost:5173", "https://localhost:5173", "http://127.0.0.1:5173", "https://127.0.0.1:5173" };
            foreach (string origin in allowedOrigins)
                webSocketOptions.AllowedOrigins.Add(origin);
            app.UseWebSockets(webSocketOptions);

            app.UseRouting();

            app.UseCors(MyAllowSpecificOrigins);
            app.UseRateLimiter();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHealthChecks("/health");
                endpoints.MapControllers().RequireRateLimiting(FixedWindowRateLimitPolicy);
                endpoints.MapGraphQL().RequireRateLimiting(FixedWindowRateLimitPolicy);
            });
        }

        private void ConfigureSubscriptionProvider(IRequestExecutorBuilder graphQlBuilder, IServiceCollection services)
        {
            string? redisConnectionString = Configuration.GetConnectionString("Redis")
                ?? Configuration["Redis:ConnectionString"];

            if (string.IsNullOrWhiteSpace(redisConnectionString))
            {
                graphQlBuilder.AddInMemorySubscriptions();
                return;
            }

            services.AddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(redisConnectionString));
            graphQlBuilder.AddRedisSubscriptions(sp => sp.GetRequiredService<IConnectionMultiplexer>());
        }

        private void ConfigureFileStorage(IServiceCollection services)
        {
            services.Configure<CloudinarySettings>(Configuration.GetSection("CloudinarySettings"));

            string? cloudinaryUrl = Configuration["CloudinarySettings:Url"];
            if (string.IsNullOrWhiteSpace(cloudinaryUrl))
            {
                services.AddScoped<IFileStorageService, LocalFileStorageService>();
                return;
            }

            services.AddHttpClient<IFileStorageService, CloudinaryStorageService>();
        }

        private void ConfigureEmailSender(IServiceCollection services)
        {
            string? host = Configuration["SmtpSettings:Host"];
            string? user = Configuration["SmtpSettings:User"];
            string? pass = Configuration["SmtpSettings:Pass"];
            int port = Configuration.GetValue<int?>("SmtpSettings:Port") ?? 0;

            if (string.IsNullOrWhiteSpace(host) ||
                string.IsNullOrWhiteSpace(user) ||
                string.IsNullOrWhiteSpace(pass) ||
                port <= 0)
            {
                services.AddSingleton<IEmailSender, ConsoleEmailService>();
                return;
            }

            bool enableSsl = Configuration.GetValue("SmtpSettings:EnableSsl", true);
            string? from = Configuration["SmtpSettings:From"];
            var settings = new SmtpEmailSettings(
                host.Trim(),
                port,
                user.Trim(),
                pass,
                string.IsNullOrWhiteSpace(from) ? null : from.Trim(),
                enableSsl);

            services.AddSingleton<IEmailSender>(sp => new SmtpEmailService(
                settings,
                sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<SmtpEmailService>>()));
        }
    }
}
