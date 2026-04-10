using Domain.Entities;
using Domain.Repositories;
using Domain.Results;
using Mediator;

namespace Application.Cards.Queries.GetInboxCards;

public sealed class GetInboxCardsHandler : IQueryHandler<GetInboxCardsQuery, Result<PagedResult<Card>>>
{
    private readonly ICardRepository _repo;

    public GetInboxCardsHandler(ICardRepository repo)
    {
        _repo = repo;
    }

    public async ValueTask<Result<PagedResult<Card>>> Handle(GetInboxCardsQuery q, CancellationToken ct)
    {
        var cards = await _repo.GetCardsByDeckIdAsync(null, q.UserId, q.Offset, q.Limit, ct);

        return Result<PagedResult<Card>>.Ok(cards);
    }
}
