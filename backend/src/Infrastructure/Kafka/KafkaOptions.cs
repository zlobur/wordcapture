using System.Text.Json;

namespace Infrastructure.Kafka;

public class KafkaOptions
{
    public const string SectionName = "Kafka";
    public required string BootstrapServers { get; init; }
    public required string Topic { get; init; }
}
