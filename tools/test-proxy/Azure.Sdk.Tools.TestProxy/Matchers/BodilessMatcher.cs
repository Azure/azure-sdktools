﻿using Azure.Sdk.Tools.TestProxy.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Azure.Sdk.Tools.TestProxy.Transforms
{
    public class BodilessMatcher : RecordMatcher
    {
        public BodilessMatcher() : base(true) { }
    }
}
