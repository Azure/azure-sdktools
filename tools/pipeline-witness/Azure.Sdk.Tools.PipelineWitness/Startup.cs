﻿using Azure.Sdk.Tools.PipelineWitness;
using Azure.Sdk.Tools.PipelineWitness.Records;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Text;

[assembly: FunctionsStartup(typeof(Startup))]

namespace Azure.Sdk.Tools.PipelineWitness
{
    public class Startup : FunctionsStartup
    {
        public override void Configure(IFunctionsHostBuilder builder)
        {
            builder.Services.AddSingleton<IRecordStore, RecordStore>();
            builder.Services.AddSingleton<IRecordHandler<RunStateChangedEventRecord>, RunStateChangedEventRecordHandler>();
        }
    }
}
