using Application.Abstractions;
using Domain.Events;
using Domain.Repositories;
using Domain.Results;
using Mediator;

namespace Application.Decks.Commands.ArchiveDeck;

public sealed class ArchiveDeckHandler : ICommandHandler<ArchiveDeckCommand, Result<Unit>>
{
    private readonly IDeckRepository _repo;
    private readonly IEventPublisher _publisher;

    public ArchiveDeckHandler(IDeckRepository repo, IEventPublisher publisher)
    {
        _repo = repo;
        _publisher = publisher;
    }

    public async ValueTask<Result<Unit>> Handle(ArchiveDeckCommand cmd, CancellationToken ct)
    {
        var deck = await _repo.GetDeckByIdAsync(cmd.DeckId, cmd.UserId, ct);

        if (!deck.IsSuccess)
        {
            return Result<Unit>.Fail(deck.Error);
        }

        deck.Value.Archive();

        await _repo.UpdateDeckAsync(deck.Value, ct);

        var deckArchivedEvent = new DeckArchived(
            EventId: Guid.CreateVersion7(),
            UserId: cmd.UserId,
            OccurredAt: DateTimeOffset.UtcNow,
            DeckId: deck.Value.DeckId
        );

        await _publisher.Publish(deckArchivedEvent, ct);

        return Result<Unit>.Ok(new Unit());
    }
}
