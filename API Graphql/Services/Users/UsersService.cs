using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using OneItb.Data;
using OneItb.Entities.Models;
using OneITB.Core.Services.Interfaces;

namespace Services.Users
{
    public class UsersService : IUsersService
    {
        private const int MaxLongTextLength = 2000;
        private const int MaxExperienceRows = 50;
        private const int MaxEducationRows = 50;
        private const int MaxProjectRows = 50;
        private const int MaxSkillRows = 100;
        private const int MaxLanguageRows = 50;

        private static readonly string[] AllowedRoles =
        {
            "Estudiante",
            "Profesor",
            "Moderador",
            "Administrador",
            "Empleador",
            "Egresado",
            "User"
        };

        private static readonly string[] PublicRegistrationRoles =
        {
            "Estudiante",
            "Profesor",
            "Egresado"
        };

        private readonly IUnitOfWork _uow;
        private readonly OneItbContext _context;
        private readonly IPasswordHasher _passwordHasher;

        public UsersService(
            IUnitOfWork uow,
            OneItbContext context,
            IPasswordHasher passwordHasher)
        {
            _uow = uow;
            _context = context;
            _passwordHasher = passwordHasher;
        }

        public async Task<UserPayload> RegisterAsync(
            RegisterInput input,
            CancellationToken cancellationToken = default)
        {
            var userId = Guid.NewGuid();
            string normalizedRole = NormalizePublicRegistrationRole(input.Role);
            int[] activeCareerIds = await GetActiveRegistrationCareerIdsAsync(
                input.CareerIds,
                cancellationToken);
            string passwordHash = _passwordHasher.Hash(input.Password);
            
            var account = new Account
            {
                 Id = userId,
                 Email = NormalizeEmail(input.Email),
                 PasswordHash = passwordHash,
                 CreatedAt = DateTime.UtcNow
            };

            var user = new User 
            { 
                 Id = userId,
                 FirstName = NormalizeToTitleCase(input.FirstName), 
                 LastName = NormalizeToTitleCase(input.LastName), 
                 Role = normalizedRole,
                 Account = account
            };

            foreach (int careerId in activeCareerIds)
            {
                user.UserCareers.Add(new UserCareer
                {
                    UserId = userId,
                    CareerId = careerId
                });
            }

            await _uow.Users.AddAsync(user, cancellationToken);
            await _uow.CompleteAsync(cancellationToken);
            return new UserPayload(user.Id, true, "Usuario registrado exitosamente en el sistema académico.");
        }

        public async Task<UpdateProfilePayload> UpdateProfileAsync(
            UpdateProfileInput input,
            CancellationToken cancellationToken = default)
        {
            var user = await _context.Users
                .Include(item => item.CvExperiences)
                .Include(item => item.CvEducations)
                .Include(item => item.CvProjects)
                .Include(item => item.CvSkills)
                .Include(item => item.CvLanguages)
                .Include(item => item.UserCareers)
                .SingleOrDefaultAsync(item => item.Id == input.Id, cancellationToken);

            if (user == null)
            {
                return new UpdateProfilePayload(input.Id, false, "Usuario no encontrado.");
            }

            user.Biography = NormalizeOptional(input.Biography, 500, "biografia");
            user.LinkedIn = NormalizeOptional(input.LinkedIn, 200, "LinkedIn");
            user.Facebook = NormalizeOptional(input.Facebook, 200, "Facebook");
            user.Instagram = NormalizeOptional(input.Instagram, 200, "Instagram");
            user.Phone = NormalizeOptional(input.Phone, 50, "telefono");
            user.AvatarUrl = NormalizeAvatarUrl(input.AvatarUrl);

            await ReplaceCareerLinksAsync(user, input.CareerIds, cancellationToken);
            ReplaceExperiences(user, input.CvExperiences);
            ReplaceEducations(user, input.CvEducations);
            ReplaceProjects(user, input.CvProjects);
            ReplaceSkills(user, input.CvSkills);
            ReplaceLanguages(user, input.CvLanguages);

            await _uow.CompleteAsync(cancellationToken);

            return new UpdateProfilePayload(user.Id, true, "Perfil actualizado exitosamente.");
        }

        public async Task<UserPayload> ToggleProfilePrivacyAsync(
            Guid userId,
            bool isPublic,
            CancellationToken cancellationToken = default)
        {
            User? user = await _context.Users.SingleOrDefaultAsync(
                item => item.Id == userId && item.IsActive,
                cancellationToken);
            if (user is null)
                return new UserPayload(userId, false, "Usuario no encontrado.");

            user.IsPublicProfile = isPublic;
            await _uow.CompleteAsync(cancellationToken);

            string visibility = isPublic ? "publico" : "privado";
            return new UserPayload(user.Id, true, $"Perfil configurado como {visibility}.");
        }

