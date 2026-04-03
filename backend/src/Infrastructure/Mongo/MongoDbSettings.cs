using System;
using System.ComponentModel.DataAnnotations;

namespace Infrastructure.Mongo;

public sealed class MongoDbSettings
{
    public const string SectionName = "MongoDb";

    [Required]
    public required string ConnectionString { get; init; }

    [Required]
    public required string DatabaseName { get; init; }
}
