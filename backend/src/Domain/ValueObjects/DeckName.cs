using Domain.Results;
using Domain.Errors;

namespace Domain.ValueObjects;

public readonly record struct DeckName
{
    public string Value { get; }

    internal DeckName(string name)
    {
        Value = name;
    }

    public static Result<DeckName> Create(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return Result<DeckName>.Fail(new(DeckErrors.NameEmpty, "Deck name cannot be empty"));
        }

        if (name.Length > 100)
        {
            return Result<DeckName>.Fail(new(DeckErrors.NameTooLong, "Deck name cannot be more than 100 chacters"));
        }

        return Result<DeckName>.Ok(new DeckName(name.Trim()));
    }
}
