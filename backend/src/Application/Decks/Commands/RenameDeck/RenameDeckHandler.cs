using Domain.Results;
using Mediator;
using Domain.Repositories;
using Domain.ValueObjects;
using Domain.Errors;
using Application.Abstractions;
using Domain.Events;

namespace Application.Deck.Commands.RenameDeck;

public sealed class RenameDeckHandler : ICommandHandler<RenameDeckCommand, Result<Unit>>
{
    private readonly IDeckRepository _repo;
    private readonly IEventPublisher _publisher;

    public RenameDeckHandler(IDeckRepository repo, IEventPublisher publisher)
    {
        _repo = repo;
        _publisher = publisher;
    }

    public async ValueTask<Result<Unit>> Handle(RenameDeckCommand cmd, CancellationToken ct)
    {
        var newName = DeckName.Create(cmd.NewName);

        if (!newName.IsSuccess)
        {
            return Result<Unit>.Fail(newName.Error);
        }

        var deck = await _repo.GetDeckByIdAsync(cmd.DeckId, cmd.UserId, ct);

        if (!deck.IsSuccess)
        {
            return Result<Unit>.Fail(new Error(DeckErrors.NotFound, "Deck is not found"));
        }

        deck.Value.Rename(newName.Value);

        await _repo.UpdateDeckAsync(deck.Value, ct);

        var deckRenamedEvent = new DeckRenamed(
            EventId: Guid.CreateVersion7(),
            UserId: cmd.UserId,
            OccurredAt: DateTimeOffset.UtcNow,
            DeckId: cmd.DeckId,
            NewName: cmd.NewName
        );

        await _publisher.Publish(deckRenamedEvent, ct);

        return Result<Unit>.Ok(new Unit());
    }
}
