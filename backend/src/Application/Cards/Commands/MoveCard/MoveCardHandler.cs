using Application.Abstractions;
using Domain.Errors;
using Domain.Events;
using Domain.Repositories;
using Domain.Results;
using Mediator;

namespace Application.Cards.Commands.MoveCard;

public sealed class MoveCardHandler : ICommandHandler<MoveCardCommand, Result<Unit>>
{
    private readonly ICardRepository _cardRepo;
    private readonly IDeckRepository _deckRepo;
    private readonly IEventPublisher _publisher;

    public MoveCardHandler(ICardRepository cardRepo, IDeckRepository deckRepo, IEventPublisher publisher)
    {
        _cardRepo = cardRepo;
        _deckRepo = deckRepo;
        _publisher = publisher;
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

        var cardMovedEvent = new CardMoved(
        EventId: Guid.CreateVersion7(),
        UserId: cmd.UserId,
        OccurredAt: DateTimeOffset.UtcNow,
        CardId: cmd.CardId,
        ToDeckId: cmd.TargetDeckId
    );

        await _publisher.Publish(cardMovedEvent, ct);

        return Result<Unit>.Ok(new Unit());
    }
}
