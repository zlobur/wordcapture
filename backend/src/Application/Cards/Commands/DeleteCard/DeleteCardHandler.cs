using Domain.Repositories;
using Domain.Results;
using Mediator;

namespace Application.Cards.Commands.DeleteCard;

public sealed class DeleteCardHandler : ICommandHandler<DeleteCardCommand, Result<Unit>>
{
    private readonly ICardRepository _repo;

    public DeleteCardHandler(ICardRepository repo)
    {
        _repo = repo;
    }

    public async ValueTask<Result<Unit>> Handle(DeleteCardCommand cmd, CancellationToken ct)
    {
        var card = await _repo.GetCardByIdAsync(cmd.CardId, cmd.UserId, ct);
        if (!card.IsSuccess)
        {
            return Result<Unit>.Fail(card.Error);
        }

        await _repo.DeleteCardByIdAsync(cmd.CardId, cmd.UserId, ct);

        return Result<Unit>.Ok(new Unit());
    }
}
