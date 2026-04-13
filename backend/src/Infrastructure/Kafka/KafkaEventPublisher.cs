using Application.Abstractions;
using Domain.Abstractions;
using Microsoft.Extensions.Options;
using Confluent.Kafka;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using System.Text;

namespace Infrastructure.Kafka;

public sealed class KafkaEventPublisher : IEventPublisher, IDisposable
{
    private readonly KafkaOptions _options;
    private readonly ILogger<KafkaEventPublisher> _logger;
    private readonly IProducer<string, string> _producer;
    public KafkaEventPublisher(IOptions<KafkaOptions> options, ILogger<KafkaEventPublisher> logger)
    {
        _options = options.Value;
        _logger = logger;

        var cfg = new ProducerConfig
        {
            BootstrapServers = options.Value.BootstrapServers,
            Acks = Acks.All,
            EnableIdempotence = true
        };

        _producer = new ProducerBuilder<string, string>(cfg).Build();
    }

    public void Dispose()
    {
        _producer.Flush(TimeSpan.FromSeconds(5));
        _producer.Dispose();
    }

    public async Task Publish(IDomainEvent domainEvent, CancellationToken ct)
    {
        try
        {
            await _producer.ProduceAsync(_options.Topic, CreateMessage(domainEvent), ct);
        }
        catch (ProduceException<string, string> e)
        {
            _logger.LogWarning(e, "Failed to publish {EventType} for user {UserId}",
                domainEvent.GetType().Name,
                domainEvent.UserId);
        }
    }

    private Message<string, string> CreateMessage(IDomainEvent domainEvent)
    {
        var eventTypeNameBytes = Encoding.UTF8.GetBytes(domainEvent.GetType().Name);

        var msg = new Message<string, string>
        {
            Headers = new Headers { { KafkaContract.HeadersEventType, eventTypeNameBytes } },
            Key = domainEvent.UserId.ToString(),
            Value = JsonSerializer.Serialize(domainEvent, domainEvent.GetType(), KafkaContract.JsonSerializerOptions)
        };

        return msg;
    }
}
