import {
  AliasStatementNode,
  ArrayExpressionNode,
  AugmentDecoratorStatementNode,
  BaseNode,
  BooleanLiteralNode,
  DecoratorExpressionNode,
  DirectiveExpressionNode,
  EnumMemberNode,
  EnumSpreadMemberNode,
  EnumStatementNode,
  Expression,
  getNamespaceFullName,
  getSourceLocation,
  IdentifierNode,
  InterfaceStatementNode,
  IntersectionExpressionNode,
  MemberExpressionNode,
  ModelExpressionNode,
  ModelPropertyNode,
  ModelSpreadPropertyNode,
  ModelStatementNode,
  Namespace,
  navigateProgram,
  NumericLiteralNode,
  OperationSignatureDeclarationNode,
  OperationSignatureReferenceNode,
  OperationStatementNode,
  Program,
  ScalarStatementNode,
  StringLiteralNode,
  StringTemplateExpressionNode,
  StringTemplateHeadNode,
  StringTemplateSpanNode,
  SyntaxKind,
  TemplateArgumentNode,
  TemplateParameterDeclarationNode,
  TupleExpressionNode,
  TypeReferenceNode,
  UnionExpressionNode,
  UnionStatementNode,
  UnionVariantNode,
  ValueOfExpressionNode,
} from "@typespec/compiler";
import { ApiViewDiagnostic, ApiViewDiagnosticLevel } from "./diagnostic.js";
import { ApiViewNavigation } from "./navigation.js";
import { generateId, NamespaceModel } from "./namespace-model.js";
import { LIB_VERSION } from "./version.js";

const WHITESPACE = " ";

export const enum ApiViewTokenKind {
  Text = 0,
  Newline = 1,
  Whitespace = 2,
  Punctuation = 3,
  Keyword = 4,
  LineIdMarker = 5, // use this if there are no visible tokens with ID on the line but you still want to be able to leave a comment for it
  TypeName = 6,
  MemberName = 7,
  StringLiteral = 8,
  Literal = 9,
  Comment = 10,
  DocumentRangeStart = 11,
  DocumentRangeEnd = 12,
  DeprecatedRangeStart = 13,
  DeprecatedRangeEnd = 14,
  SkipDiffRangeStart = 15,
  SkipDiffRangeEnd = 16
}

export interface ApiViewToken {
  Kind: ApiViewTokenKind;
  Value?: string;
  DefinitionId?: string;
  NavigateToId?: string;
  CrossLanguageDefinitionId?: string;
}

export interface ApiViewDocument {
  Name: string;
  PackageName: string;
  Tokens: ApiViewToken[];
  Navigation: ApiViewNavigation[];
  Diagnostics: ApiViewDiagnostic[];
  VersionString: string;
  Language: string;
  CrossLanguagePackageId: string | undefined;
}

export class ApiView {
  name: string;
  packageName: string;
  crossLanguagePackageId: string | undefined;
  tokens: ApiViewToken[] = [];
  navigationItems: ApiViewNavigation[] = [];
  diagnostics: ApiViewDiagnostic[] = [];
  versionString: string;

  indentString: string = "";
  indentSize: number = 2;
  namespaceStack = new NamespaceStack();
  typeDeclarations = new Set<string>();
  includeGlobalNamespace: boolean;

  constructor(name: string, packageName: string, versionString?: string, includeGlobalNamespace?: boolean) {
    this.name = name;
    this.packageName = packageName;
    this.versionString = versionString ?? "";
    this.includeGlobalNamespace = includeGlobalNamespace ?? false;
    this.crossLanguagePackageId = packageName;
    this.emitHeader();
  }

  token(kind: ApiViewTokenKind, value?: string, lineId?: string, navigateToId?: string) {
    this.tokens.push({
      Kind: kind,
      Value: value,
      DefinitionId: lineId,
      NavigateToId: navigateToId,
    });
  }

  indent() {
    this.trim();
    this.indentString = WHITESPACE.repeat(this.indentString.length + this.indentSize);
    if (this.indentString.length) {
      this.tokens.push({ Kind: ApiViewTokenKind.Whitespace, Value: this.indentString });
    }
  }

  deindent() {
    this.trim();
    this.indentString = WHITESPACE.repeat(this.indentString.length - this.indentSize);
    if (this.indentString.length) {
      this.tokens.push({ Kind: ApiViewTokenKind.Whitespace, Value: this.indentString });
    }
  }

  trim() {
    let last = this.tokens[this.tokens.length - 1]
    while (last) {
      if (last.Kind === ApiViewTokenKind.Whitespace) {
        this.tokens.pop();
        last = this.tokens[this.tokens.length - 1];
      } else {
        return;
      }
    }
  }

  beginGroup() {
    this.punctuation("{", true, false);
    this.blankLines(0);
    this.indent();
  }

  endGroup() {
    this.blankLines(0);
    this.deindent();
    this.punctuation("}");
  }

