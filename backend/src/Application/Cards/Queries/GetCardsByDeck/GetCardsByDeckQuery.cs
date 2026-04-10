using Domain.Entities;
using Domain.Results;
using Mediator;

namespace Application.Cards.Queries.GetCardsByDeck;

public sealed record class GetCardsByDeckQuery(Guid DeckId, Guid UserId, int Offset, int Limit)
: IQuery<Result<PagedResult<Card>>>;
