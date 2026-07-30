using System.Reflection;
using OneITB.GraphQL.Mutations;
using Xunit;

namespace Services.Tests.GraphQL;

public sealed class MutationAuthorizationMatrixTests
{
    private static readonly HashSet<string> PublicMutations = new(StringComparer.Ordinal)
    {
        nameof(Mutation.RegisterUserAsync),
        nameof(Mutation.Login),
        nameof(Mutation.MicrosoftLogin),
        nameof(Mutation.RequestMagicLink),
        nameof(Mutation.SubmitEmployerRequest),
        nameof(Mutation.LoginWithMagicLink)
    };

    private static readonly IReadOnlyDictionary<string, string[]> RoleRestrictedMutations =
        new Dictionary<string, string[]>(StringComparer.Ordinal)
        {
            [nameof(Mutation.UpdateUserRole)] = ["Administrador"],
            [nameof(Mutation.UpdateUserStatus)] = ["Administrador"],
            [nameof(Mutation.SilenceUser)] = ["Administrador", "Moderador"],
            [nameof(Mutation.UpdateReportStatus)] = ["Administrador", "Moderador"],
            [nameof(Mutation.AddSubject)] = ["Administrador"],
            [nameof(Mutation.UpdateSubject)] = ["Administrador"],
            [nameof(Mutation.ToggleSubjectStatus)] = ["Administrador"],
            [nameof(Mutation.ModerateInquiryVisibility)] = ["Administrador", "Moderador"],
            [nameof(Mutation.ModerateCommentVisibility)] = ["Administrador", "Moderador"],
            [nameof(Mutation.AddAcademicResource)] = ["Administrador", "Profesor"],
            [nameof(Mutation.UploadAcademicResource)] = ["Administrador", "Profesor"],
            [nameof(Mutation.DeleteResource)] = ["Administrador", "Profesor"],
            [nameof(Mutation.ToggleAcademicResourceStatus)] = ["Administrador", "Profesor"],
            [nameof(Mutation.UpsertAcademicProgress)] = ["Administrador", "Profesor"],
            [nameof(Mutation.SyncSiuGrades)] = ["Administrador"],
            [nameof(Mutation.CreateJobOffer)] = ["Administrador", "Empleador"],
            [nameof(Mutation.ApplyToJob)] = ["Egresado", "Estudiante"],
            [nameof(Mutation.UpdateApplicationStatus)] = ["Administrador", "Empleador"]
            ,
            [nameof(Mutation.ApproveEmployerRequest)] = ["Administrador"],
            [nameof(Mutation.RejectEmployerRequest)] = ["Administrador"],
            [nameof(Mutation.ResendEmployerWelcome)] = ["Administrador"]
        };

    [Fact]
    public void MutationAuthorizationMatrix_CoversEveryResolver()
    {
        MethodInfo[] mutationMethods = typeof(Mutation)
            .GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly);

        Assert.NotEmpty(mutationMethods);
        foreach (MethodInfo method in mutationMethods)
        {
            object? authorizeAttribute = GetAuthorizeAttribute(method);
            if (PublicMutations.Contains(method.Name))
            {
                Assert.Null(authorizeAttribute);
                continue;
            }

            Assert.NotNull(authorizeAttribute);
        }

        Assert.Equal(
            PublicMutations.Count,
            mutationMethods.Count(method => GetAuthorizeAttribute(method) is null));
    }

    [Fact]
    public void RoleRestrictedMutations_UseCanonicalRoleSets()
    {
        foreach ((string methodName, string[] expectedRoles) in RoleRestrictedMutations)
        {
            MethodInfo method = typeof(Mutation).GetMethod(methodName)
                ?? throw new InvalidOperationException($"Mutation method {methodName} was not found.");
            object attribute = GetAuthorizeAttribute(method)
                ?? throw new InvalidOperationException($"Mutation method {methodName} is not protected.");

            string[] actualRoles = ReadRoles(attribute)
                .OrderBy(role => role, StringComparer.Ordinal)
                .ToArray();

            Assert.Equal(
                expectedRoles.OrderBy(role => role, StringComparer.Ordinal),
                actualRoles);
        }
    }

    [Fact]
    public void AsyncMutationResolvers_AcceptCancellationToken()
    {
        MethodInfo[] asyncMutationMethods = typeof(Mutation)
            .GetMethods(BindingFlags.Instance | BindingFlags.Public | BindingFlags.DeclaredOnly)
            .Where(method => typeof(Task).IsAssignableFrom(method.ReturnType))
            .ToArray();

        Assert.NotEmpty(asyncMutationMethods);
        foreach (MethodInfo method in asyncMutationMethods)
        {
            Assert.Contains(
                method.GetParameters(),
                parameter => parameter.ParameterType == typeof(CancellationToken));
        }
    }

    private static object? GetAuthorizeAttribute(MemberInfo method)
    {
        return method
            .GetCustomAttributes(inherit: true)
            .SingleOrDefault(attribute =>
                string.Equals(
                    attribute.GetType().FullName,
                    "HotChocolate.Authorization.AuthorizeAttribute",
                    StringComparison.Ordinal));
    }

    private static IReadOnlyList<string> ReadRoles(object authorizeAttribute)
    {
        object? roles = authorizeAttribute
            .GetType()
            .GetProperty("Roles", BindingFlags.Instance | BindingFlags.Public)
            ?.GetValue(authorizeAttribute);

        return roles is IEnumerable<string> values
            ? values.ToArray()
            : Array.Empty<string>();
    }
}
