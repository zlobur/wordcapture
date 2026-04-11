using Domain.Entities;
using Domain.Results;
using Domain.ValueObjects;
using Domain.Repositories;
using Mediator;
using Application.Abstractions;
using Domain.Events;

namespace Application.Cards.Commands.CreateCard;

public sealed class CreateCardHandler : ICommandHandler<CreateCardCommand, Result<Guid>>
{
    private readonly ICardRepository _cardRepo;
    private readonly IEventPublisher _publisher;
    public CreateCardHandler(ICardRepository cardRepo, IEventPublisher publisher)
    {
        _cardRepo = cardRepo;
        _publisher = publisher;
    }
    public async ValueTask<Result<Guid>> Handle(CreateCardCommand cmd, CancellationToken ct)
    {
        var rCard = Lang.Create(cmd.Lang)
            .Bind(lang => Word.Create(cmd.Word, lang)
                .Map(word => Card.Create(cmd.UserId, word, lang, cmd.DeckId)));

        if (!rCard.IsSuccess)
            return Result<Guid>.Fail(rCard.Error);

        await _cardRepo.AddCardAsync(rCard.Value, ct);

        var card = rCard.Value;
        var cardCreatedEvent = new CardCreated(
            EventId: Guid.CreateVersion7(),
            UserId: cmd.UserId,
            OccurredAt: DateTimeOffset.UtcNow,
            CardId: card.CardId
        );

        await _publisher.Publish(cardCreatedEvent, ct);

        return Result<Guid>.Ok(rCard.Value.CardId);
    }
}
