using System.Text;
using System.Text.Json;
namespace Features;

public class EnrichHandler
{
    private string prompt =
        """
            You are an English teacher creating memory cards for an intermediate learner.
        Respond ONLY with valid JSON, no explanation, no markdown, no other text.

        Use this exact structure:
        {
        "word": "original word",
        "translation": "3 Russian translations separated by , ",
        "transcription": "phonetic transcription",
        "tag": "general or cs or trash",
        "context": "sentence 1\n\nsentence 2\n\nsentence 3"
        }

        Tag rules: use "cs" for programming/tech terms, "trash" for slang/obscene, "general" for everything else.
        """;
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public EnrichHandler(HttpClient httpClient, IConfiguration cfg)
    {
        _httpClient = httpClient;
        _apiKey = cfg["Grok:ApiKey"]!;
    }
    public async Task<EnrichResult> Enrich(string word)
    {
        var request = new
        {
            model = "grok-4-latest",
            temperature = 0,
            messages = new[]
            {
                new { role = "system", content = prompt},
                new { role = "user", content = word }
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

        var rawDoc = doc.RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()!;

        var enrichResult = JsonSerializer.Deserialize<EnrichResult>(
            rawDoc,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        return enrichResult!;
    }
}
