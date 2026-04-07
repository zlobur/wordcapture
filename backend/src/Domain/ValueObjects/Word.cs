using Domain.Errors;
using Domain.Results;

namespace Domain.ValueObjects;

public readonly record struct Word
{
    public string Text { get; }
    public Lang Lang { get; }

    internal Word(string text, Lang language)
    {
        Text = text;
        Lang = language;
    }

    public static Result<Word> Create(string text, Lang language) =>
        string.IsNullOrWhiteSpace(text)
        ? Result<Word>.Fail(new(WordErrors.Empty, "Word cannot be empty"))
        : Result<Word>.Ok(new Word(text.Trim().ToLower(), language));

    public override string ToString() => Text;

}
