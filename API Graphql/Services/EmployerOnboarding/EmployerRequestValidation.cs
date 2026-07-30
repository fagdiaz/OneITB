using System;
using System.Globalization;
using System.Linq;
using System.Text.RegularExpressions;
using OneITB.Core.Services.Interfaces;

namespace Services.EmployerOnboarding
{
    public sealed record NormalizedEmployerRequest(
        string CompanyName,
        string ContactName,
        string Email,
        string Phone,
        string TaxId,
        string? Comments);

    public static class EmployerRequestValidation
    {
        private static readonly Regex EmailRegex = new(
            @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
            RegexOptions.Compiled | RegexOptions.CultureInvariant,
            TimeSpan.FromMilliseconds(250));

        private static readonly TextInfo SpanishTextInfo =
            new CultureInfo("es-AR", false).TextInfo;

        public static NormalizedEmployerRequest Normalize(EmployerRequestInput input)
        {
            ArgumentNullException.ThrowIfNull(input);

            if (!input.PrivacyConsent)
            {
                throw new EmployerRequestException(
                    "EMPLOYER_REQUEST_CONSENT_REQUIRED",
                    "Debes aceptar el tratamiento de datos para enviar la solicitud.");
            }

            string companyName = NormalizeText(input.CompanyName, 2, 160, "empresa", false);
            string contactName = NormalizeText(input.ContactName, 2, 160, "contacto", true);
            string email = NormalizeEmail(input.Email);
            string phone = NormalizePhone(input.Phone);
            string taxId = NormalizeTaxId(input.TaxId);
            string? comments = NormalizeOptionalText(input.Comments, 1500);

            return new NormalizedEmployerRequest(
                companyName,
                contactName,
                email,
                phone,
                taxId,
                comments);
        }

        public static string NormalizeEmail(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Length > 256)
                throw InvalidField("email");

            string normalized = value.Trim().ToLowerInvariant();
            if (!EmailRegex.IsMatch(normalized))
                throw InvalidField("email");

            return normalized;
        }

        public static string NormalizeTaxId(string value)
        {
            string digits = new((value ?? string.Empty).Where(char.IsDigit).ToArray());
            if (digits.Length != 11 || !HasValidCuitChecksum(digits))
            {
                throw new EmployerRequestException(
                    "EMPLOYER_REQUEST_INVALID_TAX_ID",
                    "El CUIT ingresado no es válido.");
            }

            return digits;
        }

        private static bool HasValidCuitChecksum(string digits)
        {
            ReadOnlySpan<int> weights = stackalloc[] { 5, 4, 3, 2, 7, 6, 5, 4, 3, 2 };
            int sum = 0;
            for (int index = 0; index < weights.Length; index++)
                sum += (digits[index] - '0') * weights[index];

            int verifier = 11 - (sum % 11);
            verifier = verifier switch
            {
                11 => 0,
                10 => 9,
                _ => verifier
            };

            return verifier == digits[10] - '0';
        }

        private static string NormalizePhone(string value)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Length > 50)
                throw InvalidField("teléfono");

            bool hasLeadingPlus = value.TrimStart().StartsWith('+');
            string digits = new(value.Where(char.IsDigit).ToArray());
            if (digits.Length is < 7 or > 20)
                throw InvalidField("teléfono");

            return hasLeadingPlus ? $"+{digits}" : digits;
        }

        private static string NormalizeText(
            string value,
            int minimumLength,
            int maximumLength,
            string field,
            bool titleCase)
        {
            if (string.IsNullOrWhiteSpace(value) || value.Length > maximumLength)
                throw InvalidField(field);

            string collapsed = string.Join(
                ' ',
                value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
            if (collapsed.Length < minimumLength)
                throw InvalidField(field);

            return titleCase
                ? SpanishTextInfo.ToTitleCase(collapsed.ToLowerInvariant())
                : collapsed;
        }

        private static string? NormalizeOptionalText(string? value, int maximumLength)
        {
            if (string.IsNullOrWhiteSpace(value))
                return null;

            if (value.Length > maximumLength)
            {
                throw new EmployerRequestException(
                    "EMPLOYER_REQUEST_INVALID_INPUT",
                    $"Los comentarios no pueden superar {maximumLength} caracteres.");
            }

            return string.Join(
                ' ',
                value.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries));
        }

        private static EmployerRequestException InvalidField(string field)
        {
            return new EmployerRequestException(
                "EMPLOYER_REQUEST_INVALID_INPUT",
                $"El campo {field} no tiene un formato válido.");
        }
    }
}
