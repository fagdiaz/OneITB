using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;

namespace OneItb.Data
{
    public static class DbInitializer
    {
        public static readonly Guid AdminId = Guid.Parse("3f7b2c8a-9e1d-4f5b-8a6c-2d3e4f5a6b7c");
        public static readonly Guid StudentId = Guid.Parse("1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d");
        public static readonly Guid TeacherId = Guid.Parse("9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c");
        public static readonly Guid ModeratorId = Guid.Parse("5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d");
        public static readonly Guid EmployerId = Guid.Parse("4e3d2c1b-0a9f-8e7d-6c5b-4a3f2e1d0c9b");

        private static readonly DateTime SeedStart =
            DateTime.SpecifyKind(new DateTime(2026, 6, 1, 9, 0, 0), DateTimeKind.Utc);

        private static readonly SeedUser[] SeedUsers =
        {
            new(AdminId, "admin@itbeltran.com.ar", "Sofia", "Martinez", "Administrador", "Administracion academica y tecnologica."),
            new(StudentId, "student@itbeltran.com.ar", "Lucia", "Fernandez", "Estudiante", "Estudiante de Analisis de Sistemas."),
            new(TeacherId, "teacher@itbeltran.com.ar", "Gabriel", "Rossi", "Profesor", "Docente de programacion y bases de datos."),
            new(ModeratorId, "moderator@itbeltran.com.ar", "Valentina", "Suarez", "Moderador", "Moderacion y convivencia de la comunidad."),
            new(EmployerId, "employer@itbeltran.com.ar", "Martin", "Pereyra", "Empleador", "Vinculacion profesional y oportunidades laborales."),
            new(Guid.Parse("6b7c8d9e-0f1a-2b3c-4d5e-6f7a8b9c0d1e"), "camila.torres@itbeltran.com.ar", "Camila", "Torres", "Estudiante", "Interesada en desarrollo web y experiencia de usuario."),
            new(Guid.Parse("7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f"), "tomas.gimenez@itbeltran.com.ar", "Tomas", "Gimenez", "Estudiante", "Estudiante orientado a infraestructura y redes."),
            new(Guid.Parse("8d9e0f1a-2b3c-4d5e-6f7a-8b9c0d1e2f3a"), "paula.arias@itbeltran.com.ar", "Paula", "Arias", "Profesor", "Docente de analisis matematico y estadistica."),
            new(Guid.Parse("9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b"), "diego.molina@itbeltran.com.ar", "Diego", "Molina", "Estudiante", "Estudiante interesado en calidad de software."),
            new(Guid.Parse("0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c"), "julieta.castro@itbeltran.com.ar", "Julieta", "Castro", "Estudiante", "Estudiante de primer anio y ayudante de estudio.")
        };

        private static readonly SeedSubject[] SeedSubjects =
        {
            new("Programacion I", "PROG1"),
            new("Base de Datos", "BDD"),
            new("Analisis de Sistemas", "ADS"),
            new("Redes y Comunicaciones", "REDES"),
            new("Matematica Aplicada", "MAT")
        };

        private static readonly string[] InquiryTopics =
        {
            "Material para preparar el proximo parcial",
            "Duda sobre el trabajo practico integrador",
            "Grupo de estudio para esta semana"
        };

        public static void Initialize(OneItbContext context)
        {
            context.Database.Migrate();

            SeedAccountsAndUsers(context);
            SeedSubjectData(context);
            SeedInquiryData(context);
            SeedSocialData(context);
        }

