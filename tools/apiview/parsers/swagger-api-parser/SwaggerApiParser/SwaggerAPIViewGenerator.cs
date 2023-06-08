using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using SwaggerApiParser.Specs;
using SwaggerApiParser.SwaggerApiView;

namespace SwaggerApiParser
{
    public class SwaggerApiViewGenerator
    {
        public static async Task<SwaggerApiViewSpec> GenerateSwaggerApiView(Swagger swaggerSpec, string swaggerFilePath, SchemaCache schemaCache, string packageName = "", string swaggerLink = "")
        {
            SwaggerApiViewSpec ret = new SwaggerApiViewSpec
            {
                SwaggerApiViewGeneral =
                {   
                    swaggerLink = swaggerLink,
                    swagger = swaggerSpec.swagger,
                    info = swaggerSpec.info,
                    host = swaggerSpec.host,
                    basePath = swaggerSpec.basePath,
                    schemes = swaggerSpec.schemes,
                    consumes = swaggerSpec.consumes,
                    produces = swaggerSpec.produces,
                    securityDefinitions = swaggerSpec.securityDefinitions,
                    security = swaggerSpec.security,
                    tags = swaggerSpec.tags,
                    externalDocs = swaggerSpec.externalDocs,
                    patternedObjects = swaggerSpec.patternedObjects,
                    schemaCache = schemaCache,
                    swaggerFilePath = swaggerFilePath
                },
                fileName = Path.GetFileName(swaggerFilePath),
                packageName = packageName
            };

            AddDefinitionsToCache(swaggerSpec, swaggerFilePath, schemaCache);
            //ret.SwaggerApiViewGeneral.xMsParameterizedHost?.ResolveParameters(schemaCache, swaggerFilePath);

            // If swagger doesn't have any path, it's common definition swagger. 
            if (swaggerSpec.paths.Count == 0)
            {
                return null;
            }

            foreach (var (currentPath, apiPath) in swaggerSpec.paths)
            {
                if (apiPath == null)
                {
                    continue;
                }

                foreach (var (method, operation) in apiPath.operations)
                {
                    SwaggerApiViewOperation op = new SwaggerApiViewOperation
                    {
                        operation = operation,
                        method = method,
                        path = currentPath,
                        operationId = operation.operationId,
                        tags = operation.tags,
                        summary = operation.summary,
                        description = operation.description,
                        produces = operation.produces,
                        consumes = operation.consumes,
                        operationIdPrefix = Utils.GetOperationIdPrefix(operation.operationId),
                        operationIdAction = Utils.GetOperationIdAction(operation.operationId),
                        PathParameters = new SwaggerApiViewOperationParameters("PathParameters"),
                        QueryParameters = new SwaggerApiViewOperationParameters("QueryParameters"),
                        BodyParameters = new SwaggerApiViewOperationParameters("BodyParameters"),
                        HeaderParameters = new SwaggerApiViewOperationParameters("HeaderParameters"),
                        Responses = new List<SwaggerApiViewResponse>(),
                    };

                    if (operation.parameters != null)
                    {
                        foreach (var parameter in operation.parameters)
                        {
                            var param = parameter;
                            var referenceSwaggerFilePath = swaggerFilePath;

                            // Resolve Parameter from multilevel reference 
                            if (parameter.IsRefObject())
                            {
                                param = (Parameter)swaggerSpec.ResolveRefObj(parameter.@ref);
                                if (param == null)
                                {
                                    param = (Parameter)schemaCache.GetParameterFromCache(parameter.@ref, swaggerFilePath);
                                }

                                if (param == null)
                                {
                                    var referencePath = parameter.@ref;
                                    do
                                    {
                                        if (!Path.IsPathFullyQualified(referencePath))
                                        {
                                            referenceSwaggerFilePath = Utils.GetReferencedSwaggerFile(referencePath, referenceSwaggerFilePath);
                                            var referenceSwaggerSpec = await SwaggerDeserializer.Deserialize(referenceSwaggerFilePath);
                                            AddDefinitionsToCache(referenceSwaggerSpec, referenceSwaggerFilePath, schemaCache);
                                            param = schemaCache.GetParameterFromCache(referencePath, referenceSwaggerFilePath, false);
                                        }
                                        else
                                        {
                                            var referenceSwaggerSpec = await SwaggerDeserializer.Deserialize(referencePath);
                                            AddDefinitionsToCache(referenceSwaggerSpec, referencePath, schemaCache);
                                            param = schemaCache.GetParameterFromCache(referencePath, referencePath, false);
                                        }

                                        if (param != null && param.IsRefObject())
                                            referencePath = param.@ref;
                                    }
                                    while (param != null && param.IsRefObject());
                                }
                            }

                            var swaggerApiViewOperationParameter = new SwaggerApiViewParameter
                            {
                                name = param.name,
                                @in = param.@in,
                                description = param.description,
                                required = param.required,
                                schema = schemaCache.GetResolvedSchema(param.schema, referenceSwaggerFilePath),
                                format = param.format,
                                @ref = param.@ref,
                                type = param.type
                            };

                            switch (param.@in)
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
                                case "header":
                                    op.HeaderParameters.Add(swaggerApiViewOperationParameter);
                                    break;
                            }
                        }
                    }


                    foreach (var (statusCode, response) in operation.responses)
                    {
                        var resp = response;
                        var referenceSwaggerFilePath = swaggerFilePath;

                        if (response.IsRefObject())
                        {
                            resp = (Response)swaggerSpec.ResolveRefObj(response.@ref);
                            if (resp == null)
                            {
                                resp = (Response)schemaCache.GetResponseFromCache(response.@ref, swaggerFilePath);
                            }

                            if (resp == null)
                            {
                                var referencePath = response.@ref;
                                do
                                {
                                    if (!Path.IsPathFullyQualified(referencePath))
                                    {
                                        referenceSwaggerFilePath = Utils.GetReferencedSwaggerFile(referencePath, swaggerFilePath);
                                        var referenceSwaggerSpec = await SwaggerDeserializer.Deserialize(referenceSwaggerFilePath);
                                        AddDefinitionsToCache(referenceSwaggerSpec, referenceSwaggerFilePath, schemaCache);
                                        resp = schemaCache.GetResponseFromCache(referencePath, referenceSwaggerFilePath, false);
                                    }
                                    else
                                    {
                                        var referenceSwaggerSpec = await SwaggerDeserializer.Deserialize(referencePath);
                                        AddDefinitionsToCache(referenceSwaggerSpec, referencePath, schemaCache);
                                        resp = schemaCache.GetResponseFromCache(referencePath, referencePath, false);
                                    }

                                    if (resp != null && resp.IsRefObject())
                                        referencePath = resp.@ref;
                                }
                                while (resp != null && resp.IsRefObject());
                            }
                        }

                        var schema = resp.schema;

                        //Resolve ref obj for response schema.

                        if (schema != null)
                        {
                            if (schema.IsRefObject())
                            {
                                var referencePath = schema.@ref;
                                do
                                {
                                    referenceSwaggerFilePath = Utils.GetReferencedSwaggerFile(referencePath, referenceSwaggerFilePath);
                                    var referenceSwaggerSpec = await SwaggerDeserializer.Deserialize(referenceSwaggerFilePath);
                                    AddDefinitionsToCache(referenceSwaggerSpec, referenceSwaggerFilePath, schemaCache);
                                    schema = schemaCache.GetSchemaFromCache(referencePath, referenceSwaggerFilePath, false);
                                }
                                while (schema != null && schema.IsRefObject());
                            }
                            else 
                            {
                                LinkedList<string> refChain = new LinkedList<string>();
                                // The initial refChain is the root level schema.
                                // There are some scenarios that the property of the root level schema is a ref to the root level itself (circular reference).
                                // Like "errorDetail" schema in common types.
                                schema = schemaCache.GetResolvedSchema(schema, referenceSwaggerFilePath, refChain);
                            }
                        }

                        var headers = response.headers ?? new Dictionary<string, Header>();

                        op.Responses.Add(new SwaggerApiViewResponse() { description = response.description, statusCode = statusCode, schema = schema, headers = headers });
                    }

                    ret.Paths.AddSwaggerApiViewOperation(op);
                }
            }

