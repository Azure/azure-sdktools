import {
  EnumStatementNode,
  InterfaceStatementNode,
  IntersectionExpressionNode,
  ModelExpressionNode,
  ModelStatementNode,
  OperationStatementNode,
  ProjectionModelExpressionNode,
  SyntaxKind,
} from "@cadl-lang/compiler";
import { NamespaceStack } from "./apiview.js";
import { NamespaceModel } from "./namespace-model.js";

export class ApiViewNavigation {
  Text: string;
  NavigationId: string | undefined;
  ChildItems: ApiViewNavigation[];
  Tags: ApiViewNavigationTag;

  constructor(
    objNode:
      | NamespaceModel
      | ModelStatementNode
      | OperationStatementNode
      | InterfaceStatementNode
      | EnumStatementNode
      | ModelExpressionNode
      | IntersectionExpressionNode
      | ProjectionModelExpressionNode
  ) {
    let obj;
    switch (objNode.kind) {
      case SyntaxKind.NamespaceStatement:
        NamespaceStack.push(objNode.name);
        this.Text = objNode.name;
        this.Tags = { TypeKind: ApiViewNavigationKind.Module };
        const operationItems = new Array<ApiViewNavigation>();
        for (const node of objNode.operations.values()) {
          operationItems.push(new ApiViewNavigation(node));
        }
        const resourceItems = new Array<ApiViewNavigation>();
        for (const node of objNode.resources.values()) {
          resourceItems.push(new ApiViewNavigation(node));
        }
        const modelItems = new Array<ApiViewNavigation>();
        for (const node of objNode.models.values()) {
          modelItems.push(new ApiViewNavigation(node));
        }
        this.ChildItems = [
          { Text: "Operations", ChildItems: operationItems, Tags: { TypeKind: ApiViewNavigationKind.Method }, NavigationId: "" },
          { Text: "Resources", ChildItems: resourceItems, Tags: { TypeKind: ApiViewNavigationKind.Class }, NavigationId: "" },
          { Text: "Models", ChildItems: modelItems, Tags: { TypeKind: ApiViewNavigationKind.Class }, NavigationId: "" },
        ];
        break;
      case SyntaxKind.ModelStatement:
        obj = objNode as ModelStatementNode;
        NamespaceStack.push(obj.id.sv);
        this.Text = obj.id.sv;
        this.Tags = { TypeKind: ApiViewNavigationKind.Class };
        this.ChildItems = [];
        // TODO: Include properties?
        break;
      case SyntaxKind.EnumStatement:
        obj = objNode as EnumStatementNode;
        NamespaceStack.push(obj.id.sv);
        this.Text = obj.id.sv;
        this.Tags = { TypeKind: ApiViewNavigationKind.Enum };
        this.ChildItems = [];
        // TODO: Include members?
        break;
      case SyntaxKind.OperationStatement:
        obj = objNode as OperationStatementNode;
        NamespaceStack.push(obj.id.sv);
        this.Text = obj.id.sv;
        this.Tags = { TypeKind: ApiViewNavigationKind.Method };
        this.ChildItems = [];
        break;
      case SyntaxKind.InterfaceStatement:
        obj = objNode as InterfaceStatementNode;
        NamespaceStack.push(obj.id.sv);
        this.Text = obj.id.sv;
        this.Tags = { TypeKind: ApiViewNavigationKind.Method };
        this.ChildItems = [];
        for (const child of obj.operations) {
          this.ChildItems.push(new ApiViewNavigation(child));
        }
        break;
      case SyntaxKind.ModelExpression:
        throw new Error(`Navigation unsupported for "ModelExpression".`);
      case SyntaxKind.IntersectionExpression:
        throw new Error(`Navigation unsupported for "IntersectionExpression".`);
      case SyntaxKind.ProjectionModelExpression:
        throw new Error(`Navigation unsupported for "ProjectionModelExpression".`);
      default:
        throw new Error(`Navigation unsupported for "${objNode.kind.toString()}".`);
    }
    this.NavigationId = NamespaceStack.value();
    NamespaceStack.pop();
  }
}

export interface ApiViewNavigationTag {
  TypeKind: ApiViewNavigationKind;
}

export const enum ApiViewNavigationKind {
  Class = "class",
  Enum = "enum",
  Method = "method",
  Module = "namespace",
  Package = "assembly",
}
