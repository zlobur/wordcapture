using Features;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient<EnrichHandler>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");

app.MapPost("/enrich", async (string word, EnrichHandler handler) =>
{
    return await handler.Enrich(word);
});

app.Run();
