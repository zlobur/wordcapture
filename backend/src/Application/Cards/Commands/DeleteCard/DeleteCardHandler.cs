using Application.Abstractions;
using Domain.Events;
using Domain.Repositories;
using Domain.Results;
using Mediator;

namespace Application.Cards.Commands.DeleteCard;

public sealed class DeleteCardHandler : ICommandHandler<DeleteCardCommand, Result<Unit>>
{
    private readonly ICardRepository _repo;
    private readonly IEventPublisher _publisher;

    public DeleteCardHandler(ICardRepository repo, IEventPublisher publisher)
    {
        _repo = repo;
        _publisher = publisher;
    }

    public async ValueTask<Result<Unit>> Handle(DeleteCardCommand cmd, CancellationToken ct)
    {
        var card = await _repo.GetCardByIdAsync(cmd.CardId, cmd.UserId, ct);
        if (!card.IsSuccess)
        {
            return Result<Unit>.Fail(card.Error);
        }

        await _repo.DeleteCardByIdAsync(cmd.CardId, cmd.UserId, ct);

        var cardDeletedEvent = new CardDeleted(
            EventId: Guid.CreateVersion7(),
            UserId: cmd.UserId,
            OccurredAt: DateTimeOffset.UtcNow,
            CardId: cmd.CardId
        );

        await _publisher.Publish(cardDeletedEvent, ct);

        return Result<Unit>.Ok(new Unit());
    }
}
