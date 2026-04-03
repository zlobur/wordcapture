namespace Domain.Results;

public readonly record struct Result<T>
{
    public T Value { get; }
    public Error Error { get; }
    public bool IsSuccess { get; }

    private Result(T value, Error error, bool isSuccess)
    {
        this.Value = value;
        this.Error = error;
        this.IsSuccess = isSuccess;
    }

    public static Result<T> Ok(T value)
    {
        var result = new Result<T>(value, default!, true);

        return result;
    }

    public static Result<T> Fail(Error error)
    {
        var result = new Result<T>(default!, error, false);

        return result;
    }

    public Result<U> Map<U>(Func<T, U> func)
    {
        if (this.IsSuccess)
        {
            U newValue = func(this.Value);
            return Result<U>.Ok(newValue);
        }
        else
        {
            return Result<U>.Fail(Error);
        }
    }

    public Result<U> Bind<U>(Func<T, Result<U>> func)
    {
        return this.IsSuccess ? func(this.Value) : Result<U>.Fail(Error);
    }
}

public record Error(string Code, string Message);
