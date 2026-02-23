using System.Text.Json;

namespace Features;

public class TelegramBotHandler(HttpClient http, IConfiguration config)
{
    private readonly string _token = config["Telegram:BotToken"]
        ?? throw new InvalidOperationException("Telegram:BotToken not configured");

    public async Task<bool> HandleUpdate(JsonElement update)
    {
        if (!update.TryGetProperty("message", out var message))
            return false;

        if (!message.TryGetProperty("text", out var text))
            return false;

        if (!message.TryGetProperty("chat", out var chat))
            return false;

        var chatId = chat.GetProperty("id").GetInt64();
        var messageText = text.GetString();

        if (messageText == "/start")
        {
            await SendMessage(chatId, "Привет! Нажми кнопку меню слева от поля ввода, чтобы открыть карточки.");
        }

        return true;
    }

    private async Task SendMessage(long chatId, string text)
    {
        var url = $"https://api.telegram.org/bot{_token}/sendMessage";
        var payload = new { chat_id = chatId, text };
        await http.PostAsJsonAsync(url, payload);
    }
}
