namespace Features;

public class TranslateHandler
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public TranslateHandler(HttpClient httpClient, IConfiguration cfg)
    {
        _httpClient = httpClient;
        _apiKey = cfg["DeepLKey"]!;
    }

    public async Task<object> Translate(string text)
    {
        _httpClient.DefaultRequestHeaders.Authorization =
    new System.Net.Http.Headers.AuthenticationHeaderValue("DeepL-Auth-Key", _apiKey);

        var response = await _httpClient.PostAsync(
            "https://api-free.deepl.com/v2/translate",
            new FormUrlEncodedContent(new Dictionary<string, string>
            {
                { "text", text },
                { "source_lang", "EN" },
                { "target_lang", "RU" }
            }));

        response.EnsureSuccessStatusCode();
        var json = await response.Content.ReadAsStringAsync();
        var doc = System.Text.Json.JsonDocument.Parse(json);
        var translation = doc.RootElement
            .GetProperty("translations")[0]
            .GetProperty("text")
            .GetString()!;

        return new { original = text, translation };
    }
}
