using Domain.ValueObjects;
using Domain.Results;
using Domain.Errors;

namespace Domain.Entities;

public class Deck
{
    private Deck() { }

    public static Result<Deck> Create
    (
        string userId,
        string name
    ) => DeckName.Create(name).Map(deckName =>
            new Deck
            {
                DeckId = Guid.CreateVersion7(),
                UserId = userId,
                Name = deckName,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

    public void Rename(DeckName newName)
    {
        Name = newName;
        UpdatedAt = DateTime.UtcNow;
    }

    public required Guid DeckId { get; init; }
    public required string UserId { get; init; }
    public DeckName Name { get; private set; }
    public required DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; private set; }
}
