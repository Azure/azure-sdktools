// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

package cmd

import (
	"fmt"
	"go/ast"
	"regexp"
	"sort"
	"strings"
	"unicode"
)

// exportedFieldRgx matches exported field names like "policy.ClientOptions", "Transport", and "GetToken(...)"
var exportedFieldRgx = regexp.MustCompile(`^(?:[a-zA-Z]*\.)?[A-Z]+[a-zA-Z]*`)

type TokenMaker interface {
	Exported() bool
	ID() string
	MakeTokens() []Token
	Name() string
}

// Declaration is a const or var declaration.
type Declaration struct {
	Type string

	id      string
	name    string
	value   string
	pkgName string
}

func NewDeclaration(pkg Pkg, vs *ast.ValueSpec, imports map[string]string) Declaration {
	v := skip
	if len(vs.Values) > 0 {
		v = getExprValue(pkg, vs.Values[0])
	}
	decl := Declaration{id: pkg.Name() + "." + vs.Names[0].Name, name: vs.Names[0].Name, value: v, pkgName: pkg.Name()}
	// Type is nil for untyped consts
	if vs.Type != nil {
		switch x := vs.Type.(type) {
		case *ast.Ident:
			// const ETagAny ETag = "*"
			// const PeekLock ReceiveMode = internal.PeekLock
			decl.Type = pkg.translateTypePackagePrefix(x.Name, imports)
		case *ast.MapType:
			// var nullables map[reflect.Type]interface{} = map[reflect.Type]interface{}{}
			decl.Type = pkg.translateTypePackagePrefix(pkg.getText(vs.Type.Pos(), vs.Type.End()), imports)
		case *ast.SelectorExpr:
			// const LogCredential log.Classification = "Credential"
			decl.Type = pkg.translateTypePackagePrefix(x.Sel.Name, imports)
		case *ast.StarExpr:
			// var defaultHTTPClient *http.Client
			decl.Type = pkg.translateTypePackagePrefix(x.X.(*ast.SelectorExpr).Sel.Name, imports)
		default:
			fmt.Println("unhandled constant type " + pkg.getText(vs.Type.Pos(), vs.Type.End()))
		}
	} else if len(vs.Values) == 1 {
		switch t := vs.Values[0].(type) {
		case *ast.CallExpr:
			// const FooConst = Foo("value")
			// var Foo = NewFoo()
			// TODO: determining the type here requires finding the definition of the called function. We may
			// not have encountered that yet, so we would need to set the types of these declarations after
			// traversing the entire AST.
		case *ast.CompositeLit:
			// var AzureChina = Configuration{ ... }
			decl.Type = pkg.translateTypePackagePrefix(pkg.getText(t.Type.Pos(), t.Type.End()), imports)
		}
	} else {
		// implicitly typed const
		decl.Type = skip
	}
	return decl
}

func (d Declaration) Exported() bool {
	return unicode.IsUpper(rune(d.name[0]))
}

func (d Declaration) ID() string {
	return d.id
}

func (d Declaration) MakeTokens() []Token {
	list := &[]Token{}
	ID := d.ID()
	makeToken(&ID, nil, d.Name(), TokenTypeTypeName, list)
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	if d.Type != skip {
		parseAndMakeTypeToken(d.Type, list, d.pkgName)
	}
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	makeToken(nil, nil, "=", TokenTypePunctuation, list)
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	makeToken(nil, nil, d.value, TokenTypeStringLiteral, list)
	makeToken(nil, nil, "", TokenTypeNewline, list)
	return *list
}

func (d Declaration) Name() string {
	return d.name
}

type Func struct {
	ReceiverName string
	ReceiverType string
	// Returns lists the func's return types
	Returns []string

	embedded bool
	exported bool
	id       string
	// name includes the function's receiver, if any
	name string
	// paramNames lists the func's parameters name
	paramNames []string
	// paramTypes lists the func's parameters type
	paramTypes []string
	// typeParamNames lists the func's type parameters name
	typeParamNames []string
	// typeParamConstraints lists the func's type parameters constraint
	typeParamConstraints []string
	pkgName              string
}

