using Domain.Abstractions;
namespace Domain.Events;

public record class CardTagged(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid CardId,
    string Tag) : IDomainEvent;
