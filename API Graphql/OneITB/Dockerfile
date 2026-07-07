# syntax=docker/dockerfile:1.7

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY ["API Graphql/Entities/Entities.csproj", "API Graphql/Entities/"]
COPY ["API Graphql/Data/Data.csproj", "API Graphql/Data/"]
COPY ["API Graphql/Services/Services.csproj", "API Graphql/Services/"]
COPY ["API Graphql/OneITB/GraphQL.csproj", "API Graphql/OneITB/"]

RUN dotnet restore "API Graphql/OneITB/GraphQL.csproj"

COPY . .

RUN dotnet publish "API Graphql/OneITB/GraphQL.csproj" \
    --configuration Release \
    --output /app/publish \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd --create-home --uid 10001 --shell /usr/sbin/nologin oneitb \
    && mkdir -p /app/wwwroot/uploads \
    && chown -R oneitb:oneitb /app

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

COPY --from=build --chown=oneitb:oneitb /app/publish .

USER oneitb

ENTRYPOINT ["dotnet", "GraphQL.dll"]
