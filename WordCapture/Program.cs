using Features;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient<EnrichHandler>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

app.UseCors();

app.MapGet("/", () => "Hello World!");

app.MapPost("/enrich", async (string word, EnrichHandler handler) =>
{
    return await handler.Enrich(word);
});

app.Run();
