using System.Threading;
using System.Threading.Tasks;

namespace OneItb.GraphQL.Services.Email
{
    public interface IEmailSender
    {
        Task SendAsync(
            string recipient,
            string subject,
            string body,
            CancellationToken cancellationToken = default);
    }
}
