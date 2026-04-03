using Domain.ValueObjects;
using MongoDB.Bson;
using MongoDB.Bson.IO;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Serializers;

namespace Infrastructure.Mongo.Serializers;

public sealed class WordBsonSerializer : SerializerBase<Word>
{
    public override void Serialize(BsonSerializationContext context, BsonSerializationArgs args, Word value)
    {
        context.Writer.WriteStartDocument();
        context.Writer.WriteName("text");
        context.Writer.WriteString(value.Text);
        context.Writer.WriteName("lang");
        BsonSerializer.Serialize(context.Writer, value.Lang);
        context.Writer.WriteEndDocument();
    }

    public override Word Deserialize(BsonDeserializationContext context, BsonDeserializationArgs args)
    {
        context.Reader.ReadStartDocument();
        string? text = null;
        Lang? lang = null;

        while (context.Reader.ReadBsonType() != BsonType.EndOfDocument)
        {
            var name = context.Reader.ReadName(Utf8NameDecoder.Instance);
            switch (name)
            {
                case "text": text = context.Reader.ReadString(); break;
                case "lang": lang = BsonSerializer.Deserialize<Lang>(context.Reader); break;
                default: context.Reader.SkipValue(); break;
            }
        }

        context.Reader.ReadEndDocument();
        return new Word(
            text ?? throw new BsonSerializationException("Missing 'text'"),
            lang ?? throw new BsonSerializationException("Missing 'lang'"));
    }
}
