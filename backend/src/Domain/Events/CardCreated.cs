using Domain.Abstractions;

namespace Domain.Events;

public record class CardCreated(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid CardId,
    string Original,
    string SourceLanguage,
    string Context) : IDomainEvent;
