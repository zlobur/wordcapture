namespace Domain.Results;

public sealed record class PagedResult<T>(
    IReadOnlyList<T> Items,
    int TotalCount,
    int Offset,
    int Limit);
