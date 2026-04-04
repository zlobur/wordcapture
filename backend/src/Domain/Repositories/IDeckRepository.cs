using Domain.Entities;
using Domain.Results;
using Domain.ValueObjects;

namespace Application.Abstractions.Repositoies;

public interface IDeckRepository
{
    Task<Result<Deck>> GetDeckByIdAsync(Guid deckId, Guid userId, CancellationToken ct);
    Task<Result<IEnumerable<Deck>>> GetAllDecksByUserIdAsync(Guid userId, CancellationToken ct);
    Task<Result<bool>> AddDeckAsync(Guid deckId, Guid userGuid, string name, CancellationToken ct);
    Task<Result<bool>> UpdateDeckAsync(Guid deckId, Guid userId, string name, CancellationToken ct);
    Task<Result<bool>> DeleteDeckByIdAsync(Guid deckId, Guid userId, CancellationToken ct);
}
