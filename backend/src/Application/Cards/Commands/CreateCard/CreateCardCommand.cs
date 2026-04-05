using Domain.Results;
using Mediator;

namespace Application.Cards.Commands.CreateCard;

public sealed record CreateCardCommand(
    string Word,
    string Lang,
    Guid UserId,
    Guid? DeckId
) : ICommand<Result<Guid>>;
