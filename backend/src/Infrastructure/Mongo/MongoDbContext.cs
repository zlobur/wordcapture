using MongoDB.Driver;
using Domain.Entities;

namespace Infrastructure.Mongo;

public sealed class MongoDbContext
{
    private readonly IMongoDatabase _db;

    public MongoDbContext(IMongoDatabase db)
    {
        _db = db;
    }

    public IMongoCollection<Card> Cards => _db.GetCollection<Card>("cards");
    public IMongoCollection<Deck> Decks => _db.GetCollection<Deck>("decks");
}

