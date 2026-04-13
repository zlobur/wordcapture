using System.Text.Json;

namespace Infrastructure.Kafka;

public static class KafkaContract
{
    public const string HeadersEventType = "event-type";
    public static readonly JsonSerializerOptions JsonSerializerOptions =
        new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };
}
