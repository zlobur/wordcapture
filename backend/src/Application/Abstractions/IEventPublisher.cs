using Domain.Abstractions;

namespace Application.Abstractions;

public interface IEventPublisher
{
    Task Publish(IDomainEvent domainEvent, CancellationToken ct);
}