func NewFunc(pkg Pkg, f *ast.FuncDecl, imports map[string]string) Func {
	fn := newFunc(pkg, f.Type, imports)
	fn.name = f.Name.Name
	sig := ""
	if f.Recv != nil {
		// function receiver type should be in the same package, so no need to add or change any prefix
		fn.ReceiverType = pkg.getText(f.Recv.List[0].Type.Pos(), f.Recv.List[0].Type.End())
		if len(f.Recv.List[0].Names) != 0 {
			fn.ReceiverName = f.Recv.List[0].Names[0].Name
		}
		if fn.ReceiverName != "" {
			sig = fmt.Sprintf("(%s %s) ", fn.ReceiverName, fn.ReceiverType)
		} else {
			sig = fmt.Sprintf("(%s) ", fn.ReceiverType)
		}
	}
	fn.exported = !isOnUnexportedMember(sig) && unicode.IsUpper(rune(fn.name[0]))
	sig += f.Name.Name
	fn.id = pkg.Name() + "-" + sig
	return fn
}

func NewFuncForInterfaceMethod(pkg Pkg, interfaceName string, f *ast.Field, imports map[string]string) Func {
	fn := newFunc(pkg, f.Type.(*ast.FuncType), imports)
	fn.name = f.Names[0].Name
	fn.exported = unicode.IsUpper(rune(fn.name[0]))
	fn.id = pkg.Name() + "-" + interfaceName + "-" + fn.name
	fn.embedded = true
	return fn
}

func newFunc(pkg Pkg, f *ast.FuncType, imports map[string]string) Func {
	fn := Func{pkgName: pkg.Name()}
	if f.TypeParams != nil {
		fn.typeParamNames = make([]string, 0, len(f.TypeParams.List))
		fn.typeParamConstraints = make([]string, 0, len(f.TypeParams.List))
		pkg.translateFieldList(f.TypeParams.List, func(param *string, constraint string) {
			fn.typeParamNames = append(fn.typeParamNames, *param)
			fn.typeParamConstraints = append(fn.typeParamConstraints, pkg.translateTypePackagePrefix(strings.TrimRight(constraint, " "), imports))
		})
	}
	if f.Params.List != nil {
		fn.paramNames = make([]string, 0, len(f.Params.List))
		fn.paramTypes = make([]string, 0, len(f.Params.List))
		pkg.translateFieldList(f.Params.List, func(n *string, t string) {
			if n != nil {
				fn.paramNames = append(fn.paramNames, *n)
			} else {
				fn.paramNames = append(fn.paramNames, "")
			}
			fn.paramTypes = append(fn.paramTypes, pkg.translateTypePackagePrefix(t, imports))
		})
	}
	if f.Results != nil {
		fn.Returns = make([]string, 0, len(f.Results.List))
		pkg.translateFieldList(f.Results.List, func(n *string, t string) {
			fn.Returns = append(fn.Returns, pkg.translateTypePackagePrefix(t, imports))
		})
	}
	return fn
}

func (f Func) Exported() bool {
	return f.exported
}

func (f Func) ID() string {
	return f.id
}

func (f Func) ForAlias(pkg string) Func {
	clone := f
	// replace everything to the left of - with the new package name
	i := strings.Index(clone.id, "-")
	if i < 0 {
		panic("missing sig separator in id")
	}
	clone.id = pkg + clone.id[i:]
	return clone
}

