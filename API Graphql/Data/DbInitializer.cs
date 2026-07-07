using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;

namespace OneItb.Data
{
    public sealed record DbSeedOptions(bool EnableDemoData = true, string? DemoPassword = null);

    public static class DbInitializer
    {
        public static readonly Guid AdminId = Guid.Parse("3f7b2c8a-9e1d-4f5b-8a6c-2d3e4f5a6b7c");
        public static readonly Guid StudentId = Guid.Parse("1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d");
        public static readonly Guid TeacherId = Guid.Parse("9f8e7d6c-5b4a-3f2e-1d0c-9b8a7f6e5d4c");
        public static readonly Guid ModeratorId = Guid.Parse("5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d");
        public static readonly Guid EmployerId = Guid.Parse("4e3d2c1b-0a9f-8e7d-6c5b-4a3f2e1d0c9b");

        private static readonly DateTime SeedStart =
            DateTime.SpecifyKind(new DateTime(2026, 6, 1, 9, 0, 0), DateTimeKind.Utc);

        private static readonly List<SeedUser> SeedUsers = new()
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

        static DbInitializer()
        {
            // Mega-Seed: Generate 40 additional test users
            for (int i = 1; i <= 40; i++)
            {
                var bytes = new byte[16];
                new Random(i).NextBytes(bytes);
                var id = new Guid(bytes);
                SeedUsers.Add(new SeedUser(
                    id, 
                    $"user{i}@itbeltran.com.ar", 
                    $"Usuario", 
                    $"Prueba {i}", 
                    "Estudiante", 
                    $"Mega-Seed account #{i} for load testing."
                ));
            }
        }

        private static readonly SeedSubject[] SeedSubjects =
        {
            // Analisis de Sistemas
            new("Programacion I", "PROG1"),
            new("Base de Datos", "BDD"),
            new("Analisis de Sistemas", "ADS"),
            new("Redes y Comunicaciones", "REDES"),
            new("Matematica Aplicada", "MAT"),
            new("Ingenieria de Software", "ISOFT"),

            // Diseno Industrial
            new("Ergonomia", "ERGO"),
            new("Materiales y Procesos", "MATPRO"),
            new("Dibujo Tecnico", "DIBTEC"),

            // Enfermeria
            new("Anatomia Funcional", "ANAT"),
            new("Practica Profesional I", "PRAC1"),
            new("Farmacologia", "FARMA"),

            // Radiologia
            new("Fisica de las Radiaciones", "FISRAD"),
            new("Anatomia Radiologica", "ANATRAD"),
            new("Tecnicas Radiologicas", "TECRAD"),

            // Higiene Seguridad y Ambiente Laboral
            new("Toxicologia", "TOXI"),
            new("Ergonomia Laboral", "ERGOLAB"),
            new("Legislacion Laboral", "LEGLAB"),

            // Comunicacion Multimedial
            new("Diseno Grafico", "DISGRAF"),
            new("Produccion Audiovisual", "PRODAUD"),
            new("Comunicacion Digital", "COMDIG"),

            // Administracion Contable
            new("Contabilidad I", "CONT1"),
            new("Matematica Financiera", "MATFIN"),
            new("Derecho Comercial", "DERCOM"),

            // Administracion de PyMES
            new("Gestion de Recursos Humanos", "RRHH"),
            new("Marketing Estrategico", "MKT"),
            new("Finanzas Corporativas", "FINCORP"),

            // Ciencia de Datos e Inteligencia Artificial
            new("Estadistica Aplicada", "ESTAP"),
            new("Machine Learning", "ML"),
            new("Bases de Datos NoSQL", "NOSQL")
        };

        private static readonly (string Name, string Code)[] SeedCareers =
        {
            ("Analisis de Sistemas", "ADS"),
            ("Diseno Industrial", "DIND"),
            ("Enfermeria", "ENF"),
            ("Radiologia", "RAD"),
            ("Higiene Seguridad y Ambiente Laboral", "HSAL"),
            ("Comunicacion Multimedial", "CMM"),
            ("Administracion Contable", "ACON"),
            ("Administracion de PyMES", "APYM"),
            ("Ciencia de Datos e Inteligencia Artificial", "CDIA")
        };

        private static readonly string[] InquiryTopics =
        {
            "Material para preparar el proximo parcial",
            "Duda sobre el trabajo practico integrador",
            "Grupo de estudio para esta semana"
        };

        public static void Initialize(OneItbContext context, DbSeedOptions? options = null)
        {
            context.Database.Migrate();

            DbSeedOptions seedOptions = options ?? new DbSeedOptions(
                EnableDemoData: true,
                DemoPassword: Environment.GetEnvironmentVariable("ONEITB_SEED_DEMO_PASSWORD"));

            if (!seedOptions.EnableDemoData)
                return;

            string demoPassword = NormalizeDemoPassword(seedOptions.DemoPassword);

            SeedAccountsAndUsers(context, demoPassword);
            SeedCareerData(context);
            SeedSubjectData(context);
            SeedAcademicLinks(context);
            SeedInquiryData(context);
            SeedSocialData(context);
            SeedMessagesData(context);
        }

