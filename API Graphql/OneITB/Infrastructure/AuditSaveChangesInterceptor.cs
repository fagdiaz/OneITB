using System.Security.Claims;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;
using OneItb.Entities.Models;

namespace OneItb.GraphQL.Infrastructure
{
    public sealed class AuditSaveChangesInterceptor : SaveChangesInterceptor
    {
        private static readonly JsonSerializerOptions AuditJsonOptions = new()
        {
            Converters = { new JsonStringEnumConverter() }
        };

        private static readonly HashSet<string> AuditedEntities = new(StringComparer.Ordinal)
        {
            nameof(User),
            nameof(AcademicProgress),
            nameof(AcademicResource),
            nameof(Inquiry),
            nameof(Comment),
            nameof(JobOffer)
        };

        private static readonly HashSet<string> SensitiveProperties = new(StringComparer.OrdinalIgnoreCase)
        {
            "PasswordHash"
        };

        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditSaveChangesInterceptor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public override InterceptionResult<int> SavingChanges(
            DbContextEventData eventData,
            InterceptionResult<int> result)
        {
            AddAuditEntries(eventData.Context);
            return base.SavingChanges(eventData, result);
        }

        public override ValueTask<InterceptionResult<int>> SavingChangesAsync(
            DbContextEventData eventData,
            InterceptionResult<int> result,
            CancellationToken cancellationToken = default)
        {
            AddAuditEntries(eventData.Context);
            return base.SavingChangesAsync(eventData, result, cancellationToken);
        }

        private void AddAuditEntries(DbContext? context)
        {
            if (context is null)
                return;

            context.ChangeTracker.DetectChanges();
            List<AuditLog> auditLogs = context.ChangeTracker
                .Entries()
                .Where(ShouldAudit)
                .Select(CreateAuditLog)
                .Where(log => log is not null)
                .Cast<AuditLog>()
                .ToList();

            if (auditLogs.Count > 0)
                context.Set<AuditLog>().AddRange(auditLogs);
        }

        private static bool ShouldAudit(EntityEntry entry)
        {
            if (entry.Entity is AuditLog)
                return false;

            if (entry.State is not (EntityState.Added or EntityState.Modified or EntityState.Deleted))
                return false;

            return AuditedEntities.Contains(entry.Metadata.ClrType.Name);
        }

        private AuditLog? CreateAuditLog(EntityEntry entry)
        {
            Dictionary<string, object?>? oldValues = entry.State is EntityState.Added
                ? null
                : ReadValues(entry, useOriginalValues: true);

            Dictionary<string, object?>? newValues = entry.State is EntityState.Deleted
                ? null
                : ReadValues(entry, useOriginalValues: false);

            if ((oldValues?.Count ?? 0) == 0 && (newValues?.Count ?? 0) == 0)
                return null;

            return new AuditLog
            {
                Id = Guid.NewGuid(),
                ActorUserId = ResolveActorUserId(),
                CorrelationId = ResolveCorrelationId(),
                Action = entry.State.ToString(),
                EntityName = entry.Metadata.ClrType.Name,
                EntityId = ResolveEntityId(entry),
                OldValuesJson = oldValues is null ? null : JsonSerializer.Serialize(oldValues, AuditJsonOptions),
                NewValuesJson = newValues is null ? null : JsonSerializer.Serialize(newValues, AuditJsonOptions),
                CreatedAt = DateTime.UtcNow
            };
        }

        private static Dictionary<string, object?> ReadValues(EntityEntry entry, bool useOriginalValues)
        {
            var values = new Dictionary<string, object?>(StringComparer.Ordinal);

            foreach (PropertyEntry property in entry.Properties)
            {
                string name = property.Metadata.Name;
                if (SensitiveProperties.Contains(name))
                    continue;

                if (entry.State == EntityState.Modified && !property.IsModified)
                    continue;

                object? value = useOriginalValues
                    ? property.OriginalValue
                    : property.CurrentValue;
                values[name] = value;
            }

            return values;
        }

        private static string ResolveEntityId(EntityEntry entry)
        {
            IReadOnlyList<Microsoft.EntityFrameworkCore.Metadata.IProperty>? keyProperties = entry.Metadata
                .FindPrimaryKey()
                ?.Properties;
            if (keyProperties is null || keyProperties.Count == 0)
                return string.Empty;

            return string.Join(
                "|",
                keyProperties.Select(property =>
                {
                    object? value = entry.Property(property.Name).CurrentValue
                        ?? entry.Property(property.Name).OriginalValue;
                    return $"{property.Name}:{value}";
                }));
        }

        private Guid? ResolveActorUserId()
        {
            string? value = _httpContextAccessor.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out Guid userId) ? userId : null;
        }

        private string? ResolveCorrelationId()
        {
            if (_httpContextAccessor.HttpContext?.Items.TryGetValue(CorrelationIdMiddleware.HeaderName, out object? value) == true)
                return value?.ToString();

            return _httpContextAccessor.HttpContext?.Response.Headers[CorrelationIdMiddleware.HeaderName].FirstOrDefault();
        }
    }
}