  whitespace(count: number = 1) {
    this.tokens.push({
      Kind: ApiViewTokenKind.Whitespace,
      Value: WHITESPACE.repeat(count),
    });
  }

  space() {
    if (this.tokens[this.tokens.length - 1]?.Kind !== ApiViewTokenKind.Whitespace) {
      this.tokens.push({
        Kind: ApiViewTokenKind.Whitespace,
        Value: WHITESPACE,
      });
    }
  }

  newline() {
    this.trim();
    this.tokens.push({
      Kind: ApiViewTokenKind.Newline,
    });
    if (this.indentString.length) {
      this.tokens.push({ Kind: ApiViewTokenKind.Whitespace, Value: this.indentString });
    }
  }

  blankLines(count: number) {
    // count the number of trailing newlines (ignoring indent whitespace)
    let newlineCount: number = 0;
    for (let i = this.tokens.length; i > 0; i--) {
      const token = this.tokens[i - 1];
      if (token.Kind === ApiViewTokenKind.Newline) {
        newlineCount++;
      } else if (token.Kind === ApiViewTokenKind.Whitespace) {
        continue;
      } else {
        break;
      }
    }
    if (newlineCount < count + 1) {
      // if there aren't new enough newlines, add some
      const toAdd = count + 1 - newlineCount;
      for (let i = 0; i < toAdd; i++) {
        this.newline();
      }
    } else if (newlineCount > count + 1) {
      // if there are too many newlines, remove some
      let toRemove = newlineCount - (count + 1);
      while (toRemove) {
        const popped = this.tokens.pop();
        if (popped?.Kind === ApiViewTokenKind.Newline) {
          toRemove--;
        }
      }
    }
  }

  punctuation(value: string, prefixSpace: boolean = false, postfixSpace: boolean = false) {
    if (prefixSpace) {
      this.space();
    }
    this.tokens.push({
      Kind: ApiViewTokenKind.Punctuation,
      Value: value,
    });
    if (postfixSpace) {
      this.space();
    }
  }

  lineMarker(addCrossLanguageId: boolean = false) {
    const token = {
      Kind: ApiViewTokenKind.LineIdMarker,
      DefinitionId: this.namespaceStack.value(),
      CrossLanguageDefinitionId: addCrossLanguageId ? this.namespaceStack.value() : undefined,
    };
    this.tokens.push(token);
  }

  text(text: string) {
    const token = {
      Kind: ApiViewTokenKind.Text,
      Value: text,
    };
    this.tokens.push(token);
  }

  keyword(keyword: string, prefixSpace: boolean = false, postfixSpace: boolean = false) {
    if (prefixSpace) {
      this.space();
    }
    this.tokens.push({
      Kind: ApiViewTokenKind.Keyword,
      Value: keyword,
    });
    if (postfixSpace) {
      this.space();
    }
  }

  typeDeclaration(typeName: string, typeId: string | undefined, addCrossLanguageId: boolean) {
    if (typeId) {
      if (this.typeDeclarations.has(typeId)) {
        throw new Error(`Duplication ID "${typeId}" for declaration will result in bugs.`);
      }
      this.typeDeclarations.add(typeId);
    }
    this.tokens.push({
      Kind: ApiViewTokenKind.TypeName,
      DefinitionId: typeId,
      Value: typeName,
      CrossLanguageDefinitionId: addCrossLanguageId ? typeId : undefined,
    });
  }

  typeReference(typeName: string, targetId?: string) {
    this.tokens.push({
      Kind: ApiViewTokenKind.TypeName,
      Value: typeName,
      NavigateToId: targetId ?? "__MISSING__",
    });
  }

  member(name: string) {
    this.tokens.push({
      Kind: ApiViewTokenKind.MemberName,
      Value: name,
    });
  }

  stringLiteral(value: string) {
    const lines = value.split("\n");
    if (lines.length === 1) {
      this.tokens.push({
        Kind: ApiViewTokenKind.StringLiteral,
        Value: `\u0022${value}\u0022`,
      });  
    } else {
      this.punctuation(`"""`);
      this.newline();
      for (const line of lines) {
        this.literal(line);
        this.newline();
      }
      this.punctuation(`"""`);
    }
  }

  literal(value: string) {
    this.tokens.push({
      Kind: ApiViewTokenKind.StringLiteral,
      Value: value,
    });
  }

  diagnostic(message: string, targetId: string, level: ApiViewDiagnosticLevel) {
    this.diagnostics.push(new ApiViewDiagnostic(message, targetId, level));
  }

  navigation(item: ApiViewNavigation) {
    this.navigationItems.push(item);
  }

  shouldEmitNamespace(name: string): boolean {
    if (name === "" && this.includeGlobalNamespace) {
      return true;
    }
    if (name === this.packageName) {
      return true;
    }
    if (!name.startsWith(this.packageName)) {
      return false;
    }
    const suffix = name.substring(this.packageName.length);
    return suffix.startsWith(".");
  }

