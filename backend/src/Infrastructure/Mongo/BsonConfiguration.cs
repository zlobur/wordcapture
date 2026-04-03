using System;
using Domain.Entities;
using Domain.Enums;
using Infrastructure.Mongo.Serializers;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.Serializers;

namespace Infrastructure.Mongo;

public static class BsonConfiguration
{
    public static void Configure()
    {
        ConventionRegistry.Register(
            "camelCase",
            new ConventionPack { new CamelCaseElementNameConvention() },
            _ => true
        );

        BsonSerializer.RegisterSerializer(
            new GuidSerializer(GuidRepresentation.Standard));
        BsonSerializer.RegisterSerializer(new LangBsonSerializer());
        BsonSerializer.RegisterSerializer(new WordBsonSerializer());
        BsonSerializer.RegisterSerializer(new EnumSerializer<CardStatus>(BsonType.String));

        BsonClassMap.RegisterClassMap<Card>(cm =>
        {
            cm.AutoMap();
            cm.MapIdMember(c => c.CardId);
        });

        BsonClassMap.RegisterClassMap<Deck>(cm =>
        {
            cm.AutoMap();
            cm.MapIdMember(c => c.DeckId);
        });
    }
}
