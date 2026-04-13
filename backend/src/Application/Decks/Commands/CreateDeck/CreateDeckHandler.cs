using Mediator;
using Domain.Results;
using Domain.Repositories;
using Application.Abstractions;
using Domain.Events;

namespace Application.Decks.Commands.CreateDeck;

public sealed class CreateDeckHandler : ICommandHandler<CreateDeckCommand, Result<Guid>>
{
    private readonly IDeckRepository _repo;
    private readonly IEventPublisher _publisher;
    public CreateDeckHandler(IDeckRepository repo, IEventPublisher publisher)
    {
        _repo = repo;
        _publisher = publisher;
    }
    public async ValueTask<Result<Guid>> Handle(CreateDeckCommand cmd, CancellationToken ct)
    {
        var deck = Domain.Entities.Deck.Create(cmd.UserId, cmd.Name);
        if (!deck.IsSuccess)
        {
            return Result<Guid>.Fail(deck.Error);
        }

        await _repo.AddDeckAsync(deck.Value, ct);

        var deckCreatedEvent = new DeckCreated(
            EventId: Guid.CreateVersion7(),
            UserId: cmd.UserId,
            OccurredAt: DateTimeOffset.UtcNow,
            DeckId: deck.Value.DeckId,
            Name: deck.Value.Name.Value
        );

        await _publisher.Publish(deckCreatedEvent, ct);

        return Result<Guid>.Ok(deck.Value.DeckId);
    }
}
