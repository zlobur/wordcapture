using System;
using Domain.Enums;
using Domain.ValueObjects;

namespace Domain.Entities;

public class Card
{
    private Card() { }
    public static Card Create(
        Guid userId,
        Guid deckId,
        Word word,
        Lang targetLanguage) =>

        new Card
        {
            CardId = Guid.NewGuid(),
            UserId = userId,
            DeckId = deckId,
            Word = word,
            TargetLanguage = targetLanguage,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Status = CardStatus.Created,
        };
    public required Guid CardId { get; init; }
    public required Guid UserId { get; init; }
    public required Guid DeckId { get; set; }
    public required Word Word { get; set; }
    public required Lang TargetLanguage { get; init; }
    public required CardStatus Status { get; set; }
    public required DateTime CreatedAt { get; init; }
    public required DateTime UpdatedAt { get; set; }
    public string? Translation { get; set; }
    public List<string> Tags { get; set; } = new List<string>();
    // TODO Enum or valueObject ?
    public string? CefrLevel { get; set; }
}
