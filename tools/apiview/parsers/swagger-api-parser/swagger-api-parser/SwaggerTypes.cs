#nullable enable
using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace swagger_api_parser
{
    public class SwaggerSpec
    {
        public string swagger { get; set; }

        public string host { get; set; }

        public List<string> schemes { get; set; }
        public Dictionary<string, Dictionary<string, Operation>> paths { get; set; }
        public Info info { get; set; }

        public Dictionary<string, Parameter> parameters { get; set; }

        [JsonPropertyName("x-ms-paths")] public Dictionary<string, Dictionary<string, Operation>> xMsPaths { get; set; }

        public Dictionary<string, Definition > definitions { get; set; }
    }

    public class Info
    {
        public string title { get; set; }
        public string version { get; set; }
        public string description { get; set; }
        public string termsOfService { get; set; }
    }


    public class Operation
    {
        public string description { get; set; }
        public string operationId { get; set; }

        public List<Parameter> parameters { get; set; }

        public Dictionary<string, Response> responses { get; set; }
    }

    public class Parameter : BaseSchema
    {
        public string name { get; set; }
        public bool required { get; set; }
        public string description { get; set; }

        [JsonPropertyName("in")] public string? In { get; set; }
    }


    public class Response
    {
        public string description { get; set; }
        public Dictionary<string, Header> headers { get; set; }
        public BaseSchema schema { get; set; }

        [JsonExtensionData] public IDictionary<string, object> examples { get; set; }
    }

    public class Header : BaseSchema
    {
    }

    public class Definition : BaseSchema
    {
        
    }


    public class BaseSchema
    {
        public string type { get; set; }
        public string description { get; set; }
        public string format { get; set; }

        public List<BaseSchema> allOf { get; set; }
        public List<BaseSchema> anyOf { get; set; }
        public List<BaseSchema> oneOf { get; set; }

        // public Boolean additionalProperties { get; set; }
        public Boolean readOnly { get; set; }
        public string discriminator { get; set; }
        public Dictionary<string, BaseSchema> properties { get; set; }

        [JsonPropertyName("x-ms-discriminator-value")]
        public string xMsDiscriminatorValue { get; set; }

        public List<string> required { get; set; }


        [JsonPropertyName("$ref")] public string Ref { get; set; }


        // public List<BaseSchema> items { get; set; }
    }
}
