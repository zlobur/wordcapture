using Domain.Entities;
using Domain.Results;
using Domain.ValueObjects;
using Domain.Repositories;
using Mediator;

namespace Application.Cards.Commands.CreateCard;

public sealed class CreateCardHandler : ICommandHandler<CreateCardCommand, Result<Guid>>
{
    private readonly ICardRepository _cardRepo;
    public CreateCardHandler(ICardRepository cardRepo)
    {
        _cardRepo = cardRepo;
    }
    public async ValueTask<Result<Guid>> Handle(CreateCardCommand cmd, CancellationToken ct)
    {
        var rCard = Lang.Create(cmd.Lang)
            .Bind(lang => Word.Create(cmd.Word, lang)
                .Map(word => Card.Create(cmd.UserId, word, lang, cmd.DeckId)));

        if (!rCard.IsSuccess)
            return Result<Guid>.Fail(rCard.Error);

        await _cardRepo.AddCardAsync(rCard.Value, ct);

        return Result<Guid>.Ok(rCard.Value.CardId);
    }
}
