using System;
using System.Reflection;
using Domain.ValueObjects;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Infrastructure.Mongo.Serializers;

public class LangBsonSerializer : SerializerBase<Lang>
{
    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, Lang value)
        => context.Writer.WriteString(value.Code);

    public override Lang Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
        => new Lang(context.Reader.ReadString());
}
