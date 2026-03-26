using Domain.Abstractions;
namespace Domain.Events;

public record class DeckRenamed(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid DeckId,
    string NewName) : IDomainEvent;
