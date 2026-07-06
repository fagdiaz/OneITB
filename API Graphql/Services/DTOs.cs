using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using HotChocolate;
using HotChocolate.Types;

namespace OneITB.Core.Services.Interfaces
{
    public record RegisterInput(
        [property: GraphQLType(typeof(NonNullType<StringType>))]
        [property: StringLength(30, MinimumLength = 3, ErrorMessage = "El nombre de usuario debe tener entre 3 y 30 caracteres.")]
        [property: RegularExpression(@"^[a-zA-Z0-9_\-\.]+$", ErrorMessage = "El formato del nombre de usuario no es válido.")]
        string Username,

        [property: GraphQLType(typeof(NonNullType<StringType>))]
        [property: StringLength(100, ErrorMessage = "El email no puede superar los 100 caracteres.")]
        [property: EmailAddress(ErrorMessage = "El formato del correo electrónico no es válido.")]
        string Email,

        [property: GraphQLType(typeof(NonNullType<StringType>))]
        [property: StringLength(64, MinimumLength = 8, ErrorMessage = "La contraseña debe tener entre 8 y 64 caracteres.")]
        string Password,

        [property: GraphQLType(typeof(NonNullType<StringType>))]
        string FirstName,

        [property: GraphQLType(typeof(NonNullType<StringType>))]
        string LastName,

        string? Role,

        IReadOnlyList<int>? CareerIds,

        string[]? EnrolledCareers
    );

    public record LoginInput(
        [property: GraphQLType(typeof(NonNullType<StringType>))]
        [property: StringLength(100, ErrorMessage = "El email supera el límite permitido.")]
        [property: EmailAddress(ErrorMessage = "Formato inválido.")]
        string Email,

        [property: GraphQLType(typeof(NonNullType<StringType>))]
        [property: StringLength(64, ErrorMessage = "La contraseña supera el límite permitido.")]
        string Password
    );

    public record UserPayload(Guid Id, bool Success, string Message);

    public record AuthPayload(string Token, string Username, bool IsAuthenticated, Guid Id, string Role);

    public record UpdateProfileInput(
        [property: GraphQLType(typeof(NonNullType<IdType>))]
        Guid Id,
        string? Biography,
        string? LinkedIn,
        string? Facebook,
        string? Instagram,
        string? Phone,
        string? AvatarUrl,
        IReadOnlyList<int>? CareerIds,
        IReadOnlyList<CvExperienceInput>? CvExperiences,
        IReadOnlyList<CvEducationInput>? CvEducations,
        IReadOnlyList<CvProjectInput>? CvProjects,
        IReadOnlyList<CvSkillInput>? CvSkills,
        IReadOnlyList<CvLanguageInput>? CvLanguages
    );

    public record UpdateProfilePayload(Guid Id, bool Success, string Message);

    public record CvExperienceInput(
        string? Company,
        string? Role,
        string? StartDate,
        string? EndDate,
        string? Location,
        string? Description,
        bool? Hidden
    );

    public record CvEducationInput(
        string? Institution,
        string? Degree,
        string? StartDate,
        string? EndDate,
        string? Location,
        string? Description,
        bool? Hidden
    );

    public record CvProjectInput(
        string? Name,
        string? Role,
        string? StartDate,
        string? EndDate,
        string? Url,
        string? Description,
        bool? Hidden
    );

    public record CvSkillInput(
        string? Name,
        string? Level,
        bool? Hidden
    );

    public record CvLanguageInput(
        string? Name,
        string? Level,
        bool? Hidden
    );

    public record CvExperienceDto(
        Guid Id,
        string Company,
        string Role,
        string? StartDate,
        string? EndDate,
        string? Location,
        string? Description,
        bool IsHidden,
        int SortOrder
    );

    public record CvEducationDto(
        Guid Id,
        string Institution,
        string Degree,
        string? StartDate,
        string? EndDate,
        string? Location,
        string? Description,
        bool IsHidden,
        int SortOrder
    );

    public record CvProjectDto(
        Guid Id,
        string Name,
        string? Role,
        string? StartDate,
        string? EndDate,
        string? Url,
        string? Description,
        bool IsHidden,
        int SortOrder
    );

    public record CvSkillDto(
        Guid Id,
        string Name,
        string? Level,
        bool IsHidden,
        int SortOrder
    );

    public record CvLanguageDto(
        Guid Id,
        string Name,
        string? Level,
        bool IsHidden,
        int SortOrder
    );

    public record PublicProfileSummary(
        Guid Id,
        string FirstName,
        string LastName,
        string FullName,
        string Role,
        string? Biography,
        string? LinkedIn,
        string? Facebook,
        string? Instagram,
        string? Phone,
        string? AvatarUrl,
        IReadOnlyList<CvExperienceDto> CvExperiences,
        IReadOnlyList<CvEducationDto> CvEducations,
        IReadOnlyList<CvProjectDto> CvProjects,
        IReadOnlyList<CvSkillDto> CvSkills,
        IReadOnlyList<CvLanguageDto> CvLanguages,
        IReadOnlyList<string> Careers,
        int TotalPublications,
        int TotalComments
    );

    public record PublicProfileSearchResult(
        Guid Id,
        string FullName,
        string Role,
        string? AvatarUrl,
        IReadOnlyList<string> Careers
    );
}
