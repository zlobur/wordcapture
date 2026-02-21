using System.Text;
using System.Text.Json;
namespace Features;

public class EnrichHandler
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public EnrichHandler(HttpClient httpClient, IConfiguration cfg)
    {
        _httpClient = httpClient;
        _apiKey = cfg["Grok:ApiKey"]!;
    }
    public async Task<string> Enrich(string word)
    {
        var request = new
        {
            model = "grok-4-latest",
            temperature = 0,
            messages = new[]
            {
                new { role = "system", content = "You are a helpful assistant."},
                new { role = "user", content = $"Translate the word: {word}" }
            }
        };

        var json = JsonSerializer.Serialize(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _apiKey);

        var response = await _httpClient.PostAsync(
            "https://api.x.ai/v1/chat/completions", content
        );

        var responseJson = await response.Content.ReadAsStringAsync();
        var doc = JsonDocument.Parse(responseJson);

        return doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!;
    }
}
