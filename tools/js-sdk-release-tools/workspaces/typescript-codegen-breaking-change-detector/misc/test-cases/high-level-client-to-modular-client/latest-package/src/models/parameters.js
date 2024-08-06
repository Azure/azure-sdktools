"use strict";
/*
 * Copyright (c) Microsoft Corporation.
 * Licensed under the MIT License.
 *
 * Code generated by Microsoft (R) AutoRest Code Generator.
 * Changes may cause incorrect behavior and will be lost if the code is regenerated.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.body5 = exports.properties1 = exports.resource1 = exports.dataTypeName = exports.body4 = exports.body3 = exports.body2 = exports.body1 = exports.body = exports.properties = exports.resource = exports.contentType = exports.dataProductName = exports.resourceGroupName = exports.subscriptionId = exports.nextLink = exports.apiVersion = exports.$host = exports.accept = void 0;
const mappers_1 = require("../models/mappers");
exports.accept = {
    parameterPath: "accept",
    mapper: {
        defaultValue: "application/json",
        isConstant: true,
        serializedName: "Accept",
        type: {
            name: "String"
        }
    }
};
exports.$host = {
    parameterPath: "$host",
    mapper: {
        serializedName: "$host",
        required: true,
        type: {
            name: "String"
        }
    },
    skipEncoding: true
};
exports.apiVersion = {
    parameterPath: "apiVersion",
    mapper: {
        defaultValue: "2023-11-15",
        isConstant: true,
        serializedName: "api-version",
        type: {
            name: "String"
        }
    }
};
exports.nextLink = {
    parameterPath: "nextLink",
    mapper: {
        serializedName: "nextLink",
        required: true,
        type: {
            name: "String"
        }
    },
    skipEncoding: true
};
exports.subscriptionId = {
    parameterPath: "subscriptionId",
    mapper: {
        constraints: {
            MinLength: 1
        },
        serializedName: "subscriptionId",
        required: true,
        type: {
            name: "String"
        }
    }
};
exports.resourceGroupName = {
    parameterPath: "resourceGroupName",
    mapper: {
        constraints: {
            MaxLength: 90,
            MinLength: 1
        },
        serializedName: "resourceGroupName",
        required: true,
        type: {
            name: "String"
        }
    }
};
exports.dataProductName = {
    parameterPath: "dataProductName",
    mapper: {
        constraints: {
            Pattern: new RegExp("^[a-z][a-z0-9]*$"),
            MaxLength: 63,
            MinLength: 3
        },
        serializedName: "dataProductName",
        required: true,
        type: {
            name: "String"
        }
    }
};
exports.contentType = {
    parameterPath: ["options", "contentType"],
    mapper: {
        defaultValue: "application/json",
        isConstant: true,
        serializedName: "Content-Type",
        type: {
            name: "String"
        }
    }
};
exports.resource = {
    parameterPath: "resource",
    mapper: mappers_1.DataProduct
};
exports.properties = {
    parameterPath: "properties",
    mapper: mappers_1.DataProductUpdate
};
exports.body = {
    parameterPath: "body",
    mapper: mappers_1.RoleAssignmentCommonProperties
};
exports.body1 = {
    parameterPath: "body",
    mapper: mappers_1.AccountSas
};
exports.body2 = {
    parameterPath: "body",
    mapper: {
        serializedName: "body",
        required: true,
        type: {
            name: "Dictionary",
            value: { type: { name: "any" } }
        }
    }
};
exports.body3 = {
    parameterPath: "body",
    mapper: mappers_1.RoleAssignmentDetail
};
exports.body4 = {
    parameterPath: "body",
    mapper: mappers_1.KeyVaultInfo
};
exports.dataTypeName = {
    parameterPath: "dataTypeName",
    mapper: {
        constraints: {
            Pattern: new RegExp("^[a-z][a-z0-9-]*$"),
            MaxLength: 63,
            MinLength: 3
        },
        serializedName: "dataTypeName",
        required: true,
        type: {
            name: "String"
        }
    }
};
exports.resource1 = {
    parameterPath: "resource",
    mapper: mappers_1.DataType
};
exports.properties1 = {
    parameterPath: "properties",
    mapper: mappers_1.DataTypeUpdate
};
exports.body5 = {
    parameterPath: "body",
    mapper: mappers_1.ContainerSaS
};
//# sourceMappingURL=parameters.js.map