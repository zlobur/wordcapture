using Domain.Results;
using Mediator;

namespace Application.Cards.Commands.MoveCard;

public sealed record class MoveCardCommand(
    Guid CardId,
    Guid UserId,
    Guid? TargetDeckId) : ICommand<Result<Unit>>;
