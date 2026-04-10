using Domain.Results;
using Domain.Entities;
using Mediator;
using Domain.Repositories;

namespace Application.Decks.Queries.GetDeckById;

public sealed class GetDeckByIdHandler : IQueryHandler<GetDeckByIdQuery, Result<Domain.Entities.Deck>>
{
    private readonly IDeckRepository _deckRepo;

    public GetDeckByIdHandler(IDeckRepository cardRepo)
    {
        _deckRepo = cardRepo;
    }
    public async ValueTask<Result<Domain.Entities.Deck>> Handle(GetDeckByIdQuery q, CancellationToken ct)
    {
        return await _deckRepo.GetDeckByIdAsync(q.DeckId, q.UserId, ct);
    }
}
