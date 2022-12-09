﻿using System.Collections.Generic;

namespace Azure.Sdk.Tools.PerfAutomation.Models
{
    public class LanguageServiceTestInfo
    {
        public string Test { get; set; }
        public string Class { get; set; }
        public IEnumerable<string> Arguments { get; set; }
    }
}
