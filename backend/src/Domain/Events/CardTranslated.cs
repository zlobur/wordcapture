using Domain.Abstractions;
namespace Domain.Events;

public record class CardTranslated(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid CardId,
    string Translation) : IDomainEvent;
