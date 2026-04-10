using Domain.Results;
using Mediator;

namespace Application.Decks.Commands.ArchiveDeck;

public record struct ArchiveDeckCommand(
    Guid DeckId, Guid UserId) : ICommand<Result<Unit>>;