        private static void SeedAccountsAndUsers(OneItbContext context)
        {
            string passwordHash = BCrypt.Net.BCrypt.HashPassword("Test1234!");
            var existingAccounts = context.Accounts
                .Where(account => SeedUsers.Select(user => user.Id).Contains(account.Id))
                .ToDictionary(account => account.Id);

            foreach (var seedUser in SeedUsers)
            {
                if (!existingAccounts.TryGetValue(seedUser.Id, out Account? account))
                {
                    context.Accounts.Add(new Account
                    {
                        Id = seedUser.Id,
                        Email = seedUser.Email,
                        PasswordHash = passwordHash,
                        CreatedAt = SeedStart
                    });
                }
                else if (!BCrypt.Net.BCrypt.Verify("Test1234!", account.PasswordHash))
                {
                    account.PasswordHash = passwordHash;
                }
            }

            context.SaveChanges();

            var existingUserIds = context.Users
                .Where(user => SeedUsers.Select(seed => seed.Id).Contains(user.Id))
                .Select(user => user.Id)
                .ToHashSet();

            foreach (var seedUser in SeedUsers.Where(user => !existingUserIds.Contains(user.Id)))
            {
                context.Users.Add(new User
                {
                    Id = seedUser.Id,
                    FirstName = seedUser.FirstName,
                    LastName = seedUser.LastName,
                    Role = seedUser.Role,
                    Biography = seedUser.Biography,
                    LinkedIn = string.Empty,
                    Facebook = string.Empty,
                    Instagram = string.Empty,
                    Phone = string.Empty,
                    IsActive = true
                });
            }

            context.SaveChanges();
        }

        private static void SeedSubjectData(OneItbContext context)
        {
            var existingCodes = context.Subjects
                .Where(subject => SeedSubjects.Select(seed => seed.Code).Contains(subject.Code))
                .Select(subject => subject.Code)
                .ToHashSet();

            foreach (var subject in SeedSubjects.Where(subject => !existingCodes.Contains(subject.Code)))
            {
                context.Subjects.Add(new Subject
                {
                    Name = subject.Name,
                    Code = subject.Code
                });
            }

            context.SaveChanges();
        }

        private static void SeedInquiryData(OneItbContext context)
        {
            var subjects = context.Subjects
                .Where(subject => SeedSubjects.Select(seed => seed.Code).Contains(subject.Code))
                .OrderBy(subject => subject.Code)
                .ToArray();

            var managedInquiryIds = SeedUsers
                .SelectMany((user, userIndex) => Enumerable.Range(0, 3)
                    .Select(topicIndex => StableGuid($"inquiry-{userIndex}-{topicIndex}")))
                .ToArray();

            var existingInquiryIds = context.Inquiries
                .Where(inquiry => managedInquiryIds.Contains(inquiry.Id))
                .Select(inquiry => inquiry.Id)
                .ToHashSet();

            for (int userIndex = 0; userIndex < SeedUsers.Length; userIndex++)
            {
                for (int topicIndex = 0; topicIndex < InquiryTopics.Length; topicIndex++)
                {
                    Guid inquiryId = StableGuid($"inquiry-{userIndex}-{topicIndex}");
                    if (existingInquiryIds.Contains(inquiryId))
                        continue;

                    Subject subject = subjects[(userIndex + topicIndex) % subjects.Length];
                    context.Inquiries.Add(new Inquiry
                    {
                        Id = inquiryId,
                        UserId = SeedUsers[userIndex].Id,
                        SubjectId = subject.Id,
                        Title = InquiryTopics[topicIndex],
                        Content = BuildInquiryContent(subject.Name, userIndex, topicIndex),
                        PublishDate = SeedStart.AddHours(userIndex * 3 + topicIndex)
                    });
                }
            }

            context.SaveChanges();
        }

