
using Domain.Entities;
using Domain.Results;

namespace Domain.Repositories;

public interface ICardRepository
{
    Task<Result<Card>> GetCardByIdAsync(Guid cardId, Guid userId, CancellationToken ct);
    Task<PagedResult<Card>> GetCardsByDeckIdAsync(Guid? deckId, Guid userId, int offset, int limit, CancellationToken ct);
    Task AddCardAsync(Card card, CancellationToken ct);
    Task UpdateCardAsync(Card card, CancellationToken ct);
    Task DeleteCardByIdAsync(Guid cardId, Guid userId, CancellationToken ct);
}
