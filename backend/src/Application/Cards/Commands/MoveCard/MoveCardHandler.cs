using Domain.Errors;
using Domain.Repositories;
using Domain.Results;
using Mediator;

namespace Application.Cards.Commands.MoveCard;

public sealed class MoveCardHandler : ICommandHandler<MoveCardCommand, Result<Unit>>
{
    private readonly ICardRepository _cardRepo;
    private readonly IDeckRepository _deckRepo;

    public MoveCardHandler(ICardRepository cardRepo, IDeckRepository deckRepo)
    {
        _cardRepo = cardRepo;
        _deckRepo = deckRepo;
    }

    public async ValueTask<Result<Unit>> Handle(MoveCardCommand cmd, CancellationToken ct)
    {
        var card = await _cardRepo.GetCardByIdAsync(cmd.CardId, cmd.UserId, ct);

        if (!card.IsSuccess)
        {
            return Result<Unit>.Fail(new Error(CardErrors.NotFound, "Card is not found"));
        }

        Guid? targetDeckId = null;

        if (cmd.TargetDeckId.HasValue)
        {
            var deck = await _deckRepo.GetDeckByIdAsync(cmd.TargetDeckId.Value, cmd.UserId, ct);
            if (!deck.IsSuccess)
            {
                return Result<Unit>.Fail(new Error(DeckErrors.NotFound, "Target deck not found"));
            }
            targetDeckId = deck.Value.DeckId;
        }

        card.Value.MoveCard(targetDeckId);

        await _cardRepo.UpdateCardAsync(card.Value, ct);

        return Result<Unit>.Ok(new Unit());
    }
}
