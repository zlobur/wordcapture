using Domain.Results;
using Mediator;

namespace Application.Decks.Commands.CreateDeck;

public sealed record class CreateDeckCommand(
Guid UserId,
 string Name
) : ICommand<Result<Guid>>;
