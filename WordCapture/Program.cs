using System.Text.Json;
using Features;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHttpClient<EnrichHandler>();
builder.Services.AddHttpClient<TranslateHandler>();
builder.Services.AddHttpClient<TelegramBotHandler>();

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

app.Use(async (context, next) =>
{
    context.Response.Headers.Append("Access-Control-Allow-Private-Network", "true");
    if (context.Request.Method == "OPTIONS")
    {
        context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        context.Response.Headers.Append("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
        context.Response.Headers.Append("Access-Control-Allow-Headers", "*");
        context.Response.StatusCode = 204;
        return;
    }
    await next();
});

app.UseCors();
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapPost("/enrich", async (string word, EnrichHandler handler) =>
{
    return await handler.Enrich(word);
});

app.MapPost("/translate", async (string text, TranslateHandler handler) =>
{
    return await handler.Translate(text);
});

app.MapPost("/bot/webhook", async (HttpRequest request, TelegramBotHandler handler) =>
{
    var update = await JsonSerializer.DeserializeAsync<JsonElement>(request.Body);
    await handler.HandleUpdate(update);
    return Results.Ok();
});

app.Run();
