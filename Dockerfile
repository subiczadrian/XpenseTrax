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

# Copy published app
COPY --from=build /app/publish .

# Copy wwwroot (frontend files)
COPY XpenseTrax.API/wwwroot/ /app/wwwroot/

# Copy the SQLite database into the container
COPY XpenseTrax.API/expenses.db /app/expenses.db

# Ensure the database file is writable
RUN chmod 666 /app/expenses.db

# Expose port 80
EXPOSE 80

# Set entrypoint
ENTRYPOINT ["dotnet", "XpenseTrax.API.dll"]