        private static void SeedAccountsAndUsers(OneItbContext context, string demoPassword)
        {
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword);
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
                        CreatedAt = SeedStart,
                        FailedLoginAttempts = 0,
                        LockoutEnd = null
                    });
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

        private static void SeedCareerData(OneItbContext context)
        {
            var existingCareers = context.Careers
                .Where(c => SeedCareers.Select(s => s.Name).Contains(c.Name))
                .ToList();

            foreach (var seed in SeedCareers)
            {
                var existing = existingCareers.FirstOrDefault(c => c.Name == seed.Name);
                if (existing != null)
                {
                    if (existing.Code != seed.Code)
                        existing.Code = seed.Code;
                }
                else
                {
                    context.Careers.Add(new Career
                    {
                        Name = seed.Name,
                        Code = seed.Code,
                        IsActive = true
                    });
                }
            }

            context.SaveChanges();
        }

        private static void SeedSubjectData(OneItbContext context)
        {
            int fallbackCareerId = context.Careers
                .OrderBy(career => career.Id)
                .Select(career => career.Id)
                .FirstOrDefault();

            if (fallbackCareerId == 0)
                throw new InvalidOperationException("No careers are available for subject seeding.");

            var existingSubjects = context.Subjects
                .Where(s => SeedSubjects.Select(seed => seed.Name).Contains(s.Name))
                .ToList();

            foreach (var seed in SeedSubjects)
            {
                var existing = existingSubjects.FirstOrDefault(s => s.Name == seed.Name);
                if (existing != null)
                {
                    if (existing.Code != seed.Code)
                        existing.Code = seed.Code;
                }
                else
                {
                    context.Subjects.Add(new Subject
                    {
                        Name = seed.Name,
                        Code = seed.Code,
                        CareerId = fallbackCareerId
                    });
                }
            }

            context.SaveChanges();
        }

        private static void SeedAcademicLinks(OneItbContext context)
        {
            var careers = context.Careers
                .Where(career => SeedCareers.Select(seed => seed.Name).Contains(career.Name))
                .ToDictionary(career => career.Name, career => career.Id);

            var subjects = context.Subjects
                .Where(subject => SeedSubjects.Select(seed => seed.Code).Contains(subject.Code))
                .ToDictionary(subject => subject.Code);

            if (careers.Count == 0 || subjects.Count == 0)
                return;

            var subjectCareerSeeds = new (string SubjectCode, string CareerName)[]
            {
                // Analisis de Sistemas
                ("PROG1", "Analisis de Sistemas"),
                ("BDD", "Analisis de Sistemas"),
                ("ADS", "Analisis de Sistemas"),
                ("REDES", "Analisis de Sistemas"),
                ("MAT", "Analisis de Sistemas"),
                ("ISOFT", "Analisis de Sistemas"),

                // Diseno Industrial
                ("ERGO", "Diseno Industrial"),
                ("MATPRO", "Diseno Industrial"),
                ("DIBTEC", "Diseno Industrial"),

                // Enfermeria
                ("ANAT", "Enfermeria"),
                ("PRAC1", "Enfermeria"),
                ("FARMA", "Enfermeria"),

                // Radiologia
                ("FISRAD", "Radiologia"),
                ("ANATRAD", "Radiologia"),
                ("TECRAD", "Radiologia"),

                // Higiene Seguridad y Ambiente Laboral
                ("TOXI", "Higiene Seguridad y Ambiente Laboral"),
                ("ERGOLAB", "Higiene Seguridad y Ambiente Laboral"),
                ("LEGLAB", "Higiene Seguridad y Ambiente Laboral"),

                // Comunicacion Multimedial
                ("DISGRAF", "Comunicacion Multimedial"),
                ("PRODAUD", "Comunicacion Multimedial"),
                ("COMDIG", "Comunicacion Multimedial"),

                // Administracion Contable
                ("CONT1", "Administracion Contable"),
                ("MATFIN", "Administracion Contable"),
                ("DERCOM", "Administracion Contable"),
                ("MAT", "Administracion Contable"),

                // Administracion de PyMES
                ("RRHH", "Administracion de PyMES"),
                ("MKT", "Administracion de PyMES"),
                ("FINCORP", "Administracion de PyMES"),
                ("CONT1", "Administracion de PyMES"),
                ("DERCOM", "Administracion de PyMES"),

                // Ciencia de Datos e Inteligencia Artificial
                ("ESTAP", "Ciencia de Datos e Inteligencia Artificial"),
                ("ML", "Ciencia de Datos e Inteligencia Artificial"),
                ("NOSQL", "Ciencia de Datos e Inteligencia Artificial"),
                ("MAT", "Ciencia de Datos e Inteligencia Artificial"),
                ("BDD", "Ciencia de Datos e Inteligencia Artificial"),
                ("PROG1", "Ciencia de Datos e Inteligencia Artificial")
            };

            foreach ((string subjectCode, string careerName) in subjectCareerSeeds
                .GroupBy(seed => seed.SubjectCode)
                .Select(group => group.First()))
            {
                if (!subjects.TryGetValue(subjectCode, out Subject? subject) ||
                    !careers.TryGetValue(careerName, out int careerId))
                    continue;

                subject.CareerId = careerId;
            }

            var userCareerSeeds = SeedUsers.SelectMany((user, index) =>
            {
                string primaryCareer = SeedCareers[index % SeedCareers.Length].Name;
                if (user.Id == StudentId)
                {
                    return new[]
                    {
                        (UserId: user.Id, CareerName: "Analisis de Sistemas"),
                        (UserId: user.Id, CareerName: "Ciencia de Datos e Inteligencia Artificial")
                    };
                }

                return new[] { (UserId: user.Id, CareerName: primaryCareer) };
            }).ToArray();

            var existingUserCareerKeys = context.UserCareers
                .Select(link => new { link.UserId, link.CareerId })
                .ToHashSet();

            foreach ((Guid userId, string careerName) in userCareerSeeds)
            {
                if (!careers.TryGetValue(careerName, out int careerId))
                    continue;

                var key = new { UserId = userId, CareerId = careerId };
                if (existingUserCareerKeys.Contains(key))
                    continue;

                context.UserCareers.Add(new UserCareer
                {
                    UserId = userId,
                    CareerId = careerId
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

            for (int userIndex = 0; userIndex < SeedUsers.Count; userIndex++)
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
                        PublishDate = SeedStart.AddHours(userIndex * 3 + topicIndex),
                        IsActive = true
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
                    Guid userId = SeedUsers[(inquiryIndex + offset) % SeedUsers.Count].Id;
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
                        UserId = SeedUsers[(inquiryIndex + 2) % SeedUsers.Count].Id,
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
                        UserId = SeedUsers[(inquiryIndex + 4) % SeedUsers.Count].Id,
                        ParentCommentId = parentId,
                        Content = "Gracias. Organicemos el material por tema y coordinemos un horario.",
                        CreatedAt = inquiries[inquiryIndex].PublishDate.AddMinutes(28),
                        IsActive = true
                    });
                }
            }

            context.SaveChanges();

            var interactionSeeds = new[]
            {
                new UserInteraction
                {
                    Id = StableGuid("interaction-student-teacher-follow"),
                    ObserverId = StudentId,
                    TargetId = TeacherId,
                    Type = InteractionType.Follow,
                    CreatedAt = SeedStart.AddDays(3)
                },
                new UserInteraction
                {
                    Id = StableGuid("interaction-student-admin-follow"),
                    ObserverId = StudentId,
                    TargetId = AdminId,
                    Type = InteractionType.Follow,
                    CreatedAt = SeedStart.AddDays(3).AddMinutes(10)
                },
                new UserInteraction
                {
                    Id = StableGuid("interaction-student-employer-mute"),
                    ObserverId = StudentId,
                    TargetId = EmployerId,
                    Type = InteractionType.Mute,
                    CreatedAt = SeedStart.AddDays(3).AddMinutes(20)
                }
            };

            var existingInteractionIds = context.UserInteractions
                .Where(interaction => interactionSeeds.Select(seed => seed.Id).Contains(interaction.Id))
                .Select(interaction => interaction.Id)
                .ToHashSet();

            context.UserInteractions.AddRange(interactionSeeds.Where(interaction => !existingInteractionIds.Contains(interaction.Id)));
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

        private static void SeedMessagesData(OneItbContext context)
        {
            var messageSeeds = new[]
            {
                new Message
                {
                    Id = StableGuid("msg-student-admin-1"),
                    SenderId = StudentId,
                    ReceiverId = AdminId,
                    Content = "Hola Sofia, ¿tienen novedades sobre la inscripción a las materias de segundo año?",
                    SentAt = SeedStart.AddDays(1).AddHours(10),
                    IsRead = true
                },
                new Message
                {
                    Id = StableGuid("msg-admin-student-1"),
                    SenderId = AdminId,
                    ReceiverId = StudentId,
                    Content = "Hola Lucia. Si, las inscripciones abren la próxima semana. Atenta al muro.",
                    SentAt = SeedStart.AddDays(1).AddHours(11),
                    IsRead = true
                },
                new Message
                {
                    Id = StableGuid("msg-student-teacher-1"),
                    SenderId = StudentId,
                    ReceiverId = TeacherId,
                    Content = "Profe, le dejé una consulta en el foro sobre el TP final.",
                    SentAt = SeedStart.AddDays(2).AddHours(15),
                    IsRead = false
                }
            };

            var existingMessageIds = context.Messages
                .Where(m => messageSeeds.Select(s => s.Id).Contains(m.Id))
                .Select(m => m.Id)
                .ToHashSet();

            context.Messages.AddRange(messageSeeds.Where(m => !existingMessageIds.Contains(m.Id)));
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

        private static string NormalizeDemoPassword(string? password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                throw new InvalidOperationException(
                    "Seed:DemoPassword or ONEITB_SEED_DEMO_PASSWORD must be configured before seeding demo accounts.");
            }

            string normalized = password.Trim();
            if (normalized.Length is < 8 or > 64)
            {
                throw new InvalidOperationException(
                    "The demo seed password must contain between 8 and 64 characters.");
            }

            return normalized;
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
