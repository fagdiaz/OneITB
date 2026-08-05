namespace OneItb.GraphQL.Services.Storage
{
    public sealed class FileStorageUnavailableException : Exception
    {
        public FileStorageUnavailableException(string message)
            : base(message)
        {
        }

        public FileStorageUnavailableException(string message, Exception innerException)
            : base(message, innerException)
        {
        }
    }
}