func (f Func) MakeTokens() []Token {
	list := &[]Token{}
	if f.embedded {
		makeToken(nil, nil, "\t", TokenTypeWhitespace, list)
	} else {
		makeToken(nil, nil, "func", TokenTypeKeyword, list)
		makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	}
	if f.ReceiverType != "" {
		makeToken(nil, nil, "(", TokenTypePunctuation, list)
		if f.ReceiverName != "" {
			makeToken(nil, nil, f.ReceiverName, TokenTypeMemberName, list)
			makeToken(nil, nil, " ", TokenTypeWhitespace, list)
		}
		parseAndMakeTypeToken(f.ReceiverType, list, f.pkgName)
		makeToken(nil, nil, ")", TokenTypePunctuation, list)
		makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	}
	ID := f.ID()
	makeToken(&ID, nil, f.name, TokenTypeTypeName, list)
	if len(f.typeParamNames) > 0 {
		makeToken(nil, nil, "[", TokenTypePunctuation, list)
		for i, p := range f.typeParamNames {
			if i > 0 {
				makeToken(nil, nil, ",", TokenTypePunctuation, list)
				makeToken(nil, nil, " ", TokenTypeWhitespace, list)
			}
			makeToken(nil, nil, p, TokenTypeMemberName, list)
			parseAndMakeTypeToken(f.typeParamConstraints[i], list, f.pkgName)
		}
		makeToken(nil, nil, "]", TokenTypePunctuation, list)
	}
	makeToken(nil, nil, "(", TokenTypePunctuation, list)
	for i, p := range f.paramNames {
		if p != "" {
			makeToken(nil, nil, p, TokenTypeMemberName, list)
			makeToken(nil, nil, " ", TokenTypeWhitespace, list)
			parseAndMakeTypeToken(f.paramTypes[i], list, f.pkgName)
		} else {
			// parameter names are optional
			parseAndMakeTypeToken(f.paramTypes[i], list, f.pkgName)
		}
		if i < len(f.paramNames)-1 {
			makeToken(nil, nil, ",", TokenTypePunctuation, list)
			makeToken(nil, nil, " ", TokenTypeWhitespace, list)
		}
	}
	makeToken(nil, nil, ")", TokenTypePunctuation, list)
	if len(f.Returns) > 0 {
		makeToken(nil, nil, " ", TokenTypeWhitespace, list)
		if len(f.Returns) > 1 {
			makeToken(nil, nil, "(", TokenTypePunctuation, list)
		}
		for i, t := range f.Returns {
			parseAndMakeTypeToken(t, list, f.pkgName)
			if i < len(f.Returns)-1 {
				makeToken(nil, nil, ",", TokenTypePunctuation, list)
				makeToken(nil, nil, " ", TokenTypeWhitespace, list)
			}
		}
		if len(f.Returns) > 1 {
			makeToken(nil, nil, ")", TokenTypePunctuation, list)
		}
	}
	if !f.embedded {
		makeToken(nil, nil, "", TokenTypeNewline, list)
	}
	makeToken(nil, nil, "", TokenTypeNewline, list)
	return *list
}

func (f Func) Name() string {
	return f.name
}

var _ TokenMaker = (*Func)(nil)

type Interface struct {
	TokenMaker
	// Sealed indicates whether users can implement the interface i.e. whether it has an unexported method
	Sealed             bool
	embeddedInterfaces []string
	id                 string
	methods            map[string]Func
	name               string
	pkgName            string
}

func NewInterface(source Pkg, name, packageName string, n *ast.InterfaceType, imports map[string]string) Interface {
	in := Interface{
		name:               name,
		embeddedInterfaces: []string{},
		methods:            map[string]Func{},
		id:                 packageName + "." + name,
		pkgName:            source.Name(),
	}
	if n.Methods != nil {
		for _, m := range n.Methods.List {
			if len(m.Names) > 0 {
				n := m.Names[0].Name
				if unicode.IsLower(rune(n[0])) {
					in.Sealed = true
				}
				f := NewFuncForInterfaceMethod(source, name, m, imports)
				in.methods[n] = f
			} else {
				n := source.getText(m.Type.Pos(), m.Type.End())
				in.embeddedInterfaces = append(in.embeddedInterfaces, source.translateTypePackagePrefix(n, imports))
			}
		}
	}
	sort.Strings(in.embeddedInterfaces)
	return in
}

func (i Interface) Exported() bool {
	return unicode.IsUpper(rune(i.name[0]))
}

func (i Interface) ID() string {
	return i.id
}