  emit(program: Program) {
    let allNamespaces = new Map<string, Namespace>();

    // collect namespaces in program
    navigateProgram(program, {
      namespace(obj) {
        const name = getNamespaceFullName(obj);
        allNamespaces.set(name, obj);
      },
    });
    allNamespaces = new Map([...allNamespaces].sort());

    for (const [name, ns] of allNamespaces.entries()) {
      if (!this.shouldEmitNamespace(name)) {
        continue;
      }
      // use a fake name to make the global namespace clear
      const namespaceName = name === "" ? "::GLOBAL::" : name;
      const nsModel = new NamespaceModel(namespaceName, ns, program);
      if (nsModel.shouldEmit()) {
        this.tokenizeNamespaceModel(nsModel);
        this.buildNavigation(nsModel);  
      }
    }
  }

  private emitHeader() {
    const toolVersion = LIB_VERSION;
    const headerText = `// Package parsed using @azure-tools/typespec-apiview (version:${toolVersion})`;
    this.token(ApiViewTokenKind.SkipDiffRangeStart);
    this.literal(headerText);
    this.namespaceStack.push("GLOBAL");
    this.lineMarker();
    this.namespaceStack.pop();
    // TODO: Source URL?
    this.token(ApiViewTokenKind.SkipDiffRangeEnd);
    this.blankLines(2);
  }

