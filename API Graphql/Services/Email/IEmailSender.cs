using System.Threading;
using System.Threading.Tasks;

namespace OneITB.Core.Services.Interfaces
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
