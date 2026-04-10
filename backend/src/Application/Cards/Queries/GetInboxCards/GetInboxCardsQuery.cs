using Domain.Entities;
using Domain.Results;
using Mediator;

namespace Application.Cards.Queries.GetInboxCards;

public sealed record class GetInboxCardsQuery(
    Guid UserId,
     int Offset,
      int Limit)
: IQuery<Result<PagedResult<Card>>>;
