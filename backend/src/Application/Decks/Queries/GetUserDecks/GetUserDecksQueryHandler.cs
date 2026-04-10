using Domain.Results;
using Domain.Entities;
using Mediator;
using Domain.Repositories;

namespace Application.Decks.Queries.GetUserDecks;

public sealed class GetUserDecksQueryHandler : IQueryHandler<GetUserDecksQuery, Result<IReadOnlyList<Domain.Entities.Deck>>>
{
    private readonly IDeckRepository _deckRepo;

    public GetUserDecksQueryHandler(IDeckRepository deckRepo)
    {
        _deckRepo = deckRepo;
    }
    public async ValueTask<Result<IReadOnlyList<Domain.Entities.Deck>>> Handle(GetUserDecksQuery q, CancellationToken ct)
    {
        var decks = await _deckRepo.GetAllDecksByUserIdAsync(q.UserId, ct);

        return Result<IReadOnlyList<Domain.Entities.Deck>>.Ok(decks);
    }
}
