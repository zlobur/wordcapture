using Domain.Entities;
using Mediator;
using Domain.Results;

namespace Application.Decks.Queries.GetUserDecks;

public sealed record class GetUserDecksQuery(
    Guid UserId
) : IQuery<Result<IReadOnlyList<Domain.Entities.Deck>>>;
