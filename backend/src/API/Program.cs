using Infrastructure.Mongo;
using Infrastructure.Kafka;

BsonConfiguration.Configure();
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMongo(builder.Configuration);
builder.Services.AddKafka(builder.Configuration);

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.Run();
