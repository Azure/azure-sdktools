using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Azure.Sdk.Tools.Assets.MaintenanceTool.Model
{
    public class RepoConfiguration
    {
        public RepoConfiguration(string repo) { 
            Repo = repo;
        }

        public string Repo { get; set; }

        public DateTime ScanStartDate { get; set; } = DateTime.Parse("2022-12-01");

        public List<string> Branches { get; set; } = new List<string> { "main" };
    }
}
