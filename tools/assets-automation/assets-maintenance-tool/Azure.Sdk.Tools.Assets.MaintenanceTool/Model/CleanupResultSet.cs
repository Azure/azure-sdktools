using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Azure.Sdk.Tools.Assets.MaintenanceTool.Model
{
    public class CleanupResultSet
    {
        public List<BackupResult> Results { get; set; } = new List<BackupResult>();
    }
}
