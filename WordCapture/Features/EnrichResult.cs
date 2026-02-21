namespace Features;

public record EnrichResult(
    string Word,
    string Translation,
    string Transcription,
    string Tag,
    string Context
);
