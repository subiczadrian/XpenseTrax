# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy project file(s)
COPY XpenseTrax.API/*.csproj ./XpenseTrax.API/
RUN dotnet restore ./XpenseTrax.API/*.csproj

# Copy everything else
COPY XpenseTrax.API/. ./XpenseTrax.API/
RUN dotnet publish ./XpenseTrax.API -c Release -o /app/publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .
COPY XpenseTrax.API/wwwroot/ /app/wwwroot/

EXPOSE 80
ENTRYPOINT ["dotnet", "XpenseTrax.dll"]