        public async Task<UserPayload> UpdateUserRoleAsync(
            Guid operatorUserId,
            Guid userId,
            string newRole,
            string? adminPassword,
            CancellationToken cancellationToken = default)
        {
            var user = await _uow.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null)
                throw new InvalidOperationException("Usuario no encontrado.");
            if (IsAdministrator(user))
                throw new InvalidOperationException("No se puede modificar el rol de un Administrador desde el sistema.");
            if (!AllowedRoles.Contains(newRole))
                throw new InvalidOperationException("Rol no permitido.");

            if (string.Equals(newRole, "Administrador", StringComparison.OrdinalIgnoreCase))
            {
                if (string.IsNullOrWhiteSpace(adminPassword))
                    throw new InvalidOperationException("La contraseña del administrador es obligatoria.");

                var operatorUser = await _uow.Users.GetByIdAsync(
                    operatorUserId,
                    cancellationToken);
                if (operatorUser == null ||
                    !operatorUser.IsActive ||
                    !IsAdministrator(operatorUser) ||
                    operatorUser.Account == null)
                    throw new InvalidOperationException("No se pudo validar al administrador autenticado.");

                if (string.IsNullOrWhiteSpace(operatorUser.Account.PasswordHash) ||
                    !_passwordHasher.Verify(adminPassword, operatorUser.Account.PasswordHash))
                    throw new InvalidOperationException("Contraseña de administrador incorrecta.");
            }

            user.Role = newRole;
            await _uow.CompleteAsync(cancellationToken);
            return new UserPayload(user.Id, true, "Rol actualizado exitosamente.");
        }

