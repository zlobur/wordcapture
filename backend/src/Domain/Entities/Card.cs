using System;

namespace Domain.Entities;

public class Card
{
    public Card(
        Guid cardId,
        Guid userId,
        string sourceLanguage,
        string targetLanguage,
        Enum status)
    {
        CardId = cardId;
        UserId = userId;
        SourceLanguage = sourceLanguage;
        TargetLanguage = targetLanguage;
        CreatedAt = DateTime.UtcNow;
        UpdatedAt = DateTime.UtcNow;
    }
    public Guid CardId { get; init; }
    public string Word { get; private set; }
    public Guid UserId { get; init; }
    public Guid DeckId { get; set; }
    public string? Translation { get; set; }
    public string SourceLanguage { get; init; }
    public string TargetLanguage { get; init; }
    public List<string> Tags { get; set; } = new List<string>();
    public string? CefrLevel { get; set; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; set; }

    private string CheckLanguage(string lang)
    {
        if (string.IsNullOrEmpty(lang))
            return lang;
    }
}
