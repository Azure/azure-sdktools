using System.Text.Json.Serialization;

namespace SwaggerApiParser.Specs
{
    public class Parameter : IBaseReference, ITokenSerializable
    {
        public string name { get; set; }
        [JsonPropertyName("in")]
        public string @in { get; set; }
        public string description { get; set; }
        public bool required { get; set; }
        public BaseSchema schema { get; set; }
        public string type { get; set; }
        public string format { get; set; }

        

        [JsonPropertyName("x-ms-parameter-location")]
        public string xMsParameterLocation { get; set; }

        [JsonPropertyName("x-ms-skip-url-encoding")]
        public bool xMsSkipUrlEncoding { get; set; }

        [JsonPropertyName("x-ms-parameter-grouping")]
        public XMSParameterGrouping XmsParameterGrouping { get; set; }


        [JsonPropertyName("$ref")] public string Ref { get; set; }

        

        public bool IsRefObject()
        {
            return this.Ref != null;
        }

        public CodeFileToken[] TokenSerialize(SerializeContext context)
        {
            return TokenSerializer.TokenSerialize(this, context);
        }
    }

    public class XMSParameterGrouping
    {
        public string name { get; set; }
        public string postfix { get; set; }
    }
}