        public async Task<UserPayload> UpdateUserStatusAsync(
            Guid userId,
            bool isActive,
            CancellationToken cancellationToken = default)
        {
            var user = await _uow.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null)
                throw new InvalidOperationException("Usuario no encontrado.");
            if (IsAdministrator(user))
                throw new InvalidOperationException("No se puede desactivar la cuenta de un Administrador.");
            user.IsActive = isActive;
            await _uow.CompleteAsync(cancellationToken);
            return new UserPayload(user.Id, true, "Estado actualizado exitosamente.");
        }

        public async Task<UserPayload> SilenceUserAsync(
            Guid userId,
            int hours,
            CancellationToken cancellationToken = default)
        {
            var user = await _uow.Users.GetByIdAsync(userId, cancellationToken);
            if (user == null) return new UserPayload(userId, false, "Usuario no encontrado.");
            if (IsAdministrator(user)) return new UserPayload(user.Id, false, "Las cuentas administradoras no pueden silenciarse.");
            if (hours <= 0 || hours > 168) return new UserPayload(user.Id, false, "La duracion del silencio debe estar entre 1 y 168 horas.");

            DateTime now = DateTime.UtcNow;
            DateTime baseTime = user.MutedUntil.HasValue && user.MutedUntil.Value > now
                ? user.MutedUntil.Value
                : now;

            user.MutedUntil = baseTime.AddHours(hours);
            await _uow.CompleteAsync(cancellationToken);

            return new UserPayload(user.Id, true, $"Usuario silenciado hasta {user.MutedUntil:yyyy-MM-dd HH:mm} UTC.");
        }

        public async Task<User> CreateAsync(
            User user,
            CancellationToken cancellationToken = default)
        {
            await _uow.Users.AddAsync(user, cancellationToken);
            await _uow.CompleteAsync(cancellationToken);
            return user;
        }


        public IQueryable<User> GetAllAsync()
        {
            return _uow.Users.GetAll();
        }

        public User? GetByEmail(string email)
        {
            return _uow.Users.GetByEmail(email);
        }

        public User? GetById(Guid id)
        {
            return _uow.Users.GetById(id);
        }

        public User? GetById(int id)
        {
            return null;
        }

        private static bool IsAdministrator(User user)
        {
            return string.Equals(user.Role, "Administrador", StringComparison.OrdinalIgnoreCase);
        }

        private static string NormalizePublicRegistrationRole(string? role)
        {
            string normalized = role?.Trim() ?? string.Empty;
            string? allowed = PublicRegistrationRoles
                .FirstOrDefault(item => string.Equals(item, normalized, StringComparison.OrdinalIgnoreCase));

            if (allowed == null)
            {
                throw new ArgumentException("Rol de registro no permitido.");
            }

            return allowed;
        }

        private async Task<int[]> GetActiveRegistrationCareerIdsAsync(
            IReadOnlyList<int>? careerIds,
            CancellationToken cancellationToken)
        {
            int[] normalizedIds = careerIds?
                .Where(id => id > 0)
                .Distinct()
                .ToArray() ?? Array.Empty<int>();

            if (normalizedIds.Length == 0)
            {
                throw new ArgumentException("Selecciona al menos una carrera.");
            }

            int[] activeCareerIds = await _context.Careers
                .AsNoTracking()
                .Where(career => normalizedIds.Contains(career.Id) && career.IsActive)
                .Select(career => career.Id)
                .ToArrayAsync(cancellationToken);

            if (activeCareerIds.Length != normalizedIds.Length)
            {
                throw new ArgumentException("Una o mas carreras seleccionadas no existen.");
            }

            return activeCareerIds;
        }

        private async Task ReplaceCareerLinksAsync(
            User user,
            IReadOnlyList<int>? careerIds,
            CancellationToken cancellationToken)
        {
            if (careerIds == null) return;

            int[] normalizedIds = careerIds
                .Where(id => id > 0)
                .Distinct()
                .ToArray();

            if (normalizedIds.Length == 0)
            {
                throw new InvalidOperationException("Selecciona al menos una carrera.");
            }

            List<int> activeCareerIds = await _context.Careers
                .Where(career => normalizedIds.Contains(career.Id) && career.IsActive)
                .Select(career => career.Id)
                .ToListAsync(cancellationToken);

            if (activeCareerIds.Count != normalizedIds.Length)
            {
                throw new InvalidOperationException("Una o mas carreras seleccionadas no existen.");
            }

            _context.UserCareers.RemoveRange(user.UserCareers);
            _context.UserCareers.AddRange(activeCareerIds.Select(careerId => new UserCareer
            {
                UserId = user.Id,
                CareerId = careerId
            }));
        }

        private void ReplaceExperiences(User user, IReadOnlyList<CvExperienceInput>? inputs)
        {
            if (inputs == null) return;
            EnsureCount(inputs, MaxExperienceRows, "experiencias");

            _context.UserCvExperiences.RemoveRange(user.CvExperiences);
            foreach ((CvExperienceInput input, int index) in inputs.Select((input, index) => (input, index)))
            {
                _context.UserCvExperiences.Add(new UserCvExperience
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Company = NormalizeNameRequired(input.Company, 200, "empresa"),
                    Role = NormalizeNameRequired(input.Role, 200, "rol"),
                    StartDate = NormalizeOptional(input.StartDate, 50, "fecha de inicio"),
                    EndDate = NormalizeOptional(input.EndDate, 50, "fecha de fin"),
                    Location = NormalizeOptional(input.Location, 150, "ubicacion"),
                    Description = NormalizeOptional(input.Description, MaxLongTextLength, "descripcion"),
                    IsHidden = input.Hidden ?? false,
                    SortOrder = index
                });
            }
        }

        private void ReplaceEducations(User user, IReadOnlyList<CvEducationInput>? inputs)
        {
            if (inputs == null) return;
            EnsureCount(inputs, MaxEducationRows, "educacion");

            _context.UserCvEducations.RemoveRange(user.CvEducations);
            foreach ((CvEducationInput input, int index) in inputs.Select((input, index) => (input, index)))
            {
                _context.UserCvEducations.Add(new UserCvEducation
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Institution = NormalizeNameRequired(input.Institution, 200, "institucion"),
                    Degree = NormalizeNameRequired(input.Degree, 200, "titulo"),
                    StartDate = NormalizeOptional(input.StartDate, 50, "fecha de inicio"),
                    EndDate = NormalizeOptional(input.EndDate, 50, "fecha de fin"),
                    Location = NormalizeOptional(input.Location, 150, "ubicacion"),
                    Description = NormalizeOptional(input.Description, MaxLongTextLength, "descripcion"),
                    IsHidden = input.Hidden ?? false,
                    SortOrder = index
                });
            }
        }

        private void ReplaceProjects(User user, IReadOnlyList<CvProjectInput>? inputs)
        {
            if (inputs == null) return;
            EnsureCount(inputs, MaxProjectRows, "proyectos");

            _context.UserCvProjects.RemoveRange(user.CvProjects);
            foreach ((CvProjectInput input, int index) in inputs.Select((input, index) => (input, index)))
            {
                _context.UserCvProjects.Add(new UserCvProject
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Name = NormalizeNameRequired(input.Name, 200, "proyecto"),
                    Role = NormalizeNameOptional(input.Role, 200, "rol") ?? string.Empty,
                    StartDate = NormalizeOptional(input.StartDate, 50, "fecha de inicio"),
                    EndDate = NormalizeOptional(input.EndDate, 50, "fecha de fin"),
                    Url = NormalizeOptional(input.Url, 300, "URL"),
                    Description = NormalizeOptional(input.Description, MaxLongTextLength, "descripcion"),
                    IsHidden = input.Hidden ?? false,
                    SortOrder = index
                });
            }
        }

        private void ReplaceSkills(User user, IReadOnlyList<CvSkillInput>? inputs)
        {
            if (inputs == null) return;
            EnsureCount(inputs, MaxSkillRows, "habilidades");

            _context.UserCvSkills.RemoveRange(user.CvSkills);
            foreach ((CvSkillInput input, int index) in inputs.Select((input, index) => (input, index)))
            {
                _context.UserCvSkills.Add(new UserCvSkill
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Name = NormalizeNameRequired(input.Name, 120, "habilidad"),
                    Level = NormalizeNameOptional(input.Level, 80, "nivel"),
                    IsHidden = input.Hidden ?? false,
                    SortOrder = index
                });
            }
        }

        private void ReplaceLanguages(User user, IReadOnlyList<CvLanguageInput>? inputs)
        {
            if (inputs == null) return;
            EnsureCount(inputs, MaxLanguageRows, "idiomas");

            _context.UserCvLanguages.RemoveRange(user.CvLanguages);
            foreach ((CvLanguageInput input, int index) in inputs.Select((input, index) => (input, index)))
            {
                _context.UserCvLanguages.Add(new UserCvLanguage
                {
                    Id = Guid.NewGuid(),
                    UserId = user.Id,
                    Name = NormalizeNameRequired(input.Name, 120, "idioma"),
                    Level = NormalizeNameOptional(input.Level, 80, "nivel"),
                    IsHidden = input.Hidden ?? false,
                    SortOrder = index
                });
            }
        }

        private static void EnsureCount<T>(IReadOnlyList<T> inputs, int maxCount, string sectionName)
        {
            if (inputs.Count > maxCount)
            {
                throw new InvalidOperationException($"La seccion {sectionName} supera el limite permitido de {maxCount} registros.");
            }
        }

        private static string NormalizeRequired(string? value, int maxLength, string fieldName)
        {
            string? normalized = NormalizeOptional(value, maxLength, fieldName);
            if (normalized == null)
            {
                throw new InvalidOperationException($"El campo {fieldName} es obligatorio.");
            }

            return normalized;
        }

        private static string? NormalizeOptional(string? value, int maxLength, string fieldName)
        {
            if (string.IsNullOrWhiteSpace(value))
            {
                return null;
            }

            string normalized = value.Trim();
            if (normalized.Length > maxLength)
            {
                throw new InvalidOperationException($"El campo {fieldName} supera el limite de {maxLength} caracteres.");
            }

            return normalized;
        }

        private static string? NormalizeAvatarUrl(string? avatarUrl)
        {
            string? normalized = NormalizeOptional(avatarUrl, 500, "avatar");
            if (normalized == null)
            {
                return null;
            }

            if (!normalized.StartsWith("/uploads/", StringComparison.OrdinalIgnoreCase) &&
                !Uri.TryCreate(normalized, UriKind.Absolute, out _))
            {
                throw new InvalidOperationException("La URL del avatar no es valida.");
            }

            return normalized;
        }

        private static string NormalizeEmail(string? email)
        {
            return NormalizeRequired(email, 100, "email").ToLowerInvariant();
        }

        private static string NormalizeNameRequired(string? value, int maxLength, string fieldName)
        {
            return NormalizeToTitleCase(NormalizeRequired(value, maxLength, fieldName));
        }

        private static string? NormalizeNameOptional(string? value, int maxLength, string fieldName)
        {
            string? normalized = NormalizeOptional(value, maxLength, fieldName);
            return normalized != null ? NormalizeToTitleCase(normalized) : null;
        }

        private static string NormalizeToTitleCase(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return value;
            var textInfo = new System.Globalization.CultureInfo("es-AR", false).TextInfo;
            return textInfo.ToTitleCase(value.Trim().ToLower());
        }
    }
}
