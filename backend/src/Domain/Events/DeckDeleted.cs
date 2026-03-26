using Domain.Abstractions;
namespace Domain.Events;

public record class DeckDeleted(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid DeckId) : IDomainEvent;
