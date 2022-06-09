using System.Collections.Generic;

namespace SwaggerApiParser
{
    public class SwaggerApiViewGenerator
    {
        public static SwaggerApiViewSpec GenerateSwaggerApiView(SwaggerSpec swaggerSpec, string fileName = "swagger.json", string packageName = "")
        {
            SwaggerApiViewSpec ret = new SwaggerApiViewSpec
            {
                SwaggerApiViewGeneral =
                {
                    info = swaggerSpec.info,
                    swagger = swaggerSpec.swagger,
                    host = swaggerSpec.host,
                    schemes = swaggerSpec.schemes,
                    consumes = swaggerSpec.consumes,
                    produces = swaggerSpec.produces
                },
                fileName = fileName,
                packageName = packageName
            };

            SchemaCache schemaCache = new SchemaCache();
            foreach (var definition in swaggerSpec.definitions)
            {
                if (!schemaCache.Cache.ContainsKey(definition.Key))
                {
                    schemaCache.Cache.TryAdd(definition.Key, definition.Value);
                }
            }

            foreach (var (currentPath, operations) in swaggerSpec.paths)
            {
                foreach (var (key, value) in operations)
                {
                    SwaggerApiViewOperation op = new SwaggerApiViewOperation
                    {
                        operation = value,
                        method = key,
                        path = currentPath,
                        operationId = value.operationId,
                        description = value.description,
                        operationIdPrefix = Utils.GetOperationIdPrefix(value.operationId),
                        operationIdAction = Utils.GetOperationIdAction(value.operationId),
                        PathParameters = new SwaggerApiViewOperationParameters("PathParameters"),
                        QueryParameters = new SwaggerApiViewOperationParameters("QueryParameters"),
                        BodyParameters = new SwaggerApiViewOperationParameters("BodyParameters"),
                        Responses = new List<SwaggerApiViewResponse>(),
                        xMsLongRunningOperation = value.xMsLongRunningOperaion
                    };
                    foreach (var parameter in value.parameters)
                    {
                        var param = parameter;
                        if (parameter.IsRefObject())
                        {
                            param = (Parameter)swaggerSpec.ResolveRefObj(parameter.Ref);
                        }

                        var swaggerApiViewOperationParameter = new SwaggerApiViewParameter
                        {
                            description = param.description,
                            name = param.name,
                            required = param.required,
                            In = param.In,
                            schema = schemaCache.GetResolvedSchema(param.schema),
                            Ref = param.Ref,
                            type = param.type
                        };


                        switch (param.In)
                        {
                            case "path":
                                op.PathParameters.Add(swaggerApiViewOperationParameter);
                                break;
                            case "query":
                                op.QueryParameters.Add(swaggerApiViewOperationParameter);
                                break;
                            case "body":
                                op.BodyParameters.Add(swaggerApiViewOperationParameter);
                                break;
                        }
                    }

                    foreach (var (statusCode, response) in value.responses)
                    {
                        var schema = response.schema;

                        //Resolve ref obj for response schema.
                        if (response.schema != null)
                        {
                            schema = schemaCache.GetResolvedSchema(schema);
                        }

                        op.Responses.Add(new SwaggerApiViewResponse() {description = response.description, statusCode = statusCode, schema = schema});
                    }

                    ret.Paths.AddSwaggerApiViewOperation(op);
                }
            }

            ret.Paths.SortByMethod();
            return ret;
        }
    }
}
