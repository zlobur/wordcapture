using System;
using Application.Abstractions;
using Domain.Abstractions;
using Microsoft.Extensions.Options;
using Confluent.Kafka;
using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Kafka;

public class KafkaEventPublisher : IEventPublisher, IDisposable
{
    private static readonly JsonSerializerOptions jsonSerializerOptions =
        new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
    private readonly KafkaOptions _opt;
    private readonly ILogger<KafkaEventPublisher> _logger;
    private readonly IProducer<string, string> _producer;
    public KafkaEventPublisher(IOptions<KafkaOptions> opt, ILogger<KafkaEventPublisher> logger)
    {
        _opt = opt.Value;
        _logger = logger;

        var cfg = new ProducerConfig
        {
            BootstrapServers = opt.Value.BootstrapServers,
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
            var msg = new Message<string, string>
            {
                Key = domainEvent.UserId.ToString(),
                Value = JsonSerializer.Serialize(domainEvent, domainEvent.GetType(), jsonSerializerOptions)
            };

            await _producer.ProduceAsync(_opt.Topic, msg, ct);
        }
        catch (ProduceException<string, string> e)
        {
            _logger.LogWarning(e, "Failed to publish {EventType} for user {UserId}",
                domainEvent.GetType().Name,
                domainEvent.UserId);
        }
    }
}
