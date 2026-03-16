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

    private static string ToDeepLTarget(string code)
    {
        var upper = code.ToUpperInvariant();
        return upper switch
        {
            "EN" => "EN-US",
            "PT" => "PT-PT",
            _ => upper,
        };
    }

    public async Task<object> Translate(string text, string? sourceLang = null, string? targetLang = null)
    {
        var src = (sourceLang ?? "").ToUpperInvariant();
        var tgt = ToDeepLTarget(targetLang ?? "ru");

        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("DeepL-Auth-Key", _apiKey);

        var formData = new Dictionary<string, string>
        {
            { "text", text },
            { "target_lang", tgt }
        };
        if (!string.IsNullOrEmpty(src) && src != "AUTO")
        {
            formData.Add("source_lang", src);
        }

        var response = await _httpClient.PostAsync(
            "https://api-free.deepl.com/v2/translate",
            new FormUrlEncodedContent(formData));

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
