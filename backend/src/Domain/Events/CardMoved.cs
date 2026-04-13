using Domain.Abstractions;
namespace Domain.Events;

public record class CardMoved(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid CardId,
    Guid? ToDeckId) : IDomainEvent;
