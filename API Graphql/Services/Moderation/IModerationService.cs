using System;
using System.Threading.Tasks;

namespace OneITB.Core.Services.Interfaces
{
    public interface IModerationService
    {
        Task<bool> ReportContentAsync(Guid reporterId, string contentId, string contentType, string reason);
    }
}
