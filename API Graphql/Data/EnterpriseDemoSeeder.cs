using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using OneItb.Entities.Models;

namespace OneItb.Data
{
    internal static class EnterpriseDemoSeeder
    {
        private static readonly DateTime SeedStart =
            DateTime.SpecifyKind(new DateTime(2026, 7, 1, 9, 0, 0), DateTimeKind.Utc);

        public static readonly Guid Admin1Id = StableGuid("enterprise-user:admin1@itbeltran.com.ar");
        public static readonly Guid Admin2Id = StableGuid("enterprise-user:admin2@itbeltran.com.ar");
        public static readonly Guid ProfessorAds1Id = StableGuid("enterprise-user:profesor1.ads@itbeltran.com.ar");
        public static readonly Guid StudentAds1Id = StableGuid("enterprise-user:estudiante1.ads@itbeltran.com.ar");
        public static readonly Guid Employer1Id = StableGuid("enterprise-user:empleador1@itbeltran.com.ar");

        private static readonly EnterpriseCareer[] Careers =
        {
            new("ADS", "Analisis de Sistemas"),
            new("CDIA", "Ciencia de Datos e Inteligencia Artificial")
        };

        private static readonly EnterpriseSubject[] Subjects =
        {
            new("PROG1", "Programacion I", "ADS", 1),
            new("BDD", "Base de Datos", "ADS", 2),
            new("ISOFT", "Ingenieria de Software", "ADS", 3),
            new("ESTAP", "Estadistica Aplicada", "CDIA", 1),
            new("ML", "Machine Learning", "CDIA", 2),
            new("NOSQL", "Bases de Datos NoSQL", "CDIA", 3)
        };

        private static readonly EnterpriseUser[] Users =
        {
            new("admin1@itbeltran.com.ar", "Admin", "Uno", "Administrador", "Administrador principal de la plataforma academica.", Array.Empty<string>()),
            new("admin2@itbeltran.com.ar", "Admin", "Dos", "Administrador", "Administrador de soporte institucional y auditoria.", Array.Empty<string>()),
            new("profesor1.ads@itbeltran.com.ar", "Profesor", "Sistemas Uno", "Profesor", "Docente de programacion, bases de datos y arquitectura.", new[] { "ADS" }),
            new("profesor2.ads@itbeltran.com.ar", "Profesor", "Sistemas Dos", "Profesor", "Docente de ingenieria de software y gestion de proyectos.", new[] { "ADS" }),
            new("profesor1.cdia@itbeltran.com.ar", "Profesor", "Datos Uno", "Profesor", "Docente de estadistica aplicada y ciencia de datos.", new[] { "CDIA" }),
            new("profesor2.cdia@itbeltran.com.ar", "Profesor", "Datos Dos", "Profesor", "Docente de machine learning y bases no relacionales.", new[] { "CDIA" }),
            new("estudiante1.ads@itbeltran.com.ar", "Estudiante", "Sistemas Uno", "Estudiante", "Estudiante avanzado con interes en desarrollo web full-stack.", new[] { "ADS" }),
            new("estudiante2.ads@itbeltran.com.ar", "Estudiante", "Sistemas Dos", "Estudiante", "Estudiante de sistemas orientado a calidad y DevOps.", new[] { "ADS" }),
            new("estudiante1.cdia@itbeltran.com.ar", "Estudiante", "Datos Uno", "Estudiante", "Estudiante de ciencia de datos interesado en analitica aplicada.", new[] { "CDIA" }),
            new("estudiante2.cdia@itbeltran.com.ar", "Estudiante", "Datos Dos", "Estudiante", "Estudiante de inteligencia artificial orientado a producto.", new[] { "CDIA" }),
            new("egresado1@itbeltran.com.ar", "Egresado", "Sistemas", "Egresado", "Egresado que acompana a estudiantes con experiencia profesional.", new[] { "ADS" }),
            new("egresado2@itbeltran.com.ar", "Egresado", "Datos", "Egresado", "Egresado especializado en datos y automatizacion.", new[] { "CDIA" }),
            new("empleador1@itbeltran.com.ar", "Empleador", "Tecnologia", "Empleador", "Empresa de software interesada en perfiles junior del instituto.", Array.Empty<string>()),
            new("empleador2@itbeltran.com.ar", "Empleador", "Innovacion", "Empleador", "Consultora que publica oportunidades para estudiantes y egresados.", Array.Empty<string>())
        };

