using Infrastructure.Mongo;

BsonConfiguration.Configure();
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMongo(builder.Configuration);

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
