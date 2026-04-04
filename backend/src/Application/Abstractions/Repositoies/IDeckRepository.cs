using Domain.Entities;
using Domain.Results;

namespace Domain.Repositories;

public interface IDeckRepository
{
    Task<Result<Deck>> GetDeckByIdAsync(Guid deckId, Guid userId, CancellationToken ct);
    Task<IReadOnlyList<Deck>> GetAllDecksByUserIdAsync(Guid userId, CancellationToken ct);
    Task AddDeckAsync(Deck deck, CancellationToken ct);
    Task UpdateDeckAsync(Deck deck, CancellationToken ct);
    Task DeleteDeckByIdAsync(Guid deckId, Guid userId, CancellationToken ct);
}
