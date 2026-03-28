using Domain.Errors;
using Domain.Results;

namespace Domain.ValueObjects;

public record Word
{
    public string Text { get; }
    public Lang Lang { get; }

    private Word(string text, Lang language)
    {
        Text = text;
        Lang = language;
    }

    public static Result<Word> Create(string text, Lang language) =>
        string.IsNullOrWhiteSpace(text)
        ? new Result<Word>.Error(WordErrors.Empty, "Word cannot be empty")
        : new Result<Word>.Success(new Word(text.Trim().ToLower(), language));

    public override string ToString() => Text;

}
// public record Word(string text, Lang language);
