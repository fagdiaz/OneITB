using HotChocolate;
using Microsoft.Extensions.Logging;

namespace OneItb.GraphQL.Infrastructure
{
    public sealed class GraphQLErrorFilter : IErrorFilter
    {
        private readonly ILogger<GraphQLErrorFilter> _logger;

        public GraphQLErrorFilter(ILogger<GraphQLErrorFilter> logger)
        {
            _logger = logger;
        }

        public IError OnError(IError error)
        {
            if (error.Exception is null || error.Exception is GraphQLException)
                return error;

            _logger.LogError(
                error.Exception,
                "Unhandled GraphQL error at path {Path}.",
                error.Path?.ToString() ?? "<unknown>");

            IErrorBuilder builder = ErrorBuilder.New()
                .SetMessage("Ocurrio un error inesperado. Intenta nuevamente o contacta a administracion.")
                .SetCode("INTERNAL_ERROR");

            if (error.Path is not null)
                builder.SetPath(error.Path);

            if (error.Locations is not null)
            {
                foreach (Location location in error.Locations)
                    builder.AddLocation(location);
            }

            return builder.Build();
        }
    }
}
