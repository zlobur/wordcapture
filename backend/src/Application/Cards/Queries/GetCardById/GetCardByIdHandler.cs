using Domain.Results;
using Domain.Entities;
using Mediator;
using Domain.Repositories;

namespace Application.Cards.Queries.GetCardById;

public sealed class GetCardByIdHandler : IQueryHandler<GetCardByIdQuery, Result<Card>>
{
    private readonly ICardRepository _cardRepo;

    public GetCardByIdHandler(ICardRepository cardRepo)
    {
        _cardRepo = cardRepo;
    }
    public async ValueTask<Result<Card>> Handle(GetCardByIdQuery q, CancellationToken ct)
    {
        return await _cardRepo.GetCardByIdAsync(q.CardId, q.UserId, ct);
    }
}