  tokenize(node: BaseNode) {
    let obj;
    switch (node.kind) {
      case SyntaxKind.AliasStatement:
        obj = node as AliasStatementNode;
        this.namespaceStack.push(obj.id.sv);
        this.keyword("alias", false, true);
        this.typeDeclaration(obj.id.sv, this.namespaceStack.value(), true);
        this.tokenizeTemplateParameters(obj.templateParameters);
        this.punctuation("=", true, true);
        this.tokenize(obj.value);
        this.namespaceStack.pop();
        break;
      case SyntaxKind.ArrayExpression:
        obj = node as ArrayExpressionNode;
        this.tokenize(obj.elementType);
        this.punctuation("[]");
        break;
      case SyntaxKind.AugmentDecoratorStatement:
        obj = node as AugmentDecoratorStatementNode;
        const decoratorName = this.getNameForNode(obj.target);
        this.namespaceStack.push(decoratorName);
        this.punctuation("@@", false, false);
        this.tokenizeIdentifier(obj.target, "keyword");
        this.lineMarker();
        if (obj.arguments.length) {
          const last = obj.arguments.length - 1;
          this.punctuation("(", false, false);
          this.tokenize(obj.targetType);
          if (obj.arguments.length) {
            this.punctuation(",", false, true);
          }
          for (let x = 0; x < obj.arguments.length; x++) {
            const arg = obj.arguments[x];
            this.tokenize(arg);
            if (x !== last) {
              this.punctuation(",", false, true);
            }
          }
          this.punctuation(")", false, false);
          this.namespaceStack.pop();
        }
        break;
      case SyntaxKind.BooleanLiteral:
        obj = node as BooleanLiteralNode;
        this.literal(obj.value.toString());
        break;
      case SyntaxKind.BlockComment:
        throw new Error(`Case "BlockComment" not implemented`);
      case SyntaxKind.TypeSpecScript:
        throw new Error(`Case "TypeSpecScript" not implemented`);
      case SyntaxKind.DecoratorExpression:
        obj = node as DecoratorExpressionNode;
        this.punctuation("@", false, false);
        this.tokenizeIdentifier(obj.target, "keyword");
        this.lineMarker();
        if (obj.arguments.length) {
          const last = obj.arguments.length - 1;
          this.punctuation("(", false, false);
          for (let x = 0; x < obj.arguments.length; x++) {
            const arg = obj.arguments[x];
            this.tokenize(arg);
            if (x !== last) {
              this.punctuation(",", false, true);
            }
          }
          this.punctuation(")", false, false);
        }
        break;
      case SyntaxKind.DirectiveExpression:
        obj = node as DirectiveExpressionNode;
        this.keyword(`#${obj.target.sv}`, false, true);
        for (const arg of obj.arguments) {
          switch (arg.kind) {
            case SyntaxKind.StringLiteral:
              this.stringLiteral(arg.value);
              this.space();
              break;
            case SyntaxKind.Identifier:
              this.stringLiteral(arg.sv);
              this.space();
              break;
          }
        }
        this.newline();
        break;
      case SyntaxKind.EmptyStatement:
        throw new Error(`Case "EmptyStatement" not implemented`);
      case SyntaxKind.EnumMember:
        obj = node as EnumMemberNode;
        this.tokenizeDecoratorsAndDirectives(obj.decorators, obj.directives, false);
        this.tokenizeIdentifier(obj.id, "member");
        this.lineMarker(true);
        if (obj.value) {
          this.punctuation(":", false, true);
          this.tokenize(obj.value);
        }
        break;
      case SyntaxKind.EnumSpreadMember:
        obj = node as EnumSpreadMemberNode;
        this.punctuation("...", false, false);
        this.tokenize(obj.target);
        this.lineMarker();
        break;
      case SyntaxKind.EnumStatement:
        this.tokenizeEnumStatement(node as EnumStatementNode);
        break;
      case SyntaxKind.JsNamespaceDeclaration:
        throw new Error(`Case "JsNamespaceDeclaration" not implemented`);
      case SyntaxKind.JsSourceFile:
        throw new Error(`Case "JsSourceFile" not implemented`);
      case SyntaxKind.Identifier:
        obj = node as IdentifierNode;
        const id = this.namespaceStack.value();
        this.typeReference(obj.sv, id);
        break;
      case SyntaxKind.ImportStatement:
        throw new Error(`Case "ImportStatement" not implemented`);
      case SyntaxKind.IntersectionExpression:
        obj = node as IntersectionExpressionNode;
        for (let x = 0; x < obj.options.length; x++) {
          const opt = obj.options[x];
          this.tokenize(opt);
          if (x !== obj.options.length - 1) {
            this.punctuation("&", true, true);
          }
        }
        break;
      case SyntaxKind.InterfaceStatement:
        this.tokenizeInterfaceStatement(node as InterfaceStatementNode);
        break;
      case SyntaxKind.InvalidStatement:
        throw new Error(`Case "InvalidStatement" not implemented`);
      case SyntaxKind.LineComment:
        throw new Error(`Case "LineComment" not implemented`);
      case SyntaxKind.MemberExpression:
        this.tokenizeIdentifier(node as MemberExpressionNode, "reference");
        break;
      case SyntaxKind.ModelExpression:
        this.tokenizeModelExpression(node as ModelExpressionNode, false, false);
        break;
      case SyntaxKind.ModelProperty:
        this.tokenizeModelProperty(node as ModelPropertyNode, false);
        break;
      case SyntaxKind.ModelSpreadProperty:
        obj = node as ModelSpreadPropertyNode;
        this.punctuation("...");
        this.tokenize(obj.target);
        this.lineMarker();
        break;
      case SyntaxKind.ModelStatement:
        obj = node as ModelStatementNode;
        this.tokenizeModelStatement(obj);
        break;
      case SyntaxKind.NamespaceStatement:
        throw new Error(`Case "NamespaceStatement" not implemented`);
      case SyntaxKind.NeverKeyword:
        this.keyword("never", true, true);
        break;
      case SyntaxKind.NumericLiteral:
        obj = node as NumericLiteralNode;
        this.literal(obj.value.toString());
        break;
      case SyntaxKind.OperationStatement:
        this.tokenizeOperationStatement(node as OperationStatementNode);
        break;
      case SyntaxKind.OperationSignatureDeclaration:
        obj = node as OperationSignatureDeclarationNode;
        this.punctuation("(", false, false);
        // TODO: heuristic for whether operation signature should be inlined or not.
        const inline = false;
        this.tokenizeModelExpression(obj.parameters, true, inline);
        this.punctuation("):", false, true);
        this.tokenizeReturnType(obj, inline);
        break;
      case SyntaxKind.OperationSignatureReference:
        obj = node as OperationSignatureReferenceNode;
        this.keyword("is", true, true);
        this.tokenize(obj.baseOperation);
        break;
      case SyntaxKind.Return:
        throw new Error(`Case "Return" not implemented`);
      case SyntaxKind.StringLiteral:
        obj = node as StringLiteralNode;
        this.stringLiteral(obj.value);
        break;
      case SyntaxKind.ScalarStatement:
        this.tokenizeScalarStatement(node as ScalarStatementNode);
        break;
      case SyntaxKind.TemplateParameterDeclaration:
        obj = node as TemplateParameterDeclarationNode;
        this.tokenize(obj.id);
        if (obj.constraint) {
          this.keyword("extends", true, true);
          this.tokenize(obj.constraint);
        }
        if (obj.default) {
          this.punctuation("=", true, true);
          this.tokenize(obj.default);
        }
        break;
      case SyntaxKind.TupleExpression:
        obj = node as TupleExpressionNode;
        this.punctuation("[", true, true);
        for (let x = 0; x < obj.values.length; x++) {
          const val = obj.values[x];
          this.tokenize(val);
          if (x !== obj.values.length - 1) {
            this.renderPunctuation(",");
          }
        }
        this.punctuation("]", true, false);
        break;
      case SyntaxKind.TypeReference:
        obj = node as TypeReferenceNode;
        this.tokenizeIdentifier(obj.target, "reference");
        if (obj.arguments.length) {
          this.punctuation("<", false, false);  
          for (let x = 0; x < obj.arguments.length; x++) {
            const arg = obj.arguments[x];
            this.tokenize(arg);
            if (x !== obj.arguments.length - 1) {
              this.renderPunctuation(",");
            }
          }
          this.punctuation(">");
        }
        break;
      case SyntaxKind.UnionExpression:
        obj = node as UnionExpressionNode;
        for (let x = 0; x < obj.options.length; x++) {
          const opt = obj.options[x];
          this.tokenize(opt);
          if (x !== obj.options.length -1) {
            this.punctuation("|", true, true);
          }
        }
        break;
      case SyntaxKind.UnionStatement:
        this.tokenizeUnionStatement(node as UnionStatementNode);
        break;
      case SyntaxKind.UnionVariant:
        this.tokenizeUnionVariant(node as UnionVariantNode);
        break;
      case SyntaxKind.UnknownKeyword:
        this.keyword("any", true, true);
        break;
      case SyntaxKind.UsingStatement:
        throw new Error(`Case "UsingStatement" not implemented`);
      case SyntaxKind.ValueOfExpression:
        this.keyword("valueof", true, true);
        this.tokenize((node as ValueOfExpressionNode).target);
        break;
      case SyntaxKind.VoidKeyword:
        this.keyword("void", true, false);
        break;
      case SyntaxKind.TemplateArgument:
        obj = node as TemplateArgumentNode;
        const isExpanded = obj.argument.kind === SyntaxKind.ModelExpression;
        if (isExpanded) {
            this.newline();
            this.indent();
        }
        if (obj.name) {
            this.text(obj.name.sv);
            this.punctuation("=", true, true);
        }
        if (isExpanded) {
            this.tokenizeModelExpressionExpanded(obj.argument as ModelExpressionNode, false, false);
            this.deindent();
        } else {
            this.tokenize(obj.argument);
        }
        break;
      case SyntaxKind.StringTemplateExpression:
        obj = node as StringTemplateExpressionNode;
        const stringValue = this.buildTemplateString(obj);
        const multiLine = stringValue.includes("\n");
        // single line case
        if (!multiLine) {
          this.stringLiteral(stringValue);
          break;
        }
        // otherwise multiline case
        const lines = stringValue.split("\n");
        this.punctuation(`"""`);
        this.newline();
        this.indent();
        for (const line of lines) {
          this.literal(line);
          this.newline();
        }
        this.deindent();
        this.punctuation(`"""`);
        break;
      case SyntaxKind.StringTemplateSpan:
        obj = node as StringTemplateSpanNode;
        this.punctuation("${", false, false);
        this.tokenize(obj.expression);
        this.punctuation("}", false, false);
        this.tokenize(obj.literal);
        break;
      case SyntaxKind.StringTemplateHead:
      case SyntaxKind.StringTemplateMiddle:
      case SyntaxKind.StringTemplateTail:
        obj = node as StringTemplateHeadNode;
        this.literal(obj.value);
        break;
      default:
        // All Projection* cases should fail here...
        throw new Error(`Case "${SyntaxKind[node.kind].toString()}" not implemented`);
    }
  }

