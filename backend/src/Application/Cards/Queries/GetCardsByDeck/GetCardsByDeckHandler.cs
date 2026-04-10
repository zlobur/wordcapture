using Domain.Entities;
using Domain.Repositories;
using Domain.Results;
using Mediator;

namespace Application.Cards.Queries.GetCardsByDeck;

public sealed class GetCardsByDeckHandler : IQueryHandler<GetCardsByDeckQuery, Result<PagedResult<Card>>>
{
    private readonly ICardRepository _repo;

    public GetCardsByDeckHandler(ICardRepository repo)
    {
        _repo = repo;
    }

    public async ValueTask<Result<PagedResult<Card>>> Handle(GetCardsByDeckQuery q, CancellationToken ct)
    {
        var cards = await _repo.GetCardsByDeckIdAsync(q.DeckId, q.UserId, q.Offset, q.Limit, ct);

        return Result<PagedResult<Card>>.Ok(cards);
    }
}
