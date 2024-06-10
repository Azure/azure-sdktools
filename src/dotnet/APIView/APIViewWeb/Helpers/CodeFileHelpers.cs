
using APIView.Model;
using APIViewWeb.Extensions;
using APIViewWeb.LeanModels;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace APIViewWeb.Helpers
{
    public class CodeFileHelpers
    {
        private static int _processorCount = Environment.ProcessorCount;
        private static SemaphoreSlim _semaphore = new SemaphoreSlim(_processorCount);
        private static ConcurrentBag<Task> _tasks = new ConcurrentBag<Task>();


        public static async Task<CodePanelData> GenerateCodePanelDataAsync(CodePanelRawData codePanelRawData)
        {
            var codePanelData = new CodePanelData();

            for (int idx = 0; idx < codePanelRawData.APIForest.Count; idx++)
            {
                var node = codePanelRawData.APIForest[idx];
                await BuildAPITree(codePanelData: codePanelData, codePanelRawData: codePanelRawData, apiTreeNode: node, 
                    parentNodeIdHashed: "root", nodePositionAtLevel: idx);
            };

            if (_processorCount > 1)
            {
                await Task.WhenAll(_tasks);
            }

            return codePanelData;
        }

        public static List<APITreeNode> ComputeAPIForestDiff(List<APITreeNode> activeAPIRevisionAPIForest, List<APITreeNode> diffAPIRevisionAPIForest)
        {
            List<APITreeNode> diffAPITree = new List<APITreeNode>();
            ComputeAPITreeDiff(activeAPIRevisionAPIForest, diffAPIRevisionAPIForest, diffAPITree);
            return diffAPITree;
        }

        private static void ComputeAPITreeDiff(List<APITreeNode> activeAPIRevisionAPIForest, List<APITreeNode> diffAPIRevisionAPIForest, List<APITreeNode> diffAPITree)
        {           
            var activeAPIRevisionTreeNodesAtLevel = new HashSet<APITreeNode>(activeAPIRevisionAPIForest);
            var diffAPIRevisionTreeNodesAtLevel = new HashSet<APITreeNode>(diffAPIRevisionAPIForest);

            var allNodesAtLevel = activeAPIRevisionAPIForest.InterleavedUnion(diffAPIRevisionAPIForest);
            var unChangedNodesAtLevel = activeAPIRevisionTreeNodesAtLevel.Intersect(diffAPIRevisionTreeNodesAtLevel);
            var removedNodesAtLevel = activeAPIRevisionTreeNodesAtLevel.Except(diffAPIRevisionTreeNodesAtLevel);
            var addedNodesAtLevel = diffAPIRevisionTreeNodesAtLevel.Except(activeAPIRevisionTreeNodesAtLevel);

            foreach (var node in allNodesAtLevel)
            {
                if (unChangedNodesAtLevel.Contains(node))
                {
                    var newEntry = CreateAPITreeDiffNode(node, DiffKind.Unchanged);
                    diffAPITree.Add(newEntry);
                }
                else if (removedNodesAtLevel.Contains(node))
                {
                    var newEntry = CreateAPITreeDiffNode(node, DiffKind.Removed);
                    diffAPITree.Add(newEntry);
                }
                else if (addedNodesAtLevel.Contains(node))
                {
                    var newEntry = CreateAPITreeDiffNode(node, DiffKind.Added);
                    diffAPITree.Add(newEntry);
                }
            }

            foreach (var node in unChangedNodesAtLevel)
            {
                var activeAPIRevisionNode = activeAPIRevisionTreeNodesAtLevel.First(n => n.Equals(node));
                var diffAPIRevisionNode = diffAPIRevisionTreeNodesAtLevel.First(n => n.Equals(node));
                var diffResultNode = diffAPITree.First(n => n.Equals(node));

                diffResultNode.TopTokens = activeAPIRevisionNode.TopTokens;
                diffResultNode.BottomTokens = activeAPIRevisionNode.BottomTokens;
                diffResultNode.TopDiffTokens = diffAPIRevisionNode.TopTokens;
                diffResultNode.BottomDiffTokens = diffAPIRevisionNode.BottomTokens;

                var childrenResult = new List<APITreeNode>();
                ComputeAPITreeDiff(activeAPIRevisionNode.Children, diffAPIRevisionNode.Children, childrenResult);
                diffResultNode.Children.AddRange(childrenResult);
            };
        }

        private static APITreeNode CreateAPITreeDiffNode(APITreeNode node, DiffKind diffKind)
        {
            var result = new APITreeNode
            {
                Name = node.Name,
                Id = node.Id,
                Kind    = node.Kind,
                Tags = node.Tags,
                Properties = node.Properties,
                DiffKind = diffKind
            };

            if (diffKind == DiffKind.Added || diffKind == DiffKind.Removed)
            {
                result.TopTokens = node.TopTokens;
                result.BottomTokens = node.BottomTokens;
                result.Children = node.Children;
            }

            return result;
        }

        private static async Task BuildAPITree(CodePanelData codePanelData, CodePanelRawData codePanelRawData, APITreeNode apiTreeNode, string parentNodeIdHashed, int nodePositionAtLevel, int indent = 0)
        {
            var nodeIdHashed = GetTokenNodeIdHash(codePanelData, apiTreeNode, RowOfTokensPosition.Top);

            if (codePanelData.NodeMetaData.ContainsKey(nodeIdHashed))
            {
                codePanelData.NodeMetaData[nodeIdHashed].ParentNodeIdHashed = parentNodeIdHashed;
            }
            else
            {
                codePanelData.NodeMetaData.TryAdd(nodeIdHashed, new CodePanelNodeMetaData());
                codePanelData.NodeMetaData[nodeIdHashed].ParentNodeIdHashed = parentNodeIdHashed;
            }

            if (codePanelData.NodeMetaData.ContainsKey(parentNodeIdHashed))
            {
                codePanelData.NodeMetaData[parentNodeIdHashed].ChildrenNodeIdsInOrder.TryAdd(nodePositionAtLevel, nodeIdHashed);
            }
            else
            {
                codePanelData.NodeMetaData[parentNodeIdHashed] = new CodePanelNodeMetaData();
                codePanelData.NodeMetaData[parentNodeIdHashed].ChildrenNodeIdsInOrder.TryAdd(nodePositionAtLevel, nodeIdHashed);
            }

            if (_processorCount > 1) // Take advantage of multi-core processors
            {
                await _semaphore.WaitAsync();
                var task = Task.Run(() =>
                {
                    try
                    {
                        BuildNodeTokens(codePanelData, codePanelRawData, apiTreeNode, nodeIdHashed, RowOfTokensPosition.Top, indent);
                    }
                    finally
                    {
                        _semaphore.Release();
                    }
                });
                _tasks.Add(task);
            }
            else
            {
                BuildNodeTokens(codePanelData, codePanelRawData, apiTreeNode, nodeIdHashed, RowOfTokensPosition.Top, indent);
            }


            if (!apiTreeNode.Tags.Contains("HideFromNav"))
            {
                var navIcon = apiTreeNode.Kind.ToLower();
                if (apiTreeNode.Properties.ContainsKey("SubKind"))
                {
                    navIcon = apiTreeNode.Properties["SubKind"].ToLower();
                }

                if (apiTreeNode.Properties.ContainsKey("IconName"))
                {
                    navIcon = apiTreeNode.Properties["IconName"].ToLower();
                }

                var navTreeNode = new NavigationTreeNode()
                {
                    Label = apiTreeNode.Name,
                    Data = new NavigationTreeNodeData()
                    {
                        NodeIdHashed = nodeIdHashed,
                        Kind = apiTreeNode.Properties.ContainsKey("SubKind") ? apiTreeNode.Properties["SubKind"] : apiTreeNode.Kind.ToLower(),
                        Icon = navIcon,
                    },
                    Expanded = true,
                };

                if (codePanelData.NodeMetaData.ContainsKey(nodeIdHashed))
                {
                    codePanelData.NodeMetaData[nodeIdHashed].NavigationTreeNode = navTreeNode;
                }
                else 
                {
                    codePanelData.NodeMetaData.TryAdd(nodeIdHashed, new CodePanelNodeMetaData());
                    codePanelData.NodeMetaData[nodeIdHashed].NavigationTreeNode = navTreeNode;
                }
            }

            for (int idx = 0; idx < apiTreeNode.Children.Count; idx++)
            {
                var node = apiTreeNode.Children[idx];
                await BuildAPITree(codePanelData: codePanelData, codePanelRawData: codePanelRawData, apiTreeNode: node,
                    parentNodeIdHashed: nodeIdHashed, nodePositionAtLevel: idx, indent: indent + 1);       
            };

            if (apiTreeNode.BottomTokens.Any())
            {
                var bottomNodeIdHashed = GetTokenNodeIdHash(codePanelData, apiTreeNode, RowOfTokensPosition.Bottom);
                codePanelData.NodeMetaData[nodeIdHashed].BottomTokenNodeIdHash = bottomNodeIdHashed;
                if (codePanelData.NodeMetaData.ContainsKey(bottomNodeIdHashed))
                {
                    codePanelData.NodeMetaData[bottomNodeIdHashed].ParentNodeIdHashed = parentNodeIdHashed;
                }
                else
                {
                    codePanelData.NodeMetaData.TryAdd(bottomNodeIdHashed, new CodePanelNodeMetaData());
                    codePanelData.NodeMetaData[bottomNodeIdHashed].ParentNodeIdHashed = parentNodeIdHashed;
                }

                BuildNodeTokens(codePanelData, codePanelRawData, apiTreeNode, bottomNodeIdHashed, RowOfTokensPosition.Bottom, indent);
            }
        }

        private static void BuildNodeTokens(CodePanelData codePanelData, CodePanelRawData codePanelRawData, APITreeNode apiTreeNode, string nodeIdHashed, RowOfTokensPosition linesOfTokensPosition, int indent)
        {
            if (apiTreeNode.DiffKind == DiffKind.NoneDiff)
            {
                BuildTokensForNonDiffNodes(codePanelData, codePanelRawData, apiTreeNode, nodeIdHashed, linesOfTokensPosition, indent);
            }
            else
            {
                BuildTokensForDiffNodes(codePanelData, codePanelRawData, apiTreeNode, nodeIdHashed, linesOfTokensPosition, indent);
            }
        }

        private static void BuildTokensForNonDiffNodes(CodePanelData codePanelData, CodePanelRawData codePanelRawData, APITreeNode apiTreeNode, string nodeIdHashed, RowOfTokensPosition linesOfTokensPosition, int indent)
        {
            var tokensInNode = (linesOfTokensPosition == RowOfTokensPosition.Top) ? apiTreeNode.TopTokens : apiTreeNode.BottomTokens;

            var tokensInRow = new List<StructuredToken>();
            var rowClasses = new HashSet<string>();
            var tokenIdsInRow = new HashSet<string>();

            foreach (var token in tokensInNode)
            {
                if (token.Properties.ContainsKey("GroupId"))
                {
                    rowClasses.Add(token.Properties["GroupId"]);
                }

                if (token.Kind == StructuredTokenKind.LineBreak)
                {
                    InsertNonDiffCodePanelRowData(codePanelData: codePanelData, codePanelRawData: codePanelRawData, tokensInRow: new List<StructuredToken>(tokensInRow),
                        rowClasses: new HashSet<string>(rowClasses), tokenIdsInRow: new HashSet<string>(tokenIdsInRow), nodeIdHashed: nodeIdHashed, nodeId: apiTreeNode.Id, indent: indent, linesOfTokensPosition: linesOfTokensPosition);

                    tokensInRow.Clear();
                    rowClasses.Clear();
                    tokenIdsInRow.Clear();
                }
                else 
                {
                    tokensInRow.Add(token);
                    if (!String.IsNullOrWhiteSpace(token.Id))
                    {
                        tokenIdsInRow.Add(token.Id);
                    }
                }
            }

            if (tokensInRow.Any())
            {
                InsertNonDiffCodePanelRowData(codePanelData: codePanelData, codePanelRawData: codePanelRawData, tokensInRow: new List<StructuredToken>(tokensInRow),
                    rowClasses: new HashSet<string>(rowClasses), tokenIdsInRow: new HashSet<string>(tokenIdsInRow), nodeIdHashed: nodeIdHashed, nodeId: apiTreeNode.Id, indent: indent, linesOfTokensPosition: linesOfTokensPosition);

                tokensInRow.Clear();
                rowClasses.Clear();
                tokenIdsInRow.Clear();
            }

            AddDiagnoasticRow(codePanelData, codePanelRawData, apiTreeNode.Id, nodeIdHashed, linesOfTokensPosition);
        }

        private static void BuildTokensForDiffNodes(CodePanelData codePanelData, CodePanelRawData codePanelRawData, APITreeNode apiTreeNode, string nodeIdHashed, RowOfTokensPosition linesOfTokensPosition, int indent)
        {
            var lineGroupBuildOrder = new List<string>() { "doc" };
            var beforeTokens = (linesOfTokensPosition == RowOfTokensPosition.Top) ? apiTreeNode.TopTokens : apiTreeNode.BottomTokens;
            var afterTokens = (linesOfTokensPosition == RowOfTokensPosition.Top) ? apiTreeNode.TopDiffTokens : apiTreeNode.BottomDiffTokens;

            if (apiTreeNode.DiffKind == DiffKind.Added)
            {
                afterTokens = (linesOfTokensPosition == RowOfTokensPosition.Top) ? apiTreeNode.TopTokens : apiTreeNode.BottomTokens;
                beforeTokens = new List<StructuredToken>();
            }

            var beforeTokensInProcess = new Queue<DiffLineInProcess>();
            var afterTokensInProcess = new Queue<DiffLineInProcess>();

            int beforeIndex = 0;
            int afterIndex = 0;

            while (beforeIndex < beforeTokens.Count || afterIndex < afterTokens.Count || beforeTokensInProcess.Count > 0 || afterTokensInProcess.Count > 0)
            {
                var beforeTokenRow = new List<StructuredToken>();
                var afterTokenRow = new List<StructuredToken>();

                var beforeRowClasses = new HashSet<string>();
                var afterRowClasses = new HashSet<string>();

                var beforeTokenIdsInRow = new HashSet<string>();
                var afterTokenIdsInRow = new HashSet<string>();

                var beforeRowGroupId = string.Empty;
                var afterRowGroupId = string.Empty;

                while (beforeIndex < beforeTokens.Count)
                {
                    var token = beforeTokens[beforeIndex++];

                    if (token.Kind == StructuredTokenKind.LineBreak)
                    {
                        break;
                    }

                    if (token.Properties.ContainsKey("GroupId"))
                    {
                        beforeRowGroupId = token.Properties["GroupId"];
                    }
                    else
                    {
                        beforeRowGroupId = string.Empty;
                    }
                    beforeTokenRow.Add(token);
                    if (!String.IsNullOrWhiteSpace(token.Id))
                    {
                        beforeTokenIdsInRow.Add(token.Id);
                    }
                }

                if (beforeTokenRow.Count > 0)
                {
                    beforeTokensInProcess.Enqueue(new DiffLineInProcess() 
                    {
                        GroupId = beforeRowGroupId,
                        RowOfTokens = beforeTokenRow,
                        TokenIdsInRow = new HashSet<string>(beforeTokenIdsInRow)
                    });
                    beforeTokenIdsInRow.Clear();
                }

                while (afterIndex < afterTokens.Count)
                {
                    var token = afterTokens[afterIndex++];

                    if (token.Kind == StructuredTokenKind.LineBreak)
                    {
                        break;
                    }

                    if (token.Properties.ContainsKey("GroupId"))
                    {
                        afterRowGroupId = token.Properties["GroupId"];
                    }
                    else
                    {
                        afterRowGroupId = string.Empty;
                    }
                    afterTokenRow.Add(token);
                    if (!String.IsNullOrWhiteSpace(token.Id))
                    {
                        afterTokenIdsInRow.Add(token.Id);
                    }   
                }

                if (afterTokenRow.Count > 0)
                {
                    afterTokensInProcess.Enqueue(new DiffLineInProcess() 
                    {
                        GroupId = afterRowGroupId,
                        RowOfTokens = afterTokenRow,
                        TokenIdsInRow = new HashSet<string>(afterTokenIdsInRow)
                    });
                    afterTokenIdsInRow.Clear();
                }

                if (beforeTokensInProcess.Count > 0 || afterTokensInProcess.Count > 0)
                {
                    var beforeDiffTokens = new List<StructuredToken>();
                    var afterDiffTokens = new List<StructuredToken>();

                    var beforeTokenIdsInDiffRow = new HashSet<string>();
                    var afterTokenIdsInDiffRow = new HashSet<string>();

                    if (beforeTokensInProcess.Count > 0 && afterTokensInProcess.Count > 0)
                    {
                        if (beforeTokensInProcess.Peek().GroupId == afterTokensInProcess.Peek().GroupId)
                        {
                            if (!String.IsNullOrWhiteSpace(beforeTokensInProcess.Peek().GroupId))
                            {
                                beforeRowClasses.Add(beforeTokensInProcess.Peek().GroupId);
                            }

                            if (!String.IsNullOrWhiteSpace(afterTokensInProcess.Peek().GroupId))
                            {
                                afterRowClasses.Add(afterTokensInProcess.Peek().GroupId);
                            }

                            beforeTokenIdsInDiffRow = beforeTokensInProcess.Peek().TokenIdsInRow;
                            afterTokenIdsInDiffRow = afterTokensInProcess.Peek().TokenIdsInRow;
                            beforeDiffTokens = beforeTokensInProcess.Dequeue().RowOfTokens;
                            afterDiffTokens = afterTokensInProcess.Dequeue().RowOfTokens;
                        }
                        else
                        {
                            var beforeTokenRowBuildOrder = lineGroupBuildOrder.IndexOf(beforeTokensInProcess.Peek().GroupId);
                            var afterTokenRowBuildOrder = lineGroupBuildOrder.IndexOf(afterTokensInProcess.Peek().GroupId);
                            if ((afterTokenRowBuildOrder < 0) || (beforeTokenRowBuildOrder >= 0 && beforeTokenRowBuildOrder < afterTokenRowBuildOrder))
                            {
                                if (!String.IsNullOrWhiteSpace(beforeTokensInProcess.Peek().GroupId))
                                {
                                    beforeRowClasses.Add(beforeTokensInProcess.Peek().GroupId);
                                }
                                beforeTokenIdsInDiffRow = beforeTokensInProcess.Peek().TokenIdsInRow;
                                beforeDiffTokens = beforeTokensInProcess.Dequeue().RowOfTokens;
                            }
                            else
                            {
                                if (!String.IsNullOrWhiteSpace(afterTokensInProcess.Peek().GroupId))
                                {
                                    afterRowClasses.Add(afterTokensInProcess.Peek().GroupId);
                                }
                                afterTokenIdsInDiffRow = afterTokensInProcess.Peek().TokenIdsInRow;
                                afterDiffTokens = afterTokensInProcess.Dequeue().RowOfTokens;
                            }
                        }
                    }
                    else if (beforeTokensInProcess.Count > 0)
                    {
                        if (!String.IsNullOrWhiteSpace(beforeTokensInProcess.Peek().GroupId))
                        {
                            beforeRowClasses.Add(beforeTokensInProcess.Peek().GroupId);
                        }
                        beforeTokenIdsInDiffRow = beforeTokensInProcess.Peek().TokenIdsInRow;
                        beforeDiffTokens = beforeTokensInProcess.Dequeue().RowOfTokens;
                    }
                    else
                    {
                        if (!String.IsNullOrWhiteSpace(afterTokensInProcess.Peek().GroupId))
                        {
                            afterRowClasses.Add(afterTokensInProcess.Peek().GroupId);
                        }
                        afterTokenIdsInDiffRow = afterTokensInProcess.Peek().TokenIdsInRow;
                        afterDiffTokens = afterTokensInProcess.Dequeue().RowOfTokens;
                    }

                    var diffTokenRowResult = ComputeTokenDiff(beforeDiffTokens, afterDiffTokens);

                    if (diffTokenRowResult.HasDiff)
                    {
                        codePanelData.NodeMetaData[nodeIdHashed].IsNodeWithDiff = true;
                        var parentNodeIdHashed = codePanelData.NodeMetaData[nodeIdHashed].ParentNodeIdHashed;
                        while (parentNodeIdHashed != "root" && codePanelData.NodeMetaData.ContainsKey(parentNodeIdHashed))
                        {
                            var parentNode = codePanelData.NodeMetaData[parentNodeIdHashed];
                            parentNode.IsNodeWithDiffInDescendants = true;
                            parentNodeIdHashed = parentNode.ParentNodeIdHashed;
                        }

                        if (diffTokenRowResult.Before.Count > 0)
                        {
                            beforeRowClasses.Add("removed");
                            var rowData = new CodePanelRowData()
                            {
                                Type = (beforeRowClasses.Contains("doc")) ? CodePanelRowDatatype.Documentation : CodePanelRowDatatype.CodeLine,
                                RowOfTokens = diffTokenRowResult.Before,
                                NodeIdHashed = nodeIdHashed,
                                NodeId = apiTreeNode.Id,
                                RowClasses = new HashSet<string>(beforeRowClasses),
                                RowOfTokensPosition = linesOfTokensPosition,
                                Indent = indent,
                                DiffKind = DiffKind.Removed
                            };

                            // Collects comments for the line, needed to set correct icons
                            var commentsForRow = CollectUserCommentsForRow(codePanelRawData, new HashSet<string>(), apiTreeNode.Id, nodeIdHashed, linesOfTokensPosition, rowData);

                            InsertCodePanelRowData(codePanelData: codePanelData, rowData: rowData, nodeIdHashed: nodeIdHashed);
                            beforeRowClasses.Clear();
                        }

                        if (diffTokenRowResult.After.Count > 0)
                        {
                            afterRowClasses.Add("added");
                            var rowData = new CodePanelRowData()
                            {
                                Type = (afterRowClasses.Contains("doc")) ? CodePanelRowDatatype.Documentation : CodePanelRowDatatype.CodeLine,
                                RowOfTokens = diffTokenRowResult.After,
                                NodeIdHashed = nodeIdHashed,
                                NodeId = apiTreeNode.Id,
                                RowClasses = new HashSet<string>(afterRowClasses),
                                RowOfTokensPosition = linesOfTokensPosition,
                                Indent = indent,
                                DiffKind = DiffKind.Added
                            };

                            var commentsForRow = CollectUserCommentsForRow(codePanelRawData, afterTokenIdsInDiffRow, apiTreeNode.Id, nodeIdHashed, linesOfTokensPosition, rowData);
                            InsertCodePanelRowData(codePanelData: codePanelData, rowData: rowData, nodeIdHashed: nodeIdHashed, commentsForRow: commentsForRow);
                            afterRowClasses.Clear();
                        }
                    }
                    else
                    {
                        if (diffTokenRowResult.Before.Count > 0) 
                        {
                            var rowData = new CodePanelRowData()
                            {
                                Type = (beforeRowClasses.Contains("doc")) ? CodePanelRowDatatype.Documentation : CodePanelRowDatatype.CodeLine,
                                RowOfTokens = diffTokenRowResult.Before,
                                NodeIdHashed = nodeIdHashed,
                                NodeId = apiTreeNode.Id,
                                RowClasses = new HashSet<string>(beforeRowClasses),
                                RowOfTokensPosition = linesOfTokensPosition,
                                Indent = indent,
                                DiffKind = DiffKind.Unchanged
                            };
                            var commentsForRow = CollectUserCommentsForRow(codePanelRawData, beforeTokenIdsInDiffRow, apiTreeNode.Id, nodeIdHashed, linesOfTokensPosition, rowData);
                            InsertCodePanelRowData(codePanelData: codePanelData, rowData: rowData, nodeIdHashed: nodeIdHashed, commentsForRow: commentsForRow);
                            beforeRowClasses.Clear();
                        }
                    }
                }
            }

            AddDiagnoasticRow(codePanelData: codePanelData, codePanelRawData: codePanelRawData, nodeId: apiTreeNode.Id, nodeIdHashed: nodeIdHashed, linesOfTokensPosition: linesOfTokensPosition);
        }
        
        private static string GetTokenNodeIdHash(CodePanelData codePanelData, APITreeNode apiTreeNode, RowOfTokensPosition linesOfTokensPosition)
        {
            var idPart = apiTreeNode.Kind;
            int uniqueId = 0;

            if (apiTreeNode.Properties.ContainsKey("SubKind"))
            {
                idPart = $"{idPart}-{apiTreeNode.Properties["SubKind"]}";
            }
            idPart = $"{idPart}-{apiTreeNode.Id}";
            idPart = $"{idPart}-{apiTreeNode.DiffKind}";
            idPart = $"{idPart}-{linesOfTokensPosition.ToString()}";
            var hash = CreateHashFromString(idPart);
            while (codePanelData.NodeMetaData.ContainsKey(hash))
            {
                uniqueId++;
                hash = CreateHashFromString($"{idPart}-{uniqueId}");
            }
            return hash;
        }

        private static string CreateHashFromString(string inputString)
        {
            int hash = inputString.Aggregate(0, (prevHash, currVal) =>
                ((prevHash << 5) - prevHash) + currVal);

            string cssId = "id" + hash.ToString();

            return cssId;
        }

        private static CodePanelRowData CollectUserCommentsForRow(CodePanelRawData codePanelRawData, HashSet<string> tokenIdsInRow, string nodeId, string nodeIdHashed, RowOfTokensPosition linesOfTokensPosition, CodePanelRowData codePanelRowData)
        {
            var commentRowData = new CodePanelRowData();
            var toggleCommentClass = (codePanelRawData.Diagnostics.Any(d => d.TargetId == nodeId) && codePanelRowData.Type == CodePanelRowDatatype.CodeLine) ? "bi bi-chat-right-text show" : "";

            if (tokenIdsInRow.Any())
            {
                toggleCommentClass = (String.IsNullOrWhiteSpace(toggleCommentClass)) ? "bi bi-chat-right-text can-show" : toggleCommentClass;
                codePanelRowData.ToggleCommentsClasses = toggleCommentClass;

                var commentsForRow = codePanelRawData.Comments.Where(c => tokenIdsInRow.Contains(c.ElementId));
                if (commentsForRow.Any())
                {
                    commentRowData.Type = CodePanelRowDatatype.CommentThread;
                    commentRowData.NodeIdHashed = nodeIdHashed;
                    commentRowData.NodeId = nodeId;
                    commentRowData.RowOfTokensPosition = linesOfTokensPosition;
                    commentRowData.RowClasses.Add("user-comment-thread");
                    commentRowData.Comments = commentsForRow.ToList();
                    toggleCommentClass = toggleCommentClass.Replace("can-show", "show");
                    codePanelRowData.ToggleCommentsClasses = toggleCommentClass;
                }
            }
            else
            {
                toggleCommentClass = (!String.IsNullOrWhiteSpace(toggleCommentClass)) ? toggleCommentClass.Replace("can-show", "show") : "bi bi-chat-right-text hide";
                codePanelRowData.ToggleCommentsClasses = toggleCommentClass;
            }
            return commentRowData;
        }

        private static void InsertNonDiffCodePanelRowData(CodePanelData codePanelData, CodePanelRawData codePanelRawData, List<StructuredToken> tokensInRow,
            HashSet<string> rowClasses, HashSet<string> tokenIdsInRow, string nodeIdHashed, string nodeId, int indent, RowOfTokensPosition linesOfTokensPosition)
        {
            var rowData = new CodePanelRowData()
            {
                Type = (rowClasses.Contains("doc")) ? CodePanelRowDatatype.Documentation : CodePanelRowDatatype.CodeLine,
                RowOfTokens = tokensInRow,
                NodeIdHashed = nodeIdHashed,
                RowClasses = new HashSet<string>(rowClasses),
                NodeId = nodeId,
                RowOfTokensPosition = linesOfTokensPosition,
                Indent = indent,
                DiffKind = DiffKind.NoneDiff,
            };

            // Need to collect comments before adding the row to the codePanelData
            var commentsForRow = CollectUserCommentsForRow(codePanelRawData, tokenIdsInRow, nodeId, nodeIdHashed, linesOfTokensPosition, rowData);

            InsertCodePanelRowData(codePanelData: codePanelData, rowData: rowData, nodeIdHashed: nodeIdHashed, commentsForRow: commentsForRow);
        }

        private static void InsertCodePanelRowData(CodePanelData codePanelData, CodePanelRowData rowData, string nodeIdHashed, CodePanelRowData commentsForRow = null)
        {
            if (rowData.Type == CodePanelRowDatatype.Documentation)
            {
                if (codePanelData.NodeMetaData.ContainsKey(nodeIdHashed))
                {
                    codePanelData.NodeMetaData[nodeIdHashed].Documentation.Add(rowData);
                }
                else
                {
                    codePanelData.NodeMetaData.TryAdd(nodeIdHashed, new CodePanelNodeMetaData());
                    codePanelData.NodeMetaData[nodeIdHashed].Documentation.Add(rowData);
                }
            }

            if (rowData.Type == CodePanelRowDatatype.CodeLine)
            {
                if (codePanelData.NodeMetaData.ContainsKey(nodeIdHashed))
                {
                    codePanelData.NodeMetaData[nodeIdHashed].CodeLines.Add(rowData);
                }
                else
                {
                    codePanelData.NodeMetaData.TryAdd(nodeIdHashed, new CodePanelNodeMetaData());
                    codePanelData.NodeMetaData[nodeIdHashed].CodeLines.Add(rowData);
                }
            }

            if (commentsForRow != null && commentsForRow.Type == CodePanelRowDatatype.CommentThread && commentsForRow.Comments.Any())
            {
                if (codePanelData.NodeMetaData.ContainsKey(nodeIdHashed))
                {
                    codePanelData.NodeMetaData[nodeIdHashed].CommentThread.Add(commentsForRow);
                }
                else
                {
                    codePanelData.NodeMetaData.TryAdd(nodeIdHashed, new CodePanelNodeMetaData());
                    codePanelData.NodeMetaData[nodeIdHashed].CommentThread.Add(commentsForRow);
                }
            }
        }

        private static void AddDiagnoasticRow(CodePanelData codePanelData, CodePanelRawData codePanelRawData, string nodeId, string nodeIdHashed, RowOfTokensPosition linesOfTokensPosition)
        {
            if (codePanelRawData.Diagnostics.Any(d => d.TargetId == nodeId) && linesOfTokensPosition != RowOfTokensPosition.Bottom)
            {
                var diagnosticsForRow = codePanelRawData.Diagnostics.Where(d => d.TargetId == nodeId);
                foreach (var diagnostic in diagnosticsForRow)
                {

                    var rowData = new CodePanelRowData()
                    {
                        Type = CodePanelRowDatatype.Diagnostics,
                        NodeIdHashed = nodeIdHashed,
                        NodeId = nodeId,
                        RowOfTokensPosition = linesOfTokensPosition,
                        Diagnostics = diagnostic,
                        RowClasses = new HashSet<string>() { "diagnostics", diagnostic.Level.ToString().ToLower() }
                    };
                    codePanelData.NodeMetaData[nodeIdHashed].Diagnostics.Add(rowData);
                }
            }
        }

        public static (List<StructuredToken> Before, List<StructuredToken> After, bool HasDiff) ComputeTokenDiff(List<StructuredToken> beforeTokens, List<StructuredToken> afterTokens)
        {
            var diffResultA = new List<StructuredToken>();
            var diffResultB = new List<StructuredToken>();
            bool hasDiff = false;

            var beforeTokensMap = beforeTokens.Select((token, index) => new { Key = $"{token.Id}{token.Value}{index}", Value = token })
                                              .ToDictionary(x => x.Key, x => x.Value);

            var afterTokensMap = afterTokens.Select((token, index) => new { Key = $"{token.Id}{token.Value}{index}", Value = token })
                                            .ToDictionary(x => x.Key, x => x.Value);

            foreach (var pair in beforeTokensMap)
            {
                if (afterTokensMap.ContainsKey(pair.Key))
                {
                    diffResultA.Add(new StructuredToken(pair.Value));
                }
                else
                {
                    if (afterTokens.Count > 0)
                    {
                        var token = new StructuredToken(pair.Value);
                        token.RenderClasses.Add("diff-change");
                        diffResultA.Add(token);
                    }
                    else
                    {
                        diffResultA.Add(new StructuredToken(pair.Value));
                    }
                    hasDiff = true;
                }
            }

            foreach (var pair in afterTokensMap)
            {
                if (beforeTokensMap.ContainsKey(pair.Key))
                {
                    diffResultB.Add(new StructuredToken(pair.Value));
                }
                else
                {
                    if (beforeTokens.Count > 0)
                    {
                        var token = new StructuredToken(pair.Value);
                        token.RenderClasses.Add("diff-change");
                        diffResultB.Add(token);
                    }
                    else
                    {
                        diffResultB.Add(new StructuredToken(pair.Value));
                    }
                    hasDiff = true;
                }
            }

            return (diffResultA, diffResultB, hasDiff);
        }
    }
}
