using Domain.Abstractions;
namespace Domain.Events;

public record class ViewUpdated(
    Guid EventId,
    Guid UserId,
    DateTimeOffset OccurredAt,
    Guid ViewId,
    string Name,
    IReadOnlyList<string> Filters) : IDomainEvent;
