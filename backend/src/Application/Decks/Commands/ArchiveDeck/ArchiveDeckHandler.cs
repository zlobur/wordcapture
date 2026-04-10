using Domain.Repositories;
using Domain.Results;
using Mediator;

namespace Application.Decks.Commands.ArchiveDeck;

public sealed class ArchiveDeckHandler : ICommandHandler<ArchiveDeckCommand, Result<Unit>>
{
    private readonly IDeckRepository _repo;

    public ArchiveDeckHandler(IDeckRepository repo)
    {
        _repo = repo;
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

        return Result<Unit>.Ok(new Unit());
    }
}
