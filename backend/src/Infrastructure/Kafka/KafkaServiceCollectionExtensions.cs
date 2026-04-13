using Application.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Kafka;

public static class KafkaServiceCollectionExtensions
{
    public static IServiceCollection AddKafka(
        this IServiceCollection svc, IConfiguration cfg
    )
    {
        svc
            .AddOptions<KafkaOptions>()
            .BindConfiguration(KafkaOptions.SectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        svc.AddSingleton<IEventPublisher, KafkaEventPublisher>();
        svc.AddHostedService<EventConsumer>();

        return svc;
    }
}
