using Domain.Abstractions;
namespace Domain.Events;

public record class CardDeleted(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid CardId) : IDomainEvent;
