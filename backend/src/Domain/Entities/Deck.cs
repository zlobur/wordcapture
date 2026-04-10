using Domain.ValueObjects;
using Domain.Results;
using Domain.Errors;

namespace Domain.Entities;

public class Deck
{
    private Deck() { }

    public static Result<Deck> Create
    (
        Guid userId,
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

    public void Archive()
    {
        IsArchived = true;
        ArchivedAt = DateTime.UtcNow;
    }

    public required Guid DeckId { get; init; }
    public required Guid UserId { get; init; }
    public DeckName Name { get; private set; }
    public required DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; private set; }
    public bool IsArchived { get; private set; }
    public DateTime ArchivedAt { get; private set; }
}
