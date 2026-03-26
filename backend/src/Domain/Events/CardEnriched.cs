using Domain.Abstractions;
namespace Domain.Events;

public record class CardEnriched(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid CardId) : IDomainEvent;
