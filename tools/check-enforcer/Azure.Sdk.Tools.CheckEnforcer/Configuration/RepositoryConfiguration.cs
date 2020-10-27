﻿using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Text;
using YamlDotNet.Serialization;

namespace Azure.Sdk.Tools.CheckEnforcer.Configuration
{
    public class RepositoryConfiguration : IRepositoryConfiguration
    {
        public RepositoryConfiguration()
        {
            MinimumCheckRuns = 1;
            IsEnabled = true;
            TimeoutInMinutes = 5;
        }

        [YamlMember(Alias = "minimumCheckRuns")]
        public uint MinimumCheckRuns { get; internal set; }

        [YamlMember(Alias = "enabled")]
        public bool IsEnabled { get; internal set; }

        [YamlMember(Alias = "format")]
        public string Format { get; internal set; }

        [YamlMember(Alias = "timeout")]
        public uint TimeoutInMinutes { get; internal set; }

        public override string ToString()
        {
            var json = JsonConvert.SerializeObject(this);
            return json;
        }
    }
}