  private buildExpressionString(node: Expression) {
    switch (node.kind) {
      case SyntaxKind.StringLiteral:
        return `"${(node as StringLiteralNode).value}"`;
      case SyntaxKind.NumericLiteral:
        return (node as NumericLiteralNode).value.toString();
      case SyntaxKind.BooleanLiteral:
        return (node as BooleanLiteralNode).value.toString();
      case SyntaxKind.StringTemplateExpression:
        return this.buildTemplateString(node as StringTemplateExpressionNode);
      case SyntaxKind.VoidKeyword:
        return "void";
      case SyntaxKind.NeverKeyword:
        return "never";
      case SyntaxKind.TypeReference:
        const obj = node as TypeReferenceNode;
        switch (obj.target.kind) {
          case SyntaxKind.Identifier:
            return (obj.target as IdentifierNode).sv;
          case SyntaxKind.MemberExpression:
            return this.getFullyQualifiedIdentifier(obj.target as MemberExpressionNode);
        }
        break;
      default:
        throw new Error(`Unsupported expression kind: ${SyntaxKind[node.kind]}`);
      //unsupported ArrayExpressionNode | MemberExpressionNode | ModelExpressionNode | TupleExpressionNode | UnionExpressionNode | IntersectionExpressionNode | TypeReferenceNode | ValueOfExpressionNode | AnyKeywordNode;
    }
  }

  /** Constructs a single string with template markers. */
  private buildTemplateString(node: StringTemplateExpressionNode): string {
    let result = node.head.value;
    for (const span of node.spans) {
      result += "${" + this.buildExpressionString(span.expression) + "}";
      result += span.literal.value;
    }
    return result;
  }

  private tokenizeModelStatement(node: ModelStatementNode) {
    this.namespaceStack.push(node.id.sv);
    this.tokenizeDecoratorsAndDirectives(node.decorators, node.directives, false);
    this.keyword("model", false, true);
    this.tokenizeIdentifier(node.id, "declaration");
    if (node.extends) {
      this.keyword("extends", true, true);
      this.tokenize(node.extends);
    }
    if (node.is) {
      this.keyword("is", true, true);
      this.tokenize(node.is);
    }
    this.tokenizeTemplateParameters(node.templateParameters);
    if (node.properties.length) {
      this.beginGroup();
      for (const prop of node.properties) {
        const propName = this.getNameForNode(prop);
        this.namespaceStack.push(propName);
        this.tokenize(prop);
        this.punctuation(";", false, false);
        this.namespaceStack.pop();
        this.blankLines(0);
      }
      this.endGroup();
    } else {
      this.punctuation("{}", true, false);
    }
    this.namespaceStack.pop();
  }

