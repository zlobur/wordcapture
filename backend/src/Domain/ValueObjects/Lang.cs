using Domain.Errors;
using Domain.Results;

namespace Domain.ValueObjects;

public readonly record struct Lang
{
    public string Code { get; }

    internal Lang(string code)
    {
        Code = code;
    }

    public static Result<Lang> Create(string code) =>
        code is not { Length: 2 }
            ? Result<Lang>.Fail(new(LangErrors.InvalidCode, "ISO 639-1 required"))
            : Result<Lang>.Ok(new Lang(code.ToLowerInvariant()));

    public override string ToString() => Code;
}
