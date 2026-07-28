using System.Text;

namespace Services.Pagination
{
    internal static class OffsetCursor
    {
        private const string Prefix = "offset:";

        public static string Encode(int offset)
        {
            return Convert.ToBase64String(Encoding.UTF8.GetBytes($"{Prefix}{offset}"));
        }

        public static int Decode(string? cursor)
        {
            if (string.IsNullOrWhiteSpace(cursor))
                return 0;

            try
            {
                string decoded = Encoding.UTF8.GetString(Convert.FromBase64String(cursor));
                if (!decoded.StartsWith(Prefix, StringComparison.Ordinal) ||
                    !int.TryParse(decoded[Prefix.Length..], out int offset) ||
                    offset < 0)
                {
                    throw new FormatException();
                }

                return offset;
            }
            catch (FormatException)
            {
                throw new InvalidOperationException("Cursor de paginacion invalido.");
            }
        }
    }
}
