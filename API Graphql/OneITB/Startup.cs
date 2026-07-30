using System;
using System.IO;
using System.Net;
using System.Security.Claims;
using System.Security.Cryptography;
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
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
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
using Services.Auth;
using OneItb.GraphQL.Services.Email;
using OneItb.GraphQL.Services.Storage;
using OneItb.GraphQL.Services.Security;
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
            JwtTokenOptions jwtOptions = JwtTokenOptions.FromConfiguration(Configuration);
            PasswordHashingOptions passwordHashingOptions =
                PasswordHashingOptions.FromConfiguration(Configuration);
            MagicLinkDeliveryOptions magicLinkDeliveryOptions =
                MagicLinkDeliveryOptions.FromConfiguration(
                    Configuration,
                    Environment.IsProduction());
            MicrosoftEntraOptions microsoftEntraOptions =
                MicrosoftEntraOptions.FromConfiguration(Configuration);

            services.AddControllers();
            services.AddHttpContextAccessor();
            services.AddHealthChecks();
            ConfigureForwardedHeaders(services);
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
                    "DataProtection-Keys-Development-v2"));
                keyDirectory.Create();

                services.AddDataProtection()
                    .SetApplicationName("OneITB23-Development")
                    .PersistKeysToFileSystem(keyDirectory);
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
            ConfigureMagicLinkRateLimiter(services, jwtOptions);
            ConfigureEmployerRequestRateLimiter(services, jwtOptions);
            ConfigureMicrosoftEntraRateLimiter(services, jwtOptions);

            graphQlBuilder
                .AddSocketSessionInterceptor<AuthenticationSocketSessionInterceptor>()
                .AddType(new ObjectType<Account>(descriptor =>
                {
                    descriptor.Field(account => account.PasswordHash).Ignore();
                    descriptor.Field(account => account.ExternalProvider).Ignore();
                    descriptor.Field(account => account.ExternalTenantId).Ignore();
                    descriptor.Field(account => account.ExternalSubjectId).Ignore();
                    descriptor.Field(account => account.LastExternalLoginAt).Ignore();
                    descriptor.Field(account => account.HasExternalIdentity).Ignore();
                    descriptor.Field(account => account.MagicLinkEnabled).Ignore();
                }))
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
                    descriptor.Field("institutionalAccountLinked")
                        .Type<NonNullType<BooleanType>>()
                        .Resolve(ctx =>
                        {
                            User user = ctx.Parent<User>();
                            string? actorValue = ctx.Service<IHttpContextAccessor>()
                                .HttpContext?
                                .User
                                .FindFirstValue(ClaimTypes.NameIdentifier);
                            return Guid.TryParse(actorValue, out Guid actorUserId) &&
                                actorUserId == user.Id &&
                                user.Account?.HasExternalIdentity == true;
                        });
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
                }))
                .AddType(new ObjectType<SocialAttachment>(descriptor =>
                {
                    descriptor.Field(attachment => attachment.Inquiry).Ignore();
                    descriptor.Field(attachment => attachment.Comment).Ignore();
                }))
                .AddType(new ObjectType<CommentReaction>(descriptor =>
                {
                    descriptor.Field(reaction => reaction.Comment).Ignore();
                    descriptor.Field(reaction => reaction.User).Ignore();
                }))
                .AddType(new ObjectType<Notification>(descriptor =>
                {
                    descriptor.Field(notification => notification.GroupKey).Ignore();
                    descriptor.Field(notification => notification.RowVersion).Ignore();
                    descriptor.Field(notification => notification.RelatedInquiry).Ignore();
                }))
                .AddType(new ObjectType<EmployerRequest>(descriptor =>
                {
                    descriptor.Field(request => request.RowVersion).Ignore();
                    descriptor.Field(request => request.ProcessedByAdmin).Ignore();
                    descriptor.Field(request => request.ProvisionedUser).Ignore();
                    descriptor.Field(request => request.OutboxMessage).Ignore();
                }))
                .AddType(new ObjectType<EmployerOnboardingOutboxMessage>(descriptor =>
                {
                    descriptor.Field(message => message.RowVersion).Ignore();
                    descriptor.Field(message => message.EmployerRequest).Ignore();
                }));

            services.AddScoped<IUnitOfWork, global::Services.Repositories.UnitOfWork>();
            services.AddSingleton(jwtOptions);
            services.AddSingleton(passwordHashingOptions);
            services.AddSingleton(magicLinkDeliveryOptions);
            services.AddSingleton(microsoftEntraOptions);
            services.AddSingleton(TimeProvider.System);
            services.AddSingleton<IJwtTokenService, JwtTokenService>();
            services.AddSingleton<IPasswordHasher, BcryptPasswordHasher>();
            services.AddSingleton<IMicrosoftEntraTokenValidator, MicrosoftEntraTokenValidator>();
            services.AddScoped<IMicrosoftEntraAuthService, MicrosoftEntraAuthService>();
            services.AddScoped<IEmployerAuthService, global::Services.Auth.EmployerAuthService>();
            services.AddScoped<IEmployerRequestService, global::Services.EmployerOnboarding.EmployerRequestService>();
            services.AddScoped<IModerationService, global::Services.Moderation.ModerationService>();
            services.AddScoped<ISocialService, SocialService>();
            services.AddScoped<ISocialGraphService, SocialGraphService>();
            services.AddScoped<IAcademicService, AcademicService>();
            services.AddScoped<INotificationService, NotificationService>();
            services.AddScoped<ISiuIntegrationService, MockSiuIntegrationService>();
            services.AddScoped<IJobService, JobService>();
            services.AddScoped<IMessagingService, MessagingService>();
            services.AddScoped<IUsersService, UsersService>();
            services.AddScoped<IAccountService, AccountsService>();
            services.AddScoped<IUploadCleanupService, UploadCleanupService>();
            EmployerOnboardingOptions employerOnboardingOptions =
                EmployerOnboardingOptions.FromConfiguration(Configuration);
            services.AddSingleton(employerOnboardingOptions);
            services.AddScoped<EmployerOnboardingDeliveryProcessor>();
            ConfigureEmailSender(services);
            ConfigureFileStorage(services);
            services.AddSingleton<ILinkPreviewService, LinkPreviewService>();
            services.AddHostedService<UploadCleanupHostedService>();
            services.AddHostedService<UnreadMessageReminderHostedService>();
            services.AddHostedService<EmployerOnboardingHostedService>();

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
                    ValidIssuer = jwtOptions.Issuer,
                    ValidAudience = jwtOptions.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key))
                };
            });

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            app.UseForwardedHeaders();

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
            app.UseStaticFiles(new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
                    ctx.Context.Response.Headers.Append("Cross-Origin-Resource-Policy", "cross-origin");
                }
            });

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

            services.TryAddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(redisConnectionString));
            graphQlBuilder.AddRedisSubscriptions(sp => sp.GetRequiredService<IConnectionMultiplexer>());
        }

        private void ConfigureFileStorage(IServiceCollection services)
        {
            services.AddSingleton<IFileContentInspector, FileContentInspector>();
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
            EmailDeliveryConfiguration delivery =
                EmailDeliveryConfiguration.FromConfiguration(
                    Configuration,
                    Environment);

            if (!delivery.UsesSmtp)
            {
                services.AddSingleton<IEmailSender>(serviceProvider =>
                    new PickupDirectoryEmailService(
                        delivery.PickupDirectory!,
                        serviceProvider.GetRequiredService<
                            Microsoft.Extensions.Logging.ILogger<PickupDirectoryEmailService>>()));
                return;
            }

            services.AddSingleton<IEmailSender>(sp => new SmtpEmailService(
                delivery.Smtp!,
                sp.GetRequiredService<Microsoft.Extensions.Logging.ILogger<SmtpEmailService>>()));
        }

        private void ConfigureMagicLinkRateLimiter(
            IServiceCollection services,
            JwtTokenOptions jwtOptions)
        {
            MagicLinkRateLimitOptions options =
                MagicLinkRateLimitOptions.FromConfiguration(Configuration);
            byte[] fingerprintKey = SHA256.HashData(
                Encoding.UTF8.GetBytes($"oneitb:magiclink-rate-limit:{jwtOptions.Key}"));

            services.AddSingleton(options);
            services.AddSingleton(new MagicLinkRateLimitFingerprintKey(fingerprintKey));

            string? redisConnectionString = Configuration.GetConnectionString("Redis")
                ?? Configuration["Redis:ConnectionString"];
            if (string.IsNullOrWhiteSpace(redisConnectionString))
            {
                services.AddSingleton<IMagicLinkRateLimiter, InMemoryMagicLinkRateLimiter>();
                return;
            }

            services.TryAddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(redisConnectionString));
            services.AddSingleton<IMagicLinkRateLimiter, RedisMagicLinkRateLimiter>();
        }

        private void ConfigureEmployerRequestRateLimiter(
            IServiceCollection services,
            JwtTokenOptions jwtOptions)
        {
            EmployerRequestRateLimitOptions options =
                EmployerRequestRateLimitOptions.FromConfiguration(Configuration);
            byte[] fingerprintKey = SHA256.HashData(
                Encoding.UTF8.GetBytes(
                    $"oneitb:employer-request-rate-limit:{jwtOptions.Key}"));

            services.AddSingleton(options);
            services.AddSingleton(
                new EmployerRequestRateLimitFingerprintKey(fingerprintKey));

            string? redisConnectionString = Configuration.GetConnectionString("Redis")
                ?? Configuration["Redis:ConnectionString"];
            if (string.IsNullOrWhiteSpace(redisConnectionString))
            {
                services.AddSingleton<
                    IEmployerRequestRateLimiter,
                    InMemoryEmployerRequestRateLimiter>();
                return;
            }

            services.TryAddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(redisConnectionString));
            services.AddSingleton<
                IEmployerRequestRateLimiter,
                RedisEmployerRequestRateLimiter>();
        }

        private void ConfigureMicrosoftEntraRateLimiter(
            IServiceCollection services,
            JwtTokenOptions jwtOptions)
        {
            MicrosoftEntraRateLimitOptions options =
                MicrosoftEntraRateLimitOptions.FromConfiguration(Configuration);
            byte[] fingerprintKey = SHA256.HashData(
                Encoding.UTF8.GetBytes($"oneitb:entra-rate-limit:{jwtOptions.Key}"));

            services.AddSingleton(options);
            services.AddSingleton(new MicrosoftEntraRateLimitFingerprintKey(fingerprintKey));

            string? redisConnectionString = Configuration.GetConnectionString("Redis")
                ?? Configuration["Redis:ConnectionString"];
            if (string.IsNullOrWhiteSpace(redisConnectionString))
            {
                services.AddSingleton<
                    IMicrosoftEntraRateLimiter,
                    InMemoryMicrosoftEntraRateLimiter>();
                return;
            }

            services.TryAddSingleton<IConnectionMultiplexer>(_ =>
                ConnectionMultiplexer.Connect(redisConnectionString));
            services.AddSingleton<
                IMicrosoftEntraRateLimiter,
                RedisMicrosoftEntraRateLimiter>();
        }

        private void ConfigureForwardedHeaders(IServiceCollection services)
        {
            services.Configure<ForwardedHeadersOptions>(options =>
            {
                options.ForwardedHeaders =
                    ForwardedHeaders.XForwardedFor |
                    ForwardedHeaders.XForwardedProto;
                options.ForwardLimit = 1;

                foreach (string proxy in Configuration
                             .GetSection("ReverseProxy:KnownProxies")
                             .Get<string[]>() ?? Array.Empty<string>())
                {
                    if (!IPAddress.TryParse(proxy, out IPAddress? address))
                    {
                        throw new InvalidOperationException(
                            $"ReverseProxy:KnownProxies contains an invalid IP address: {proxy}");
                    }

                    options.KnownProxies.Add(address);
                }

                foreach (string network in Configuration
                             .GetSection("ReverseProxy:KnownNetworks")
                             .Get<string[]>() ?? Array.Empty<string>())
                {
                    string[] parts = network.Split('/', 2, StringSplitOptions.TrimEntries);
                    if (parts.Length != 2 ||
                        !IPAddress.TryParse(parts[0], out IPAddress? prefix) ||
                        !int.TryParse(parts[1], out int prefixLength))
                    {
                        throw new InvalidOperationException(
                            $"ReverseProxy:KnownNetworks contains an invalid CIDR: {network}");
                    }

                    int maxPrefixLength = prefix.AddressFamily ==
                        System.Net.Sockets.AddressFamily.InterNetwork
                            ? 32
                            : 128;
                    if (prefixLength < 0 || prefixLength > maxPrefixLength)
                    {
                        throw new InvalidOperationException(
                            $"ReverseProxy:KnownNetworks contains an invalid prefix length: {network}");
                    }

                    options.KnownNetworks.Add(
                        new Microsoft.AspNetCore.HttpOverrides.IPNetwork(
                            prefix,
                            prefixLength));
                }
            });
        }
    }
}
