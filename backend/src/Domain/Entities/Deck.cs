using System;
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
    ) => string.IsNullOrWhiteSpace(name)
        ? new Result<Deck>.Error(DeckErrors.NameEmpty, "Deck name cannot be empty")
        : new Result<Deck>.Success(
            new Deck
            {
                DeckId = Guid.NewGuid(),
                UserId = userId,
                Name = name.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });

    public required Guid DeckId { get; init; }
    public required Guid UserId { get; init; }
    public required string Name { get; set; }
    public required DateTime CreatedAt { get; init; }
    public required DateTime UpdatedAt { get; set; }
}
