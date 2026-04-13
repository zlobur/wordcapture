using System.Text;
using System.Text.Json;
using Confluent.Kafka;
using Domain.Abstractions;
using Domain.Events;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Infrastructure.Kafka;

public sealed class EventConsumer : BackgroundService
{
    private readonly KafkaOptions _kafkaOptions;
    private readonly ILogger<EventConsumer> _logger;
    private readonly IConsumer<string, string> _consumer;
    public EventConsumer(IOptions<KafkaOptions> options, ILogger<EventConsumer> logger)
    {
        _kafkaOptions = options.Value;
        _logger = logger;

        var cfg = new ConsumerConfig
        {
            BootstrapServers = options.Value.BootstrapServers,
            GroupId = "cardstore.events",
            EnableAutoCommit = true,
            AutoOffsetReset = AutoOffsetReset.Earliest,
            PartitionAssignmentStrategy = PartitionAssignmentStrategy.CooperativeSticky
        };

        _consumer = new ConsumerBuilder<string, string>(cfg).Build();
    }

    protected override Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _consumer.Subscribe(_kafkaOptions.Topic);

        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                ConsumeResult<string, string>? msg = null;
                try
                {
                    msg = _consumer.Consume(stoppingToken);
                    msg.Message.Headers.TryGetLastBytes(KafkaContract.HeadersEventType, out var bytes);
                    var eventTypeName = Encoding.UTF8.GetString(bytes);

                    IDomainEvent? domainEvent = eventTypeName switch
                    {
                        nameof(CardCreated) => JsonSerializer.Deserialize<CardCreated>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(CardDeleted) => JsonSerializer.Deserialize<CardDeleted>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(CardEnriched) => JsonSerializer.Deserialize<CardEnriched>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(CardMoved) => JsonSerializer.Deserialize<CardMoved>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(CardTagged) => JsonSerializer.Deserialize<CardTagged>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(CardTranslated) => JsonSerializer.Deserialize<CardTranslated>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(DeckArchived) => JsonSerializer.Deserialize<DeckArchived>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(DeckCreated) => JsonSerializer.Deserialize<DeckCreated>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(DeckRenamed) => JsonSerializer.Deserialize<DeckRenamed>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(ViewCreated) => JsonSerializer.Deserialize<ViewCreated>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(ViewDeleted) => JsonSerializer.Deserialize<ViewDeleted>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        nameof(ViewUpdated) => JsonSerializer.Deserialize<ViewUpdated>(msg.Message.Value, KafkaContract.JsonSerializerOptions),
                        _ => null
                    };

                    if (domainEvent is null)
                    {
                        _logger.LogWarning("Unknown or failed event type: {EventType}", eventTypeName);
                        _consumer.StoreOffset(msg);
                        continue;
                    }

                    _logger.LogInformation("Consumed {EventType}, key={Key}", eventTypeName, msg.Message.Key);
                    _consumer.StoreOffset(msg);
                }
                catch (OperationCanceledException)
                {
                    throw;
                }
                catch (Exception e)
                {
                    _logger.LogWarning(e,
    "Failed to process message from partition {Partition} offset {Offset}",
    msg?.Partition.Value,
    msg?.Offset.Value);
                }
            }
        }
        catch (OperationCanceledException e)
        {
            _logger.LogInformation("Consumer is interrupted by stopping token");
        }
        finally
        {
            _consumer.Close();
        }

        return Task.CompletedTask;
    }
}
