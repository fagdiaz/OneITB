using System;
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
        string? Phone
    );

    public record UpdateProfilePayload(Guid Id, bool Success, string Message);
}