  private tokenizeScalarStatement(node: ScalarStatementNode) {
    this.namespaceStack.push(node.id.sv);
    this.tokenizeDecoratorsAndDirectives(node.decorators, node.directives, false);
    this.keyword("scalar", false, true);
    this.tokenizeIdentifier(node.id, "declaration");
    if (node.extends) {
      this.keyword("extends", true, true);
      this.tokenize(node.extends);
    }
    this.tokenizeTemplateParameters(node.templateParameters);
    this.blankLines(0);
    this.namespaceStack.pop();
  }

  private tokenizeInterfaceStatement(node: InterfaceStatementNode) {
    this.namespaceStack.push(node.id.sv);
    this.tokenizeDecoratorsAndDirectives(node.decorators, node.directives, false);
    this.keyword("interface", false, true);
    this.tokenizeIdentifier(node.id, "declaration");
    this.tokenizeTemplateParameters(node.templateParameters);
    this.beginGroup();
    for (let x = 0; x < node.operations.length; x++) {
      const op = node.operations[x];
      this.tokenizeOperationStatement(op, true);
      this.blankLines((x !== node.operations.length -1) ? 1 : 0);
    }
    this.endGroup();
    this.namespaceStack.pop();
  }

  private tokenizeEnumStatement(node: EnumStatementNode) {
    this.namespaceStack.push(node.id.sv);
    this.tokenizeDecoratorsAndDirectives(node.decorators, node.directives, false);
    this.keyword("enum", false, true);
    this.tokenizeIdentifier(node.id, "declaration");
    this.beginGroup();
    for (const member of node.members) {
      const memberName = this.getNameForNode(member);
      this.namespaceStack.push(memberName);
      this.tokenize(member);
      this.punctuation(",");
      this.namespaceStack.pop();
      this.blankLines(0);
    }
    this.endGroup();
    this.namespaceStack.pop();
  }

  private tokenizeUnionStatement(node: UnionStatementNode) {
    this.namespaceStack.push(node.id.sv);
    this.tokenizeDecoratorsAndDirectives(node.decorators, node.directives, false);
    this.keyword("union", false, true);
    this.tokenizeIdentifier(node.id, "declaration");
    this.beginGroup();
    for (let x = 0; x < node.options.length; x++) {
      const variant = node.options[x];
      const variantName = this.getNameForNode(variant);
      this.namespaceStack.push(variantName);
      this.tokenize(variant);
      this.namespaceStack.pop();
      if (x !== node.options.length - 1) {
        this.punctuation(",");
      }
      this.blankLines(0);
    }
    this.namespaceStack.pop();
    this.endGroup();
  }

  private tokenizeUnionVariant(node: UnionVariantNode) {
    this.tokenizeDecoratorsAndDirectives(node.decorators, node.directives, false);
    if (node.id !== undefined) {
      this.tokenizeIdentifier(node.id, "member");
      this.punctuation(":", false, true);
    }
    this.lineMarker(true);
    this.tokenize(node.value);
  }

  private tokenizeModelProperty(node: ModelPropertyNode, inline: boolean) {
    this.tokenizeDecoratorsAndDirectives(node.decorators, node.directives, inline);
    this.tokenizeIdentifier(node.id, "member");
    this.lineMarker();
    this.punctuation(node.optional ? "?:" : ":", false, true);
    this.tokenize(node.value);
    if (node.default) {
      this.punctuation("=", true, true);
      this.tokenize(node.default);
    }
  }

  private tokenizeModelExpressionInline(node: ModelExpressionNode, isOperationSignature: boolean) {
    if (node.properties.length) {
      if (!isOperationSignature) {
        this.punctuation("{", true, true);
      }
      for (let x = 0; x < node.properties.length; x++) {
        const prop = node.properties[x];
        switch (prop.kind) {
          case SyntaxKind.ModelProperty:
            this.tokenizeModelProperty(prop, true);
            break;
          case SyntaxKind.ModelSpreadProperty:
            this.tokenize(prop);
            break;
        }
        if (isOperationSignature) {
          if (x !== node.properties.length - 1) {
            this.punctuation(",", false, true);
          }  
        } else {
          this.punctuation(";");
        }
      }
      if (!isOperationSignature) {
        this.punctuation("}", true, true);
      }
    }
  }

