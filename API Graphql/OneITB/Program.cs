using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace OneItb.GraphQL
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = CreateHostBuilder(args).Build();

            using (var scope = host.Services.CreateScope())
            {
                var services = scope.ServiceProvider;
                try
                {
                    var context = services.GetRequiredService<OneItb.Data.OneItbContext>();
                    var configuration = services.GetRequiredService<IConfiguration>();
                    var environment = services.GetRequiredService<IHostEnvironment>();
                    string? demoPassword = configuration["Seed:DemoPassword"];

                    if (string.IsNullOrWhiteSpace(demoPassword) && environment.IsDevelopment())
                        demoPassword = "Test1234!";

                    bool enableDemoData = configuration.GetValue("Seed:EnableDemoData", true);
                    OneItb.Data.DbInitializer.Initialize(
                        context,
                        new OneItb.Data.DbSeedOptions(enableDemoData, demoPassword));
                }
                catch (Exception ex)
                {
                    var logger = services.GetRequiredService<ILogger<Program>>();
                    logger.LogError(ex, "An error occurred seeding the DB.");
                }
            }

            host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddSimpleConsole(options =>
                    {
                        options.IncludeScopes = true;
                        options.SingleLine = true;
                        options.TimestampFormat = "yyyy-MM-ddTHH:mm:ss.fff ";
                    });
                    logging.AddDebug();
                })
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
