using Domain.Abstractions;
namespace Domain.Events;

public record class ViewDeleted(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid ViewId) : IDomainEvent;
