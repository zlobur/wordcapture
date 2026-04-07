using Domain.Enums;
using Domain.ValueObjects;

namespace Domain.Entities;

public class Card
{
    private Card() { }
    public static Card Create(
        Guid userId,
        Word word,
        Lang targetLanguage,
        Guid? deckId) =>

        new Card
        {
            CardId = Guid.CreateVersion7(),
            UserId = userId,
            DeckId = deckId,
            Word = word,
            TargetLanguage = targetLanguage,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            Status = CardStatus.Created,
        };

    public void MoveCard(Guid? deckId)
    {
        DeckId = deckId;
        UpdatedAt = DateTime.Now;
    }

    public required Guid CardId { get; init; }
    public required Guid UserId { get; init; }
    public Guid? DeckId { get; private set; }
    public required Word Word { get; set; }
    public required Lang TargetLanguage { get; init; }
    public required CardStatus Status { get; set; }
    public required DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; private set; }
    public string? Translation { get; set; }
    public List<string> Tags { get; set; } = new List<string>();
    // TODO Enum or valueObject ?
    public string? CefrLevel { get; set; }
}