  private tokenizeModelExpressionExpanded(node: ModelExpressionNode, isOperationSignature: boolean, leadingNewline: boolean) {
    if (node.properties.length) {
      if (leadingNewline) {
        this.blankLines(0);
        this.indent();
      }
      if (!isOperationSignature) {
        this.punctuation("{", false, false);
        this.blankLines(0);
        this.indent();  
      }
      this.namespaceStack.push("anonymous");
      for (let x = 0; x < node.properties.length; x++) {
        const prop = node.properties[x];
        const propName = this.getNameForNode(prop);
        this.namespaceStack.push(propName);
        switch (prop.kind) {
          case SyntaxKind.ModelProperty:
            this.tokenizeModelProperty(prop, false);
            break;
          case SyntaxKind.ModelSpreadProperty:
            this.tokenize(prop);
        }
        this.namespaceStack.pop();
        if (isOperationSignature) {
          if (x !== node.properties.length - 1) {
            this.renderPunctuation(",");
          }  
        } else {
          this.renderPunctuation(";");
        }
        this.blankLines(0);
      }
      this.namespaceStack.pop();
      this.blankLines(0);
      if (!isOperationSignature) {
        this.deindent();
        this.punctuation("}", false, false);
        this.blankLines(0);  
      }
      this.trim();
      if (leadingNewline) {
        this.deindent();
      }

    } else if (!isOperationSignature) {
      this.punctuation("{}", true, false);
    }
  }

  private tokenizeModelExpression(
    node: ModelExpressionNode,
    isOperationSignature: boolean,
    inline: boolean
  ) {
    if (inline) {
      this.tokenizeModelExpressionInline(node, isOperationSignature)
    } else {
      this.tokenizeModelExpressionExpanded(node, isOperationSignature, true)
    }
  }

  private tokenizeOperationStatement(node: OperationStatementNode, suppressOpKeyword: boolean = false) {
    this.namespaceStack.push(node.id.sv);
    this.tokenizeDecoratorsAndDirectives(node.decorators, node.directives, false);
    if (!suppressOpKeyword) {
      this.keyword("op", false, true);
    }
    this.tokenizeIdentifier(node.id, "declaration");
    this.tokenizeTemplateParameters(node.templateParameters);
    this.tokenize(node.signature);
    this.punctuation(";", false, false);
    this.namespaceStack.pop();
  }

  private tokenizeNamespaceModel(model: NamespaceModel) {
    this.namespaceStack.push(model.name);
    if (model.node.kind === SyntaxKind.NamespaceStatement) {
        this.tokenizeDecoratorsAndDirectives(model.node.decorators, model.node.directives, false);
    }
    this.keyword("namespace", false, true);
    this.typeDeclaration(model.name, this.namespaceStack.value(), true);
    this.beginGroup();
    for (const node of model.augmentDecorators) {
      this.tokenize(node);
      this.blankLines(1);
    }
    for (const node of model.operations.values()) {
      this.tokenize(node);
      this.blankLines(1);
    }
    for (const node of model.resources.values()) {
      this.tokenize(node);
      this.blankLines(1);
    }
    for (const node of model.models.values()) {
      this.tokenize(node);
      this.blankLines(1);
    }
    for (const node of model.aliases.values()) {
        this.tokenize(node);
        this.punctuation(";");
        this.blankLines(1);
    }  
    this.endGroup();
    this.blankLines(1);
    this.namespaceStack.pop();
  }

  private tokenizeDecoratorsAndDirectives(decorators: readonly DecoratorExpressionNode[] | undefined, directives: readonly DirectiveExpressionNode[] | undefined, inline: boolean) {
    const docDecorators = ["doc", "summary", "example"]
    if ((directives || []).length === 0 && (decorators || []).length === 0) {
        return;
    }
    for (const directive of directives ?? []) {
      this.tokenize(directive);
    }
    // FIXME: ensure there is no blank line after opening brace for non-inlined decorators
    // if (!inline && decorators?.length && directives === undefined) {
    //   while (this.tokens.length) {
    //     const item = this.tokens.pop()!;
    //     if (item.Kind === ApiViewTokenKind.LineIdMarker && item.DefinitionId === "GLOBAL") {
    //       this.tokens.push(item);
    //       this.blankLines(2);
    //       break;
    //     } else if ([ApiViewTokenKind.Punctuation, ApiViewTokenKind.TypeName].includes(item.Kind)) {
    //       this.tokens.push(item);
    //       // for now, render with no newlines, per stewardship board request
    //       const lineCount = ["{", "("].includes(item.Value!) ? 0 : 0;
    //       this.blankLines(lineCount);
    //       break;
    //     }
    //   }
    // }
    // render each decorator
    for (const node of decorators || []) {
      this.namespaceStack.push(generateId(node)!);
      const isDoc = docDecorators.includes((node.target as IdentifierNode).sv)
      if (isDoc) {
        this.tokens.push({
          Kind: ApiViewTokenKind.DocumentRangeStart
        })
      }
      this.tokenize(node);
      if (inline) {
        this.space();
      }
      this.namespaceStack.pop();
      if (!inline) {
        this.blankLines(0);
      }
      if (isDoc) {
        this.tokens.push({
          Kind: ApiViewTokenKind.DocumentRangeEnd
        })
      }
    }
  }

