using Domain.Results;
using Mediator;
namespace Application.Decks.Queries.GetDeckById;

public record struct GetDeckByIdQuery(
    Guid DeckId,
    Guid UserId) : IQuery<Result<Domain.Entities.Deck>>;

