using System;
using System.ComponentModel.DataAnnotations;

namespace Infrastructure.Mongo;

public sealed class MongoDbSettings
{
    [Required]
    public required string ConnectionString { get; init; }

    [Required]
    public required string DatabaseName { get; init; }
}
