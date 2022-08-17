using System;
using System.Threading;
using System.Threading.Tasks;

namespace Azure.Sdk.Tools.PipelineWitness.Services.WorkTokens
{
    internal interface IAsyncLockProvider
    {
        Task<IAsyncLock> GetLockAsync(string id, TimeSpan duration, CancellationToken cancellationToken);
    }
}
