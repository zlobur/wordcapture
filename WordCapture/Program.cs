using Features;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddScoped<EnrichHandler>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapPost("/enrich", (string word, EnrichHandler handler) =>
{
    return handler.Enrich(word);
});

app.Run();
