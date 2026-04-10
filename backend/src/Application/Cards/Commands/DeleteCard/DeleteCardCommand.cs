using Domain.Results;
using Mediator;

namespace Application.Cards.Commands.DeleteCard;

public record struct DeleteCardCommand(
    Guid CardId,
    Guid UserId) : ICommand<Result<Unit>>;
