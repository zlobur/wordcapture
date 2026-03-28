namespace Domain.Results;

public abstract record class Result<T>
{
    public sealed record Success(T Value) : Result<T>;
    public sealed record Error(string Code, string Message) : Result<T>;
    public sealed record NotFound(string Message) : Result<T>;
}
