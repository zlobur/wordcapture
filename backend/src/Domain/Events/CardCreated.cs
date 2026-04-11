using Domain.Abstractions;

namespace Domain.Events;

public record class CardCreated(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid CardId) : IDomainEvent;