        private static void SeedSocialData(OneItbContext context)
        {
            Guid[] managedInquiryIds = SeedUsers
                .SelectMany((user, userIndex) => Enumerable.Range(0, 3)
                    .Select(topicIndex => StableGuid($"inquiry-{userIndex}-{topicIndex}")))
                .ToArray();

            var inquiries = context.Inquiries
                .Where(inquiry => managedInquiryIds.Contains(inquiry.Id))
                .OrderBy(inquiry => inquiry.PublishDate)
                .ToArray();

            var existingReactionKeys = context.Reactions
                .Select(reaction => new { reaction.InquiryId, reaction.UserId })
                .ToHashSet();

            for (int inquiryIndex = 0; inquiryIndex < inquiries.Length; inquiryIndex++)
            {
                for (int offset = 1; offset <= 3; offset++)
                {
                    Guid userId = SeedUsers[(inquiryIndex + offset) % SeedUsers.Length].Id;
                    var key = new { InquiryId = inquiries[inquiryIndex].Id, UserId = userId };
                    if (existingReactionKeys.Contains(key))
                        continue;

                    context.Reactions.Add(new Reaction
                    {
                        Id = StableGuid($"reaction-{inquiryIndex}-{offset}"),
                        InquiryId = inquiries[inquiryIndex].Id,
                        UserId = userId,
                        CreatedAt = inquiries[inquiryIndex].PublishDate.AddMinutes(offset * 7)
                    });
                }
            }

            context.SaveChanges();

            var existingCommentIds = context.Comments.Select(comment => comment.Id).ToHashSet();
            for (int inquiryIndex = 0; inquiryIndex < inquiries.Length; inquiryIndex++)
            {
                Guid parentId = StableGuid($"comment-{inquiryIndex}-parent");
                if (!existingCommentIds.Contains(parentId))
                {
                    context.Comments.Add(new Comment
                    {
                        Id = parentId,
                        InquiryId = inquiries[inquiryIndex].Id,
                        UserId = SeedUsers[(inquiryIndex + 2) % SeedUsers.Length].Id,
                        Content = "Me sumo a la consulta. Puedo compartir mis apuntes y una guia de ejercicios.",
                        CreatedAt = inquiries[inquiryIndex].PublishDate.AddMinutes(15)
                    });
                }

                if (inquiryIndex % 2 != 0)
                    continue;

                Guid replyId = StableGuid($"comment-{inquiryIndex}-reply");
                if (!existingCommentIds.Contains(replyId))
                {
                    context.Comments.Add(new Comment
                    {
                        Id = replyId,
                        InquiryId = inquiries[inquiryIndex].Id,
                        UserId = SeedUsers[(inquiryIndex + 4) % SeedUsers.Length].Id,
                        ParentCommentId = parentId,
                        Content = "Gracias. Organicemos el material por tema y coordinemos un horario.",
                        CreatedAt = inquiries[inquiryIndex].PublishDate.AddMinutes(28)
                    });
                }
            }

            context.SaveChanges();

            var reportSeeds = new[]
            {
                new CommunityReport
                {
                    Id = StableGuid("report-0"),
                    InquiryId = inquiries[0].Id,
                    ReporterId = ModeratorId,
                    Reason = "Contenido duplicado que requiere revision.",
                    Status = "Pending",
                    CreatedAt = inquiries[0].PublishDate.AddHours(2)
                },
                new CommunityReport
                {
                    Id = StableGuid("report-1"),
                    InquiryId = inquiries[1].Id,
                    ReporterId = StudentId,
                    Reason = "Posible informacion incorrecta sobre la fecha de entrega.",
                    Status = "Pending",
                    CreatedAt = inquiries[1].PublishDate.AddHours(2)
                }
            };

            var existingReportIds = context.CommunityReports
                .Where(report => reportSeeds.Select(seed => seed.Id).Contains(report.Id))
                .Select(report => report.Id)
                .ToHashSet();

            context.CommunityReports.AddRange(reportSeeds.Where(report => !existingReportIds.Contains(report.Id)));
            context.SaveChanges();
        }

        private static string BuildInquiryContent(string subjectName, int userIndex, int topicIndex)
        {
            string[] details =
            {
                "Que bibliografia y ejercicios recomiendan para repasar los conceptos principales?",
                "Estoy revisando la consigna y quisiera comparar el enfoque de modelado antes de entregar.",
                "Propongo una reunion breve para ordenar dudas y resolver ejemplos en conjunto."
            };
            return $"{details[topicIndex]} La consulta corresponde a {subjectName} y fue preparada por el usuario de prueba {userIndex + 1}.";
        }

        private static Guid StableGuid(string value)
        {
            byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes($"oneitb23:{value}"));
            return new Guid(hash.AsSpan(0, 16));
        }

        private sealed record SeedUser(
            Guid Id,
            string Email,
            string FirstName,
            string LastName,
            string Role,
            string Biography);

        private sealed record SeedSubject(string Name, string Code);
    }
}
