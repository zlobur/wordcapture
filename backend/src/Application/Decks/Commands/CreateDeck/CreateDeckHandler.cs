using Mediator;
using Domain.Results;
using Domain.Repositories;

namespace Application.Decks.Commands.CreateDeck;

public sealed class CreateDeckHandler : ICommandHandler<CreateDeckCommand, Result<Guid>>
{
    private readonly IDeckRepository _repo;
    public CreateDeckHandler(IDeckRepository repo)
    {
        _repo = repo;
    }
    public async ValueTask<Result<Guid>> Handle(CreateDeckCommand cmd, CancellationToken ct)
    {
        var deck = Domain.Entities.Deck.Create(cmd.UserId, cmd.Name);
        if (!deck.IsSuccess)
        {
            return Result<Guid>.Fail(deck.Error);
        }

        await _repo.AddDeckAsync(deck.Value, ct);

        return Result<Guid>.Ok(deck.Value.DeckId);
    }
}
