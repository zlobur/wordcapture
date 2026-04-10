using Domain.Results;
using Mediator;
using Domain.Repositories;
using Domain.ValueObjects;
using Domain.Errors;

namespace Application.Deck.Commands.RenameDeck;

public sealed class RenameDeckHandler : ICommandHandler<RenameDeckCommand, Result<Unit>>
{
    private readonly IDeckRepository _repo;

    public RenameDeckHandler(IDeckRepository repo)
    {
        _repo = repo;
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

        return Result<Unit>.Ok(new Unit());
    }
}
