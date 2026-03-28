using Domain.Errors;
using Domain.Results;

namespace Domain.ValueObjects;

public record class Lang
{
    public string Code { get; }

    private Lang(string code) => Code = code;
    public static Result<Lang> Create(string code) =>
        code is not { Length: 2 }
            ? new Result<Lang>.Error(LangErrors.InvalidCode, "ISO 639-1 required")
            : new Result<Lang>.Success(new Lang(code.ToLowerInvariant()));

    public override string ToString() => Code;
}