        public static async Task SeedAsync(
            OneItbContext context,
            string demoPassword,
            CancellationToken cancellationToken = default)
        {
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(demoPassword);

            await SeedCareersAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedSubjectsAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedAccountsAsync(context, passwordHash, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedUsersAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedUserCareersAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedInquiriesAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedJobOffersAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedJobApplicationsAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedCommentsAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedRepliesAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedReactionsAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedMessagesAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);

            await SeedNotificationsAsync(context, cancellationToken);
            await SaveAndClearAsync(context, cancellationToken);
        }

        private static async Task SeedCareersAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            string[] codes = Careers.Select(career => career.Code).ToArray();
            string[] names = Careers.Select(career => career.Name).ToArray();
            List<Career> existing = await context.Careers
                .Where(career => codes.Contains(career.Code) || names.Contains(career.Name))
                .ToListAsync(cancellationToken);

            foreach (EnterpriseCareer seed in Careers)
            {
                Career? career = existing.FirstOrDefault(item => item.Code == seed.Code || item.Name == seed.Name);
                if (career is null)
                {
                    context.Careers.Add(new Career
                    {
                        Code = seed.Code,
                        Name = seed.Name,
                        IsActive = true
                    });
                    continue;
                }

                career.Code = seed.Code;
                career.Name = seed.Name;
                career.IsActive = true;
            }
        }

        private static async Task SeedSubjectsAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            string[] careerCodes = Careers.Select(seed => seed.Code).ToArray();
            Dictionary<string, int> careerIds = await context.Careers
                .Where(career => careerCodes.Contains(career.Code))
                .ToDictionaryAsync(career => career.Code, career => career.Id, cancellationToken);

            string[] subjectCodes = Subjects.Select(subject => subject.Code).ToArray();
            List<Subject> existing = await context.Subjects
                .IgnoreQueryFilters()
                .Where(subject => subjectCodes.Contains(subject.Code))
                .ToListAsync(cancellationToken);