func (i Interface) MakeTokens() []Token {
	ID := i.id
	list := &[]Token{}
	makeToken(nil, nil, "type", TokenTypeKeyword, list)
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	makeToken(&ID, nil, i.name, TokenTypeTypeName, list)
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	makeToken(nil, nil, "interface", TokenTypeKeyword, list)
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	makeToken(nil, nil, "{", TokenTypePunctuation, list)
	for _, name := range i.embeddedInterfaces {
		if exportedFieldRgx.MatchString(name) {
			// defID := ID + "-" + name
			makeToken(nil, nil, "", TokenTypeNewline, list)
			makeToken(nil, nil, "\t", TokenTypeWhitespace, list)
			parseAndMakeTypeToken(name, list, i.pkgName)
			// makeToken(&defID, nil, name, TokenTypeTypeName, list)
		}
	}
	if len(i.methods) > 0 {
		makeToken(nil, nil, "", TokenTypeNewline, list)
		keys := []string{}
		for k := range i.methods {
			if unicode.IsUpper(rune(k[0])) {
				keys = append(keys, k)
			}
		}
		sort.Strings(keys)
		for _, k := range keys {
			*list = append(*list, i.methods[k].MakeTokens()...)
		}
	}
	makeToken(nil, nil, "}", TokenTypePunctuation, list)
	makeToken(nil, nil, "", TokenTypeNewline, list)
	makeToken(nil, nil, "", TokenTypeNewline, list)
	return *list
}

func (i Interface) Name() string {
	return i.name
}

var _ TokenMaker = (*Interface)(nil)

type SimpleType struct {
	id             string
	name           string
	underlyingType string
	pkgName        string
}

func NewSimpleType(source Pkg, name, packageName, underlyingType string) SimpleType {
	return SimpleType{id: packageName + "." + name, name: name, underlyingType: underlyingType, pkgName: source.Name()}
}

func (s SimpleType) Exported() bool {
	return unicode.IsUpper(rune(s.name[0]))
}

func (s SimpleType) ID() string {
	return s.id
}

func (s SimpleType) MakeTokens() []Token {
	tokenList := &[]Token{}
	ID := s.id
	makeToken(nil, nil, "type", TokenTypeKeyword, tokenList)
	makeToken(nil, nil, " ", TokenTypeWhitespace, tokenList)
	makeToken(&ID, nil, s.name, TokenTypeTypeName, tokenList)
	makeToken(nil, nil, " ", TokenTypeWhitespace, tokenList)
	parseAndMakeTypeToken(s.underlyingType, tokenList, s.pkgName)
	// makeToken(nil, nil, s.underlyingType, TokenTypeText, tokenList)
	makeToken(nil, nil, "", TokenTypeNewline, tokenList)
	makeToken(nil, nil, "", TokenTypeNewline, tokenList)
	return *tokenList
}

func (s SimpleType) Name() string {
	return s.name
}

var _ TokenMaker = (*SimpleType)(nil)

type Struct struct {
	AnonymousFields []string
	// fields maps a field's name to the name of its type
	fields map[string]string
	id     string
	name   string
	// typeParams lists the func's type parameters as strings of the form "name constraint"
	typeParams []string
	pkgName    string
}

func NewStruct(source Pkg, name, packageName string, ts *ast.TypeSpec, imports map[string]string) Struct {
	s := Struct{name: name, id: packageName + "." + name, pkgName: source.Name()}
	if ts.TypeParams != nil {
		s.typeParams = make([]string, 0, len(ts.TypeParams.List))
		source.translateFieldList(ts.TypeParams.List, func(param *string, constraint string) {
			s.typeParams = append(s.typeParams, strings.TrimRight(*param+" "+source.translateTypePackagePrefix(constraint, imports), " "))
		})
	}
	source.translateFieldList(ts.Type.(*ast.StructType).Fields.List, func(n *string, t string) {
		if n == nil {
			s.AnonymousFields = append(s.AnonymousFields, source.translateTypePackagePrefix(t, imports))
		} else {
			if s.fields == nil {
				s.fields = map[string]string{}
			}
			s.fields[*n] = source.translateTypePackagePrefix(t, imports)
		}
	})
	sort.Strings(s.AnonymousFields)
	return s
}

func (s Struct) Exported() bool {
	return unicode.IsUpper(rune(s.name[0]))
}

func (s Struct) ID() string {
	return s.id
}

