using Domain.Abstractions;
namespace Domain.Events;

public record class DeckArchived(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid DeckId) : IDomainEvent;
