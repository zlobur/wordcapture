using Domain.Abstractions;
namespace Domain.Events;

public record class DeckCreated(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid DeckId,
    string Name) : IDomainEvent;
