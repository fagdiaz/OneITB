using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using HotChocolate;
using HotChocolate.Authorization;
using HotChocolate.Types;
using Services.Users;
using Services.Accounts;
using OneITB.Core.Services.Interfaces;
using OneItb.Data;
using OneItb.Entities.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using HotChocolate.Subscriptions;
using OneITB.GraphQL.Subscriptions;

namespace OneITB.GraphQL.Mutations
{
    public class Mutation
    {
        /// <summary>
        /// Resolver blindado contra inyecciones y DoS para el registro de usuarios.
        /// </summary>
        public async Task<UserPayload> RegisterUserAsync(
            RegisterInput input,
            [Service] IUsersService usersService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            try
            {
                var userDto = await usersService.RegisterAsync(input);
                return userDto;
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        /// <summary>
        /// Resolver blindado para la autenticación segura (Login).
        /// </summary>
        public async Task<AuthPayload> Login(
            LoginInput input,
            [Service] IAccountService accountService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            var authResult = await accountService.Login(input);
            return authResult;
        }

        public async Task<UpdateProfilePayload> UpdateProfile(
            UpdateProfileInput input,
            [Service] IUsersService usersService)
        {
            if (input == null) throw new ArgumentNullException(nameof(input));
            var payload = await usersService.UpdateProfileAsync(input);
            return payload;
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<UserPayload> UpdateUserRole(Guid userId, string newRole, [Service] IUsersService usersService)
        {
            return await usersService.UpdateUserRoleAsync(userId, newRole);
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<UserPayload> UpdateUserStatus(Guid userId, bool isActive, [Service] IUsersService usersService)
        {
            return await usersService.UpdateUserStatusAsync(userId, isActive);
        }

        [Authorize(Roles = new[] { "Administrador", "Moderador" })]
        public async Task<UserPayload> SilenceUser(Guid userId, int hours, [Service] IUsersService usersService)
        {
            return await usersService.SilenceUserAsync(userId, hours);
        }

        public async Task<string> RequestMagicLink(string email, string cuit, [Service] IEmployerAuthService authService)
        {
            return await authService.RequestMagicLinkAsync(email, cuit);
        }

        public async Task<string> LoginWithMagicLink(string token, [Service] IEmployerAuthService authService)
        {
            return await authService.LoginWithMagicLinkAsync(token);
        }

        [Authorize]
        public async Task<CommunityReport> ReportInquiry(
            Guid inquiryId,
            string reason,
            [Service] IModerationService moderationService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await moderationService.ReportInquiryAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                inquiryId,
                reason);
        }

        [Authorize(Roles = new[] { "Administrador", "Moderador" })]
        public async Task<CommunityReport> UpdateReportStatus(
            Guid reportId,
            string status,
            [Service] OneItbContext context)
        {
            var report = await context.CommunityReports.FindAsync(reportId);
            if (report == null) throw new GraphQLException("Reporte no encontrado.");
            report.Status = status;
            await context.SaveChangesAsync();
            return report;
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<Subject> AddSubject(
            string code,
            string name,
            [Service] OneItbContext context)
        {
            var subject = new Subject { Code = code, Name = name, IsActive = true };
            context.Subjects.Add(subject);
            await context.SaveChangesAsync();
            return subject;
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<Subject> UpdateSubject(
            int id,
            string code,
            string name,
            [Service] OneItbContext context)
        {
            var subject = await context.Subjects.FindAsync(id);
            if (subject == null) throw new GraphQLException("Materia no encontrada.");
            subject.Code = code;
            subject.Name = name;
            await context.SaveChangesAsync();
            return subject;
        }

        [Authorize(Roles = new[] { "Administrador" })]
        public async Task<Subject> ToggleSubjectStatus(
            int id,
            [Service] OneItbContext context)
        {
            var subject = await context.Subjects.FindAsync(id);
            if (subject == null) throw new GraphQLException("Materia no encontrada.");
            subject.IsActive = !subject.IsActive;
            await context.SaveChangesAsync();
            return subject;
        }

        [Authorize]
        public async Task<Inquiry> AddInquiry(
            int subjectId,
            string title,
            string content,
            string? attachedFileUrl,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await socialService.AddInquiryAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                subjectId,
                title,
                content,
                attachedFileUrl);
        }

        [Authorize]
        public async Task<Comment> AddComment(
            Guid inquiryId,
            string content,
            Guid? parentCommentId,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await socialService.AddCommentAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                inquiryId,
                content,
                parentCommentId);
        }

        [Authorize]
        public async Task<ToggleReactionPayload> ToggleReaction(
            Guid inquiryId,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            return await socialService.ToggleReactionAsync(
                GetAuthenticatedUserId(httpContextAccessor),
                inquiryId);
        }

        [Authorize]
        public async Task<IReadOnlyList<Career>> LinkUserToCareers(
            IReadOnlyList<int> careerIds,
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid userId = GetAuthenticatedUserId(httpContextAccessor);
            int[] normalizedIds = careerIds?.Distinct().ToArray() ?? Array.Empty<int>();
            if (normalizedIds.Length == 0)
                throw new GraphQLException("SeleccionÃ¡ al menos una carrera.");

            var careers = await context.Careers
                .Where(career => normalizedIds.Contains(career.Id) && career.IsActive)
                .OrderBy(career => career.Name)
                .ToListAsync();

            if (careers.Count != normalizedIds.Length)
                throw new GraphQLException("Una o mÃ¡s carreras seleccionadas no existen.");

            var existingLinks = await context.UserCareers
                .Where(link => link.UserId == userId)
                .ToListAsync();

            context.UserCareers.RemoveRange(existingLinks);
            context.UserCareers.AddRange(careers.Select(career => new UserCareer
            {
                UserId = userId,
                CareerId = career.Id
            }));

            await context.SaveChangesAsync();
            return careers;
        }

        [Authorize]
        public async Task<Inquiry> EditInquiry(
            Guid inquiryId,
            string newTitle,
            string newContent,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await socialService.EditInquiryAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    CanModerate(httpContextAccessor),
                    inquiryId,
                    newTitle,
                    newContent);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<Inquiry> ToggleInquiryStatus(
            Guid inquiryId,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await socialService.ToggleInquiryStatusAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    CanModerate(httpContextAccessor),
                    inquiryId);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<Comment> EditComment(
            Guid commentId,
            string newContent,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await socialService.EditCommentAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    CanModerate(httpContextAccessor),
                    commentId,
                    newContent);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<Comment> ToggleCommentStatus(
            Guid commentId,
            [Service] ISocialService socialService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await socialService.ToggleCommentStatusAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    CanModerate(httpContextAccessor),
                    commentId);
            }
            catch (InvalidOperationException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<UserInteraction> InteractWithUser(
            Guid targetUserId,
            InteractionType type,
            [Service] OneItbContext context,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            Guid observerId = GetAuthenticatedUserId(httpContextAccessor);
            if (observerId == targetUserId)
                throw new GraphQLException("No podÃ©s interactuar socialmente con tu propio usuario.");

            bool targetExists = await context.Users.AnyAsync(user => user.Id == targetUserId && user.IsActive);
            if (!targetExists)
                throw new GraphQLException("Usuario objetivo no encontrado.");

            UserInteraction? interaction = await context.UserInteractions
                .SingleOrDefaultAsync(item => item.ObserverId == observerId && item.TargetId == targetUserId);

            if (interaction is null)
            {
                interaction = new UserInteraction
                {
                    Id = Guid.NewGuid(),
                    ObserverId = observerId,
                    TargetId = targetUserId,
                    Type = type,
                    CreatedAt = DateTime.UtcNow
                };
                context.UserInteractions.Add(interaction);
            }
            else
            {
                interaction.Type = type;
                interaction.CreatedAt = DateTime.UtcNow;
            }

            await context.SaveChangesAsync();
            return interaction;
        }

        [Authorize]
        public async Task<Message> SendMessage(
            Guid receiverId,
            string content,
            [Service] IMessagingService messagingService,
            [Service] ITopicEventSender eventSender,
            [Service] IHttpContextAccessor httpContextAccessor,
            [Service] ILogger<Mutation> logger)
        {
            try
            {
                Guid senderId = GetAuthenticatedUserId(httpContextAccessor);
                Message message = await messagingService.SendMessageAsync(senderId, receiverId, content);

                try
                {
                    await eventSender.SendAsync(PrivateMessageTopics.ForUser(senderId), message);
                    await eventSender.SendAsync(PrivateMessageTopics.ForUser(receiverId), message);
                }
                catch (Exception ex)
                {
                    logger.LogWarning(
                        ex,
                        "Message {MessageId} persisted but real-time publication failed.",
                        message.Id);
                }

                return message;
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        [Authorize]
        public async Task<MarkConversationReadPayload> MarkConversationRead(
            Guid otherUserId,
            [Service] IMessagingService messagingService,
            [Service] IHttpContextAccessor httpContextAccessor)
        {
            try
            {
                return await messagingService.MarkConversationReadAsync(
                    GetAuthenticatedUserId(httpContextAccessor),
                    otherUserId);
            }
            catch (ArgumentException ex)
            {
                throw new GraphQLException(ex.Message);
            }
        }

        private static Guid GetAuthenticatedUserId(IHttpContextAccessor httpContextAccessor)
        {
            string value = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!Guid.TryParse(value, out Guid userId))
                throw new GraphQLException("No se pudo identificar al usuario autenticado.");
            return userId;
        }

        private static bool CanModerate(IHttpContextAccessor httpContextAccessor)
        {
            string? role = httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.Role);
            return role is "Administrador" or "Moderador";
        }
    }
}
