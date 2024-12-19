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

import XCTest
@testable import SwiftAPIViewCore

class SwiftAPIViewCoreTests: XCTestCase {

    /// Simple structure to track validation metadata on `ReviewLine`
    struct ReviewLineData: Equatable {
        /// Counts the number of `relatedLineId`
        var relatedToCount: Int;
        /// Counts the number of `isContextEndLine`
        var isContextEndCount: Int;
    }

    override func setUpWithError() throws {
        try super.setUpWithError()
        continueAfterFailure = false
        SharedLogger.set(logger: NullLogger(), withLevel: .info)
    }

    private func pathFor(testFile filename: String) -> String {
        let bundle = Bundle(for: APIViewManager.self)
        if let filePath = bundle.path(forResource: filename, ofType: "swifttxt") {
            return filePath
        }
        XCTFail("Could not find file \(filename).swifttxt")
        return ""
    }

    private func contentsOf(expectFile filename: String) -> String {
        let bundle = Bundle(for: APIViewManager.self)
        let path = bundle.path(forResource: filename, ofType: "txt")!
        return try! String(contentsOfFile: path)
    }

    /// Compares the text syntax of the APIView against what is expected.
    private func compare(expected: String, actual: String) {
        let actualLines = actual.split(separator: "\n", omittingEmptySubsequences: false).map { String($0) }
        let expectedLines = expected.split(separator: "\n", omittingEmptySubsequences: false).map { String($0) }
        for (i, expected) in expectedLines.enumerated() {
            let actual = actualLines[i]
            if (actual == expected) {
                continue
            }
            XCTFail("Line \(i): (\(actual) is not equal to (\(expected)")
        }
        XCTAssertEqual(actualLines.count, expectedLines.count, "Number of lines does not match")
    }

    /// Ensure there are no duplicate line IDs in the review, as that would lead
    /// to functional bugs on the web.
    private func validateLineIds(apiview: APIViewModel) {

        func validate(line: ReviewLine) {
            // ensure there are no repeated definition IDs
            if let lineId = line.lineId {
                XCTAssertFalse(lineIds.contains(lineId), "Duplicate line ID: \(lineId)")
                if lineId != "" {
                    lineIds.insert(lineId)
                }
                for child in line.children {
                    validate(line: child)
                }
            }
        }

        var lineIds = Set<String>()
        for line in apiview.reviewLines {
            validate(line: line)
        }
    }

    /// Extracts related lines from the APIView to ensure proper collapsing behavior on the web.
    private func getRelatedLineMetadata(apiview: APIViewModel) -> [String: ReviewLineData] {
        ///  Extracts the `ReviewLineData` for the provided review lines.
        func getReviewLinesMetadata(lines: [ReviewLine]?) -> [String: ReviewLineData]? {
            guard let lines = lines else { return nil }
            guard !lines.isEmpty else { return nil }
            var mainMap = [String: ReviewLineData]()
            var lastKey: String? = nil
            for line in lines {
                let lineId = line.lineId
                if let related = line.relatedToLine {
                    lastKey = related
                    var subMap = mainMap[related] ?? ReviewLineData(relatedToCount: 0, isContextEndCount: 0)
                    subMap.relatedToCount += 1
                    mainMap[related] = subMap
                }
                if let _ = line.isContextEndLine {
                    guard lastKey != nil else {
                        XCTFail("isEndContext found without a related line.")
                        return nil
                    }
                    var subMap = mainMap[lastKey!] ?? ReviewLineData(relatedToCount: 0, isContextEndCount: 0)
                    subMap.isContextEndCount += 1
                    mainMap[lastKey!] = subMap
                }
                if !line.children.isEmpty {
                    guard lineId != nil else {
                        XCTFail("Child without a line ID.")
                        return nil
                    }
                    lastKey = lineId
                    if let subMap = getReviewLinesMetadata(lines: line.children) {
                        for (key, value) in subMap {
                            mainMap[key] = value
                        }
                    }
                }
            }
            return mainMap
        }
        let countMap = getReviewLinesMetadata(lines: apiview.reviewLines)
        return countMap ?? [String: ReviewLineData]()
    }

    /// Compare `ReviewLineData` information for equality
    func compareCounts(_ lhs: [String: ReviewLineData], _ rhs: [String: ReviewLineData]) {
        // ensure keys are the same
        let lhsKeys = Set(lhs.keys)
        let rhsKeys = Set(rhs.keys)
        let combined = lhsKeys.union(rhsKeys)
        if (combined.count != lhsKeys.count) {
            XCTFail("Key mismatch: \(lhsKeys.description) vs \(rhsKeys.description)")
            return
        }
        XCTAssertEqual(lhs, rhs)
    }

    // MARK: Tests

    func testAttributes() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "AttributesTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "AttributesExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
        let expectedCounts: [String: ReviewLineData] = [
            "AttributesTestFile.swifttxt": ReviewLineData(relatedToCount: 0, isContextEndCount: 1),
            "AttributesTestFile.swifttxt.ExampleClass": ReviewLineData(relatedToCount: 0, isContextEndCount: 1),
            "AttributesTestFile.swifttxt.MyClass": ReviewLineData(relatedToCount: 1, isContextEndCount: 0),
            "AttributesTestFile.swifttxt.MyProtocol": ReviewLineData(relatedToCount: 1, isContextEndCount: 0),
            "AttributesTestFile.swifttxt.MyRenamedProtocol": ReviewLineData(relatedToCount: 0, isContextEndCount: 0),
            "AttributesTestFile.swifttxt.MyStruct": ReviewLineData(relatedToCount: 2, isContextEndCount: 0),
            "AttributesTestFile.swifttxt.SomeSendable": ReviewLineData(relatedToCount: 0, isContextEndCount: 1),
        ]
        compareCounts(counts, expectedCounts)
    }

    func testEnumerations() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "EnumerationsTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "EnumerationsExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testExtensions() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "ExtensionTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "ExtensionExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testFunctions() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "FunctionsTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "FunctionsExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testGenerics() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "GenericsTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "GenericsExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testInitializers() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "InitializersTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "InitializersExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testOperators() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "OperatorTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "OperatorExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testPrivateInternal() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "PrivateInternalTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "PrivateInternalExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testProperties() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "PropertiesTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "PropertiesExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testProtocols() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "ProtocolTestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "ProtocolExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }

    func testSwiftUI() throws {
        let manager = APIViewManager(mode: .testing)
        manager.config.sourcePath = pathFor(testFile: "SwiftUITestFile")
        manager.config.packageVersion = "1.0.0"
        let generated = try manager.run()
        let expected = contentsOf(expectFile: "SwiftUIExpectFile")
        compare(expected: expected, actual: generated)
        validateLineIds(apiview: manager.model!)
        let counts = getRelatedLineMetadata(apiview: manager.model!)
    }
}
