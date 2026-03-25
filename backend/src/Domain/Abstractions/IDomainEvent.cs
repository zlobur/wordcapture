using System;

namespace Domain.Abstractions;

public interface IDomainEvent
{
    public Guid EventId { get; init; }
    public Guid UserId { get; init; }
    public DateTimeOffset OccurredAt { get; init; }
}
