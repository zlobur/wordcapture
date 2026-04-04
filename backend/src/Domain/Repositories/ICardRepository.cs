
using Domain.Entities;
using Domain.Results;
using Domain.ValueObjects;

namespace Application.Abstractions.Repositoies;

public interface ICardRepository
{
    Task<Result<Card>> GetCardByIdAsync(Guid cardId, Guid userId, CancellationToken ct);
    Task<Result<IEnumerable<Card>>> GetCardsByDeckIdAsync(Guid deckId, Guid userId, CancellationToken ct);
    Task<Result<Card>> GetInboxCardAsync(Guid userId, CancellationToken ct);
    Task<Result<bool>> AddCardAsync(Guid userId, Word word, Guid deckId, CancellationToken ct);
    Task<Result<bool>> UpdateCardAsync(Guid deckId, Guid userId, Word word, CancellationToken ct);
    Task<Result<bool>> DeleteCardByIdAsync(Guid cardId, Guid userId, CancellationToken ct);
}
