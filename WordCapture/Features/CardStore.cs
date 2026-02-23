using System.Text.Json;

namespace Features;

public record Card(string Original, string Translation, DateTime SavedAt);

public class CardStore
{
    private readonly string _path;
    private readonly Lock _lock = new();

    public CardStore(IConfiguration config)
    {
        _path = config["CardsPath"] ?? "/data/cards.json";
    }

    public bool Save(string original, string translation)
    {
        lock (_lock)
        {
            var cards = ReadAll();
            if (cards.Any(c => string.Equals(c.Original, original, StringComparison.OrdinalIgnoreCase)))
                return false;

            cards.Insert(0, new Card(original, translation, DateTime.UtcNow));
            WriteAll(cards);
            return true;
        }
    }

    public List<Card> GetAll()
    {
        lock (_lock) return ReadAll();
    }

    private List<Card> ReadAll()
    {
        if (!File.Exists(_path)) return [];
        var json = File.ReadAllText(_path);
        return JsonSerializer.Deserialize<List<Card>>(json) ?? [];
    }

    private void WriteAll(List<Card> cards)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(_path)!);
        File.WriteAllText(_path, JsonSerializer.Serialize(cards));
    }
}
