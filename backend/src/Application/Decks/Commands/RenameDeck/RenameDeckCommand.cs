using Domain.Results;
using Mediator;

namespace Application.Deck.Commands.RenameDeck;

public sealed record RenameDeckCommand(
    Guid DeckId,
    Guid UserId,
    string NewName) : ICommand<Result<Unit>>;
