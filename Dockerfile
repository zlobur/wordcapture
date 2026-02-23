FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY WordCapture/WordCapture.csproj WordCapture/
RUN dotnet restore WordCapture/WordCapture.csproj
COPY WordCapture/ WordCapture/
RUN dotnet publish WordCapture/WordCapture.csproj -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview
WORKDIR /app
COPY --from=build /app .
COPY telegram-mini-app/index.html wwwroot/index.html
ENV ASPNETCORE_URLS=http://+:80
EXPOSE 80
ENTRYPOINT ["dotnet", "WordCapture.dll"]