func (s Struct) MakeTokens() []Token {
	list := &[]Token{}
	ID := s.id
	makeToken(nil, nil, "type", TokenTypeKeyword, list)
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	makeToken(&ID, nil, s.name, TokenTypeTypeName, list)
	if len(s.typeParams) > 0 {
		makeToken(nil, nil, "[", TokenTypePunctuation, list)
		makeToken(nil, nil, strings.Join(s.typeParams, ", "), TokenTypeMemberName, list)
		makeToken(nil, nil, "]", TokenTypePunctuation, list)
	}
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	makeToken(nil, nil, "struct", TokenTypeKeyword, list)
	makeToken(nil, nil, " ", TokenTypeWhitespace, list)
	makeToken(nil, nil, "{", TokenTypePunctuation, list)
	exportedFields := false
	for _, name := range s.AnonymousFields {
		if exportedFieldRgx.MatchString(name) {
			// defID := name + "-" + s.id
			makeToken(nil, nil, "", TokenTypeNewline, list)
			makeToken(nil, nil, "\t", TokenTypeWhitespace, list)
			parseAndMakeTypeToken(name, list, s.pkgName)
			// makeToken(&defID, nil, name, TokenTypeTypeName, list)
			exportedFields = true
		}
	}
	keys := make([]string, 0, len(s.fields))
	for k := range s.fields {
		if exportedFieldRgx.MatchString(k) {
			keys = append(keys, k)
		}
	}
	sort.Strings(keys)
	for _, field := range keys {
		typ := s.fields[field]
		defID := field + "-" + s.id
		makeToken(nil, nil, "", TokenTypeNewline, list)
		makeToken(nil, nil, "\t", TokenTypeWhitespace, list)
		makeToken(&defID, nil, field, TokenTypeTypeName, list)
		makeToken(nil, nil, " ", TokenTypeWhitespace, list)
		parseAndMakeTypeToken(typ, list, s.pkgName)
		// makeToken(nil, nil, typ, TokenTypeMemberName, list)
		exportedFields = true
	}
	if exportedFields {
		makeToken(nil, nil, "", TokenTypeNewline, list)
	}
	makeToken(nil, nil, "}", TokenTypePunctuation, list)
	makeToken(nil, nil, "", TokenTypeNewline, list)
	makeToken(nil, nil, "", TokenTypeNewline, list)
	return *list
}

func (s Struct) Name() string {
	return s.name
}

var _ TokenMaker = (*Struct)(nil)

// makeToken builds the Token to be added to the Token slice that is passed in as a parameter.
// defID and navID components can be passed in as nil to indicate that there is no definition ID or
// navigation ID that is related to that token.
// val is the value of the token and it was will be visible in the API view tool.
// kind is the TokenType that will be assigned to the value and will determine how the value is
// represented in the API view tool.
// list is the slice of tokens that will be parsed in the API view tool, the new token will be appended to list.
// TODO improve makeToken and make more similar to append
func makeToken(defID, navID *string, val string, kind TokenType, list *[]Token) {
	tok := Token{DefinitionID: defID, NavigateToID: navID, Value: val, Kind: kind}
	*list = append(*list, tok)
}

func parseAndMakeTypeToken(val string, list *[]Token, pkgName string) {
	now := ""
	for _, ch := range val {
		switch string(ch) {
		case "*", "[", "]", " ", "(", ")", "{", "}":
			if now != "" {
				makeTypeSectionToken(now, list, pkgName)
				now = ""
			}
			if string(ch) == " " {
				makeToken(nil, nil, " ", TokenTypeWhitespace, list)
			} else {
				makeToken(nil, nil, string(ch), TokenTypePunctuation, list)
			}
		case ".":
			if now == ".." {
				makeToken(nil, nil, "...", TokenTypePunctuation, list)
				now = ""
			} else {
				now = now + "."
			}
		default:
			now = now + string(ch)
		}
	}
	if now != "" {
		makeTypeSectionToken(now, list, pkgName)
	}
}

func makeTypeSectionToken(section string, list *[]Token, pkgName string) {
	switch section {
	case "interface", "map", "any", "func":
		makeToken(nil, nil, section, TokenTypeKeyword, list)
	case "bool", "uint8", "uint16", "uint32", "uint64", "int8", "int16", "int32", "int64", "float32", "float64", "complex64", "complex128", "byte", "rune", "string", "error", "uintptr", "nil":
		makeToken(nil, nil, section, TokenTypeTypeName, list)
	default:
		splits := strings.Split(section, ".")
		var navID string
		if len(splits) == 1 {
			navID = fmt.Sprintf("%s.%s", pkgName, section)
		} else {
			navID = section
		}
		makeToken(nil, &navID, section, TokenTypeTypeName, list)
	}
}