            foreach (EnterpriseSubject seed in Subjects)
            {
                if (!careerIds.TryGetValue(seed.CareerCode, out int careerId))
                    throw new InvalidOperationException($"Career {seed.CareerCode} was not seeded.");

                Subject? subject = existing.FirstOrDefault(item => item.Code == seed.Code);
                if (subject is null)
                {
                    context.Subjects.Add(new Subject
                    {
                        Code = seed.Code,
                        Name = seed.Name,
                        CareerId = careerId,
                        Year = seed.Year,
                        IsActive = true
                    });
                    continue;
                }

                subject.Name = seed.Name;
                subject.CareerId = careerId;
                subject.Year = seed.Year;
                subject.IsActive = true;
            }
        }

        private static async Task SeedAccountsAsync(
            OneItbContext context,
            string passwordHash,
            CancellationToken cancellationToken)
        {
            string[] emails = Users.Select(user => user.Email).ToArray();
            List<string> existingEmailList = await context.Accounts
                .Where(account => emails.Contains(account.Email.ToLower()))
                .Select(account => account.Email.ToLower())
                .ToListAsync(cancellationToken);
            HashSet<string> existingEmails = existingEmailList.ToHashSet();

            foreach (EnterpriseUser user in Users.Where(user => !existingEmails.Contains(user.Email)))
            {
                context.Accounts.Add(new Account
                {
                    Id = UserId(user.Email),
                    Email = user.Email,
                    PasswordHash = passwordHash,
                    CreatedAt = SeedStart,
                    FailedLoginAttempts = 0,
                    LockoutEnd = null
                });
            }
        }

        private static async Task SeedUsersAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            Guid[] userIds = Users.Select(user => UserId(user.Email)).ToArray();
            Dictionary<Guid, User> existing = await context.Users
                .Where(user => userIds.Contains(user.Id))
                .ToDictionaryAsync(user => user.Id, cancellationToken);

            foreach (EnterpriseUser seed in Users)
            {
                Guid userId = UserId(seed.Email);
                if (!existing.TryGetValue(userId, out User? user))
                {
                    context.Users.Add(new User
                    {
                        Id = userId,
                        FirstName = seed.FirstName,
                        LastName = seed.LastName,
                        Role = seed.Role,
                        Biography = seed.Biography,
                        LinkedIn = $"https://www.linkedin.com/in/{seed.Email.Split('@')[0].Replace('.', '-')}",
                        Facebook = string.Empty,
                        Instagram = string.Empty,
                        Phone = BuildPhone(seed.Email),
                        IsActive = true
                    });
                    continue;
                }

                user.FirstName = seed.FirstName;
                user.LastName = seed.LastName;
                user.Role = seed.Role;
                user.Biography ??= seed.Biography;
                user.LinkedIn ??= $"https://www.linkedin.com/in/{seed.Email.Split('@')[0].Replace('.', '-')}";
                user.Phone ??= BuildPhone(seed.Email);
                user.IsActive = true;
            }
        }

        private static async Task SeedUserCareersAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            string[] careerCodes = Careers.Select(seed => seed.Code).ToArray();
            Dictionary<string, int> careerIds = await context.Careers
                .Where(career => careerCodes.Contains(career.Code))
                .ToDictionaryAsync(career => career.Code, career => career.Id, cancellationToken);

            var desiredLinks = Users
                .SelectMany(user => user.CareerCodes.Select(careerCode => new
                {
                    UserId = UserId(user.Email),
                    CareerCode = careerCode
                }))
                .ToArray();

            Guid[] userIds = desiredLinks.Select(link => link.UserId).Distinct().ToArray();
            int[] careerIdValues = careerIds.Values.ToArray();
            var existingLinks = await context.UserCareers
                .Where(link => userIds.Contains(link.UserId) && careerIdValues.Contains(link.CareerId))
                .Select(link => new { link.UserId, link.CareerId })
                .ToListAsync(cancellationToken);
            HashSet<string> existing = existingLinks
                .Select(link => link.UserId.ToString() + ":" + link.CareerId.ToString())
                .ToHashSet();

            foreach (var link in desiredLinks)
            {
                if (!careerIds.TryGetValue(link.CareerCode, out int careerId))
                    continue;

                string key = link.UserId.ToString() + ":" + careerId.ToString();
                if (existing.Contains(key))
                    continue;

                context.UserCareers.Add(new UserCareer
                {
                    UserId = link.UserId,
                    CareerId = careerId
                });
            }
        }

        private static async Task SeedInquiriesAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            string[] subjectCodes = Subjects.Select(seed => seed.Code).ToArray();
            Dictionary<string, Subject> subjectsByCode = await context.Subjects
                .IgnoreQueryFilters()
                .Where(subject => subjectCodes.Contains(subject.Code))
                .ToDictionaryAsync(subject => subject.Code, cancellationToken);

            Guid[] managedInquiryIds = ManagedInquiryIds().ToArray();
            List<Guid> existingIdList = await context.Inquiries
                .IgnoreQueryFilters()
                .Where(inquiry => managedInquiryIds.Contains(inquiry.Id))
                .Select(inquiry => inquiry.Id)
                .ToListAsync(cancellationToken);
            HashSet<Guid> existingIds = existingIdList.ToHashSet();

            int sequence = 0;
            foreach (EnterpriseUser user in Users.Where(user => user.Role is not ("Administrador" or "Empleador")))
            {
                foreach (string careerCode in user.CareerCodes)
                {
                    foreach (EnterpriseSubject subjectSeed in Subjects.Where(subject => subject.CareerCode == careerCode))
                    {
                        for (int index = 1; index <= 2; index++)
                        {
                            Guid inquiryId = StableGuid($"enterprise-inquiry:{user.Email}:{subjectSeed.Code}:{index}");
                            if (existingIds.Contains(inquiryId) || !subjectsByCode.TryGetValue(subjectSeed.Code, out Subject? subject))
                                continue;

                            context.Inquiries.Add(new Inquiry
                            {
                                Id = inquiryId,
                                UserId = UserId(user.Email),
                                SubjectId = subject.Id,
                                Title = BuildInquiryTitle(subject.Name, index),
                                Content = BuildInquiryContent(user, subject.Name, index),
                                PublishDate = SeedStart.AddMinutes(sequence * 17),
                                IsActive = true
                            });
                            sequence++;
                        }
                    }
                }
            }
        }

        private static async Task SeedJobOffersAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            Guid[] offerIds = ManagedJobOfferIds().ToArray();
            List<Guid> existingIdList = await context.JobOffers
                .Where(offer => offerIds.Contains(offer.Id))
                .Select(offer => offer.Id)
                .ToListAsync(cancellationToken);
            HashSet<Guid> existingIds = existingIdList.ToHashSet();

            foreach (EnterpriseUser employer in Users.Where(user => user.Role == "Empleador"))
            {
                for (int index = 1; index <= 2; index++)
                {
                    Guid offerId = StableGuid($"enterprise-job:{employer.Email}:{index}");
                    if (existingIds.Contains(offerId))
                        continue;

                    context.JobOffers.Add(new JobOffer
                    {
                        Id = offerId,
                        EmployerId = UserId(employer.Email),
                        Title = index == 1 ? "Desarrollador Full-Stack Junior" : "Analista de Datos Junior",
                        Company = employer.Email.StartsWith("empleador1", StringComparison.Ordinal)
                            ? "Beltran Tech Lab"
                            : "Data Campus Consulting",
                        Description = index == 1
                            ? "Participacion en producto academico con React, .NET 8, GraphQL y SQL Server. Se valora portfolio y compromiso con buenas practicas."
                            : "Rol inicial para construir tableros, limpiar datasets y automatizar reportes institucionales con SQL y Python.",
                        Location = index == 1 ? "CABA / Hibrido" : "Remoto con encuentros mensuales",
                        IsActive = true,
                        CreatedAt = SeedStart.AddDays(8).AddHours(index)
                    });
                }
            }
        }

        private static async Task SeedJobApplicationsAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            Guid[] applicationIds = ManagedJobApplicationIds().ToArray();
            List<Guid> existingIdList = await context.JobApplications
                .Where(application => applicationIds.Contains(application.Id))
                .Select(application => application.Id)
                .ToListAsync(cancellationToken);
            HashSet<Guid> existingIds = existingIdList.ToHashSet();

            Guid[] offerIds = ManagedJobOfferIds().ToArray();
            List<JobOffer> offers = await context.JobOffers
                .Where(offer => offerIds.Contains(offer.Id) && offer.IsActive)
                .OrderBy(offer => offer.CreatedAt)
                .ToListAsync(cancellationToken);

            if (offers.Count == 0)
                return;

            EnterpriseUser[] applicants = Users
                .Where(user => user.Role is "Estudiante" or "Egresado")
                .ToArray();

            for (int index = 0; index < applicants.Length; index++)
            {
                EnterpriseUser applicant = applicants[index];
                JobOffer offer = offers[index % offers.Count];
                Guid applicationId = StableGuid($"enterprise-job-application:{applicant.Email}:{offer.Id:N}");
                if (existingIds.Contains(applicationId))
                    continue;

                context.JobApplications.Add(new JobApplication
                {
                    Id = applicationId,
                    JobOfferId = offer.Id,
                    ApplicantId = UserId(applicant.Email),
                    AppliedAt = offer.CreatedAt.AddHours(2 + index),
                    Status = index % 4 == 0
                        ? JobApplicationStatus.Reviewed
                        : JobApplicationStatus.Pending
                });
            }
        }

        private static async Task SeedCommentsAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            Guid[] managedInquiryIds = ManagedInquiryIds().ToArray();
            List<Inquiry> inquiries = await context.Inquiries
                .IgnoreQueryFilters()
                .Where(inquiry => managedInquiryIds.Contains(inquiry.Id))
                .OrderBy(inquiry => inquiry.PublishDate)
                .ToListAsync(cancellationToken);

            Guid[] desiredCommentIds = Users
                .SelectMany(user => BuildRootCommentIds(user.Email, inquiries))
                .ToArray();
            List<Guid> existingIdList = await context.Comments
                .IgnoreQueryFilters()
                .Where(comment => desiredCommentIds.Contains(comment.Id))
                .Select(comment => comment.Id)
                .ToListAsync(cancellationToken);
            HashSet<Guid> existingIds = existingIdList.ToHashSet();

            foreach (EnterpriseUser user in Users)
            {
                Guid userId = UserId(user.Email);
                foreach (Inquiry inquiry in inquiries.Where(inquiry => inquiry.UserId == userId).Take(2))
                {
                    AddRootCommentIfMissing(context, existingIds, user, inquiry, "own");
                }

                foreach (Inquiry inquiry in inquiries.Where(inquiry => inquiry.UserId != userId).Take(2))
                {
                    AddRootCommentIfMissing(context, existingIds, user, inquiry, "foreign");
                }
            }
        }

        private static async Task SeedRepliesAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            Guid[] managedInquiryIds = ManagedInquiryIds().ToArray();
            List<Comment> rootComments = await context.Comments
                .IgnoreQueryFilters()
                .Where(comment => comment.ParentCommentId == null && managedInquiryIds.Contains(comment.InquiryId))
                .OrderBy(comment => comment.CreatedAt)
                .ToListAsync(cancellationToken);

            Guid[] desiredReplyIds = Users
                .SelectMany(user => rootComments
                    .Where(comment => comment.UserId != UserId(user.Email))
                    .Take(2)
                    .Select(comment => StableGuid($"enterprise-reply:{user.Email}:{comment.Id:N}")))
                .ToArray();

            List<Guid> existingIdList = await context.Comments
                .IgnoreQueryFilters()
                .Where(comment => desiredReplyIds.Contains(comment.Id))
                .Select(comment => comment.Id)
                .ToListAsync(cancellationToken);
            HashSet<Guid> existingIds = existingIdList.ToHashSet();

            foreach (EnterpriseUser user in Users)
            {
                foreach (Comment parent in rootComments.Where(comment => comment.UserId != UserId(user.Email)).Take(2))
                {
                    Guid replyId = StableGuid($"enterprise-reply:{user.Email}:{parent.Id:N}");
                    if (existingIds.Contains(replyId))
                        continue;

                    context.Comments.Add(new Comment
                    {
                        Id = replyId,
                        InquiryId = parent.InquiryId,
                        UserId = UserId(user.Email),
                        ParentCommentId = parent.Id,
                        Content = $"Gracias por el aporte. Lo tomo como referencia para avanzar con el tema y compartir resultados.",
                        CreatedAt = parent.CreatedAt.AddMinutes(12),
                        IsActive = true
                    });
                }
            }
        }

        private static async Task SeedReactionsAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            Guid[] managedInquiryIds = ManagedInquiryIds().ToArray();
            List<Inquiry> inquiries = await context.Inquiries
                .IgnoreQueryFilters()
                .Where(inquiry => managedInquiryIds.Contains(inquiry.Id))
                .OrderBy(inquiry => inquiry.PublishDate)
                .ToListAsync(cancellationToken);
            Guid[] userIds = Users.Select(user => UserId(user.Email)).ToArray();

            var existingReactions = await context.Reactions
                .IgnoreQueryFilters()
                .Where(reaction => managedInquiryIds.Contains(reaction.InquiryId))
                .Select(reaction => new { reaction.InquiryId, reaction.UserId })
                .ToListAsync(cancellationToken);
            HashSet<string> existing = existingReactions
                .Select(reaction => reaction.InquiryId.ToString() + ":" + reaction.UserId.ToString())
                .ToHashSet();

            for (int inquiryIndex = 0; inquiryIndex < inquiries.Count; inquiryIndex++)
            {
                Inquiry inquiry = inquiries[inquiryIndex];
                foreach (Guid userId in userIds.Where(id => id != inquiry.UserId).Skip(inquiryIndex % 3).Take(4))
                {
                    string key = inquiry.Id.ToString() + ":" + userId.ToString();
                    if (existing.Contains(key))
                        continue;

                    context.Reactions.Add(new Reaction
                    {
                        Id = StableGuid($"enterprise-reaction:{inquiry.Id:N}:{userId:N}"),
                        InquiryId = inquiry.Id,
                        UserId = userId,
                        CreatedAt = inquiry.PublishDate.AddMinutes(30 + inquiryIndex)
                    });
                }
            }
        }

        private static async Task SeedMessagesAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            Guid[] messageIds = ManagedMessageIds().ToArray();
            List<Guid> existingIdList = await context.Messages
                .Where(message => messageIds.Contains(message.Id))
                .Select(message => message.Id)
                .ToListAsync(cancellationToken);
            HashSet<Guid> existingIds = existingIdList.ToHashSet();

            for (int userIndex = 0; userIndex < Users.Length; userIndex++)
            {
                EnterpriseUser owner = Users[userIndex];
                for (int partnerOffset = 1; partnerOffset <= 2; partnerOffset++)
                {
                    EnterpriseUser partner = Users[(userIndex + partnerOffset) % Users.Length];
                    for (int messageIndex = 0; messageIndex < 10; messageIndex++)
                    {
                        Guid messageId = StableGuid($"enterprise-message:{owner.Email}:{partner.Email}:{messageIndex}");
                        if (existingIds.Contains(messageId))
                            continue;

                        bool ownerSends = messageIndex % 2 == 0;
                        context.Messages.Add(new Message
                        {
                            Id = messageId,
                            SenderId = ownerSends ? UserId(owner.Email) : UserId(partner.Email),
                            ReceiverId = ownerSends ? UserId(partner.Email) : UserId(owner.Email),
                            Content = BuildMessageContent(owner, partner, messageIndex),
                            SentAt = SeedStart.AddDays(12).AddMinutes(userIndex * 150 + partnerOffset * 60 + messageIndex * 5),
                            IsRead = messageIndex < 8
                        });
                    }
                }
            }
        }

        private static async Task SeedNotificationsAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            var notifications = new List<Notification>();
            Guid[] managedInquiryIds = ManagedInquiryIds().ToArray();
            Guid[] managedMessageIds = ManagedMessageIds().ToArray();
            Guid[] managedJobOfferIds = ManagedJobOfferIds().ToArray();
            Guid[] managedJobApplicationIds = ManagedJobApplicationIds().ToArray();

            List<Comment> rootComments = await context.Comments
                .IgnoreQueryFilters()
                .Include(comment => comment.Inquiry)
                .Where(comment => comment.ParentCommentId == null && managedInquiryIds.Contains(comment.InquiryId))
                .OrderBy(comment => comment.CreatedAt)
                .Take(24)
                .ToListAsync(cancellationToken);

            foreach (Comment comment in rootComments.Where(comment => comment.UserId != comment.Inquiry.UserId))
            {
                notifications.Add(new Notification
                {
                    Id = StableGuid($"enterprise-notification:comment:{comment.Id:N}"),
                    UserId = comment.Inquiry.UserId,
                    Type = NotificationType.SocialComment,
                    Message = "Nuevo comentario en una publicacion del muro academico.",
                    ActionUrl = "/feed",
                    IsRead = false,
                    CreatedAt = comment.CreatedAt.AddMinutes(2)
                });
            }

            List<Comment> replies = await context.Comments
                .IgnoreQueryFilters()
                .Include(comment => comment.ParentComment)
                .Where(comment => comment.ParentCommentId != null && managedInquiryIds.Contains(comment.InquiryId))
                .OrderBy(comment => comment.CreatedAt)
                .Take(24)
                .ToListAsync(cancellationToken);

            foreach (Comment reply in replies.Where(reply => reply.ParentComment != null && reply.UserId != reply.ParentComment.UserId))
            {
                notifications.Add(new Notification
                {
                    Id = StableGuid($"enterprise-notification:reply:{reply.Id:N}"),
                    UserId = reply.ParentComment!.UserId,
                    Type = NotificationType.SocialComment,
                    Message = "Nueva respuesta a uno de tus comentarios.",
                    ActionUrl = "/feed",
                    IsRead = false,
                    CreatedAt = reply.CreatedAt.AddMinutes(2)
                });
            }

            List<Message> unreadMessages = await context.Messages
                .Where(message => managedMessageIds.Contains(message.Id) && !message.IsRead)
                .OrderBy(message => message.SentAt)
                .Take(40)
                .ToListAsync(cancellationToken);

            foreach (Message message in unreadMessages)
            {
                notifications.Add(new Notification
                {
                    Id = StableGuid($"enterprise-notification:message:{message.Id:N}"),
                    UserId = message.ReceiverId,
                    Type = NotificationType.PrivateMessage,
                    Message = "Tenes un mensaje privado sin leer.",
                    ActionUrl = "/chat",
                    IsRead = false,
                    CreatedAt = message.SentAt.AddMinutes(1)
                });
            }

            List<JobOffer> offers = await context.JobOffers
                .Where(offer => managedJobOfferIds.Contains(offer.Id))
                .OrderBy(offer => offer.CreatedAt)
                .ToListAsync(cancellationToken);
            Guid[] recipientIds = Users
                .Where(user => user.Role is not ("Administrador" or "Empleador"))
                .Select(user => UserId(user.Email))
                .ToArray();

            foreach (JobOffer offer in offers)
            {
                foreach (Guid recipientId in recipientIds)
                {
                    notifications.Add(new Notification
                    {
                        Id = StableGuid($"enterprise-notification:job:{offer.Id:N}:{recipientId:N}"),
                        UserId = recipientId,
                        Type = NotificationType.JobOffer,
                        Message = $"Nueva oferta laboral: {offer.Title} en {offer.Company}.",
                        ActionUrl = "/empleos",
                        IsRead = false,
                        CreatedAt = offer.CreatedAt.AddMinutes(3)
                    });
                }
            }

            List<JobApplication> applications = await context.JobApplications
                .Include(application => application.JobOffer)
                .Include(application => application.Applicant)
                .Where(application => managedJobApplicationIds.Contains(application.Id))
                .OrderBy(application => application.AppliedAt)
                .ToListAsync(cancellationToken);

            foreach (JobApplication application in applications)
            {
                notifications.Add(new Notification
                {
                    Id = StableGuid($"enterprise-notification:job-application:employer:{application.Id:N}"),
                    UserId = application.JobOffer.EmployerId,
                    Type = NotificationType.JobApplication,
                    Message = $"{application.Applicant.FirstName} {application.Applicant.LastName} se postulo a {application.JobOffer.Title}.",
                    ActionUrl = "/empleos/mis-ofertas",
                    IsRead = false,
                    CreatedAt = application.AppliedAt.AddMinutes(2)
                });

                if (application.Status != JobApplicationStatus.Pending)
                {
                    notifications.Add(new Notification
                    {
                        Id = StableGuid($"enterprise-notification:job-application:applicant:{application.Id:N}"),
                        UserId = application.ApplicantId,
                        Type = NotificationType.JobApplication,
                        Message = $"Tu postulacion a {application.JobOffer.Title} fue revisada.",
                        ActionUrl = "/empleos",
                        IsRead = false,
                        CreatedAt = application.AppliedAt.AddMinutes(30)
                    });
                }
            }

            Guid[] desiredIds = notifications.Select(notification => notification.Id).ToArray();
            List<Guid> existingIdList = await context.Notifications
                .Where(notification => desiredIds.Contains(notification.Id))
                .Select(notification => notification.Id)
                .ToListAsync(cancellationToken);
            HashSet<Guid> existingIds = existingIdList.ToHashSet();

            context.Notifications.AddRange(notifications.Where(notification => !existingIds.Contains(notification.Id)));
        }

        private static void AddRootCommentIfMissing(
            OneItbContext context,
            HashSet<Guid> existingIds,
            EnterpriseUser user,
            Inquiry inquiry,
            string scope)
        {
            Guid commentId = StableGuid($"enterprise-comment:{scope}:{user.Email}:{inquiry.Id:N}");
            if (existingIds.Contains(commentId))
                return;

            context.Comments.Add(new Comment
            {
                Id = commentId,
                InquiryId = inquiry.Id,
                UserId = UserId(user.Email),
                Content = scope == "own"
                    ? "Dejo una aclaracion adicional y material de referencia para quienes esten siguiendo la conversacion."
                    : "Me sirve este enfoque. Puedo sumar apuntes y coordinar una breve revision con el grupo.",
                CreatedAt = inquiry.PublishDate.AddMinutes(scope == "own" ? 9 : 18),
                IsActive = true
            });
        }

        private static IReadOnlyList<Guid> BuildRootCommentIds(string email, IReadOnlyList<Inquiry> inquiries)
        {
            Guid userId = UserId(email);
            return inquiries
                .Where(inquiry => inquiry.UserId == userId)
                .Take(2)
                .Select(inquiry => StableGuid($"enterprise-comment:own:{email}:{inquiry.Id:N}"))
                .Concat(inquiries
                    .Where(inquiry => inquiry.UserId != userId)
                    .Take(2)
                    .Select(inquiry => StableGuid($"enterprise-comment:foreign:{email}:{inquiry.Id:N}")))
                .ToArray();
        }

        private static IEnumerable<Guid> ManagedInquiryIds()
        {
            return Users
                .Where(user => user.Role is not ("Administrador" or "Empleador"))
                .SelectMany(user => user.CareerCodes.SelectMany(careerCode =>
                    Subjects
                        .Where(subject => subject.CareerCode == careerCode)
                        .SelectMany(subject => Enumerable.Range(1, 2)
                            .Select(index => StableGuid($"enterprise-inquiry:{user.Email}:{subject.Code}:{index}")))));
        }

        private static IEnumerable<Guid> ManagedJobOfferIds()
        {
            return Users
                .Where(user => user.Role == "Empleador")
                .SelectMany(user => Enumerable.Range(1, 2)
                    .Select(index => StableGuid($"enterprise-job:{user.Email}:{index}")));
        }

        private static IEnumerable<Guid> ManagedJobApplicationIds()
        {
            Guid[] offerIds = ManagedJobOfferIds().ToArray();
            EnterpriseUser[] applicants = Users
                .Where(user => user.Role is "Estudiante" or "Egresado")
                .ToArray();

            for (int index = 0; index < applicants.Length; index++)
            {
                yield return StableGuid($"enterprise-job-application:{applicants[index].Email}:{offerIds[index % offerIds.Length]:N}");
            }
        }

        private static IEnumerable<Guid> ManagedMessageIds()
        {
            for (int userIndex = 0; userIndex < Users.Length; userIndex++)
            {
                EnterpriseUser owner = Users[userIndex];
                for (int partnerOffset = 1; partnerOffset <= 2; partnerOffset++)
                {
                    EnterpriseUser partner = Users[(userIndex + partnerOffset) % Users.Length];
                    for (int messageIndex = 0; messageIndex < 10; messageIndex++)
                    {
                        yield return StableGuid($"enterprise-message:{owner.Email}:{partner.Email}:{messageIndex}");
                    }
                }
            }
        }

        private static string BuildInquiryTitle(string subjectName, int index)
        {
            return index == 1
                ? $"Material clave para {subjectName}"
                : $"Consulta aplicada sobre {subjectName}";
        }

        private static string BuildInquiryContent(EnterpriseUser user, string subjectName, int index)
        {
            return index == 1
                ? $"{user.FirstName} comparte una guia breve de {subjectName} con foco en conceptos que suelen aparecer en parciales y trabajos practicos."
                : $"Abrimos este hilo para resolver dudas de {subjectName}, comparar enfoques y dejar recursos utiles para la cursada.";
        }

        private static string BuildMessageContent(EnterpriseUser owner, EnterpriseUser partner, int messageIndex)
        {
            string[] messages =
            {
                "Hola, queria coordinar una consulta breve sobre la cursada.",
                "Perfecto, tengo disponibilidad hoy despues de las 18.",
                "Te comparto el resumen y vemos si lo podemos mejorar.",
                "Me sirve. Tambien puedo sumar un ejemplo practico.",
                "Gracias, lo reviso y te confirmo los puntos pendientes.",
                "Dale, dejemos registro en el muro para que le sirva al resto.",
                "Buena idea. Lo ordeno por materia y tema.",
                "Si queres tambien podemos abrir un hilo de comentarios.",
                "Listo, avanzo con eso y lo comparto.",
                "Gracias. Quedo atento a cualquier ajuste."
            };

            return $"{messages[messageIndex]} ({owner.FirstName} / {partner.FirstName})";
        }

        private static string BuildPhone(string email)
        {
            int suffix = Math.Abs(email.GetHashCode()) % 9000 + 1000;
            return $"+5491100{suffix}";
        }

        private static async Task SaveAndClearAsync(OneItbContext context, CancellationToken cancellationToken)
        {
            await context.SaveChangesAsync(cancellationToken);
            context.ChangeTracker.Clear();
        }

        private static Guid UserId(string email) => StableGuid($"enterprise-user:{email}");

        private static Guid StableGuid(string value)
        {
            byte[] hash = SHA256.HashData(Encoding.UTF8.GetBytes($"oneitb23:{value}"));
            return new Guid(hash.AsSpan(0, 16));
        }

        private sealed record EnterpriseCareer(string Code, string Name);

        private sealed record EnterpriseSubject(string Code, string Name, string CareerCode, int Year);

        private sealed record EnterpriseUser(
            string Email,
            string FirstName,
            string LastName,
            string Role,
            string Biography,
            string[] CareerCodes);
    }
}
