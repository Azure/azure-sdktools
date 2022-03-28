// --------------------------------------------------------------------------
//
// Copyright (c) Microsoft Corporation. All rights reserved.
//
// The MIT License (MIT)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the ""Software""), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.
//
// --------------------------------------------------------------------------

import Foundation
import AST


/// Grammar Summary:
///     typealias-declaration → attributes opt access-level-modifier opt typealias typealias-name generic-parameter-clause opt typealias-assignment
///     typealias-name → identifier
///     typealias-assignment → = type
class TypealiasModel: Tokenizable, Linkable, Commentable {

    var definitionId: String?
    var lineId: String?
    var attributes: AttributesModel
    var accessLevel: AccessLevelModifier
    var name: String
    var genericParamClause: GenericParameterModel?
    var assignment: TypeModel

    init(from decl: TypealiasDeclaration) {
        // FIXME: Fix this!
        definitionId = nil // defId(forName: decl.name.textDescription, withPrefix: defIdPrefix)
        lineId = nil
        attributes = AttributesModel(from: decl.attributes)
        accessLevel = decl.accessLevel ?? .internal
        name = decl.name.textDescription
        genericParamClause = GenericParameterModel(from: decl.generic)
        assignment = TypeModel(from: decl.assignment)
    }

    func tokenize() -> [Token] {
        var t = [Token]()
        guard publicModifiers.contains(accessLevel) else { return t }
        t.append(contentsOf: attributes.tokenize())
        t.keyword(accessLevel.textDescription)
        t.whitespace()
        t.keyword("typealias")
        t.whitespace()
        t.typeDeclaration(name: name, definitionId: definitionId)
        t.append(contentsOf: genericParamClause?.tokenize() ?? [])
        t.whitespace()
        t.punctuation("=")
        t.whitespace()
        t.append(contentsOf: assignment.tokenize())
        t.newLine()
        return t

    }

    func navigationTokenize(parent: Linkable?) -> [NavigationToken] {
        var t = [NavigationToken]()
        //        let navItem = NavigationItem(name: decl.name.textDescription, prefix: prefix, typeKind: .class)
        return t
    }
}
