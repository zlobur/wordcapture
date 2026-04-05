using Domain.Entities;
using Mediator;
using Domain.Results;

namespace Application.Cards.Queries.GetCardById;

public sealed record GetCardByIdQuery(
    Guid CardId,
    Guid UserId
) : IQuery<Result<Card>>;