            if (swaggerSpec.definitions != null)
            {
                foreach (var definition in swaggerSpec.definitions)
                {
                    ret.SwaggerApiViewDefinitions.Add(definition.Key, definition.Value);
                }
            }

            if (swaggerSpec.parameters != null)
            {
                foreach (var (key, value) in swaggerSpec.parameters)
                {
                    var param = value;
                    var swaggerApiViewParameter = new SwaggerApiViewParameter
                    {
                        description = param.description,
                        name = param.name,
                        required = param.required,
                        format = param.format,
                        @in = param.@in,
                        schema = schemaCache.GetResolvedSchema(param.schema, swaggerFilePath),
                        @ref = param.@ref,
                        type = param.type
                    };
                    ret.SwaggerApiViewGlobalParameters.Add(key, swaggerApiViewParameter);
                }
            }

            ret.Paths.SortByMethod();
            return ret;
        }

        public static void AddDefinitionsToCache(Swagger swaggerSpec, string swaggerFilePath, SchemaCache schemaCache)
        {
            var fullPath = Path.GetFullPath(swaggerFilePath);
            if (swaggerSpec.definitions != null)
            {
                foreach (var definition in swaggerSpec.definitions)
                {
                    if (!schemaCache.Cache.ContainsKey(definition.Key))
                    {
                        schemaCache.AddSchema(fullPath, definition.Key, definition.Value);
                    }
                }
            }


            if (swaggerSpec.parameters != null)
            {
                foreach (var parameter in swaggerSpec.parameters)
                {
                    if (!schemaCache.ParametersCache.ContainsKey(parameter.Key))
                    {
                        schemaCache.AddParameter(fullPath, parameter.Key, parameter.Value);
                    }
                }
            }

            if (swaggerSpec.responses != null)
            {
                foreach (var response in swaggerSpec.responses)
                {
                    if (!schemaCache.ResponsesCache.ContainsKey(response.Key))
                    {
                        schemaCache.AddResponse(fullPath, response.Key, response.Value);
                    }
                }
            }
        }
    }
}