  private getFullyQualifiedIdentifier(node: MemberExpressionNode, suffix?: string): string {
    switch (node.base.kind) {
      case SyntaxKind.Identifier:
        return `${node.base.sv}.${suffix}`;
      case SyntaxKind.MemberExpression:
        return this.getFullyQualifiedIdentifier(node.base, `${node.base.id.sv}.${suffix}`);
    }
  }

  private tokenizeIdentifier(
    node: IdentifierNode | MemberExpressionNode | StringLiteralNode,
    style: "declaration" | "reference" | "member" | "keyword"
  ) {
    switch (node.kind) {
      case SyntaxKind.MemberExpression:
        const defId = this.getFullyQualifiedIdentifier(node, node.id.sv);
        switch (style) {
          case "reference":
            this.typeReference(defId);
            break;
          case "member":
            this.member(defId);
            break;
          case "keyword":
            this.keyword(defId);
            break;
          case "declaration":
            throw new Error(`MemberExpression cannot be a "declaration".`);
        }
        break;
      case SyntaxKind.StringLiteral:
        if (style !== "member") {
          throw new Error(`StringLiteral type can only be a member name. Unexpectedly "${style}"`);
        }
        this.stringLiteral(node.value);
        break;
      case SyntaxKind.Identifier:
        switch (style) {
          case "declaration":
            this.typeDeclaration(node.sv, this.namespaceStack.value(), true);
            break;
          case "reference":
            const defId = this.definitionIdFor(node.sv, this.packageName);
            this.typeReference(node.sv, defId);
            break;
          case "member":
            this.member(this.getRawText(node));
            break;
          case "keyword":
            this.keyword(node.sv)
            break;
        }
    }
  }

  private getRawText(node: IdentifierNode): string {
    return getSourceLocation(node).file.text.slice(node.pos, node.end);
  }


  private tokenizeTemplateParameters(nodes: readonly TemplateParameterDeclarationNode[]) {
    if (nodes.length) {
      this.punctuation("<", false, false);  
      for (let x = 0; x < nodes.length; x++) {
        const param = nodes[x];
        this.tokenize(param);
        if (x !== nodes.length - 1) {
          this.renderPunctuation(",");
          this.space();
        }
      }
      this.punctuation(">");
    }
  }

  private tokenizeReturnType(node: OperationSignatureDeclarationNode, inline: boolean) {
    if (!inline && node.parameters.properties.length) {
      const offset = this.tokens.length;
      this.tokenize(node.returnType);
      const returnTokens = this.tokens.slice(offset);
      const returnTypeString = returnTokens.filter((x) => x.Value).flatMap((x) => x.Value).join("");
      this.namespaceStack.push(returnTypeString);
      this.lineMarker();
      this.namespaceStack.pop();
    } else {
      this.tokenize(node.returnType);
    }
  }

  private buildNavigation(ns: NamespaceModel) {
    this.namespaceStack.reset();
    this.navigation(new ApiViewNavigation(ns, this.namespaceStack));
  }

  private getNameForNode(node: BaseNode | NamespaceModel): string {
    const id = generateId(node);
    if (id) {
      return id.split(".").splice(-1)[0];
    } else {
      throw new Error("Unable to get name for node.");
    }
  }

  private renderPunctuation(punctuation: string) {
    const last = this.tokens.pop()!;
    if (last?.Kind === ApiViewTokenKind.Whitespace) {
      // hacky workaround to ensure comma is after trailing bracket for expanded anonymous models
      this.tokens.pop();
    } else {
      this.tokens.push(last);
    }
    this.punctuation(punctuation, false, true);
  }

  resolveMissingTypeReferences() {
    for (const token of this.tokens) {
      if (token.Kind === ApiViewTokenKind.TypeName && token.NavigateToId === "__MISSING__") {
        token.NavigateToId = this.definitionIdFor(token.Value!, this.packageName);
      }
    }
  }

  asApiViewDocument(): ApiViewDocument {
    return {
      Name: this.name,
      PackageName: this.packageName,
      Tokens: this.tokens,
      Navigation: this.navigationItems,
      Diagnostics: this.diagnostics,
      VersionString: this.versionString,
      Language: "TypeSpec",
      CrossLanguagePackageId: this.crossLanguagePackageId
    };
  }

  definitionIdFor(value: string, prefix: string): string | undefined {
    if (value.includes(".")) {
      const fullName = `${prefix}.${value}`;
      return this.typeDeclarations.has(fullName) ? fullName : undefined;
    }
    for (const item of this.typeDeclarations) {
      if (item.split(".").splice(-1)[0] === value) {
        return item;
      }
    }
    return undefined;
  }
}

export class NamespaceStack {
  stack = new Array<string>();

  push(val: string) {
    this.stack.push(val);
  }

  pop(): string | undefined {
    return this.stack.pop();
  }

  value(): string {
    return this.stack.join(".");
  }

  reset() {
    this.stack = Array<string>();
  }
};
