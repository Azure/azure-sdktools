// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

using Azure.SDK.ChangelogGen.Compare;
using Azure.SDK.ChangelogGen.Report;

namespace Azure.SDK.ChangelogGen.Tests
{
    [TestClass]
    public class TestApiComparer
    {
        [TestMethod]
        public void TestCompareApiFile()
        {
            string content1 = File.ReadAllText("apiFile1.cs.txt");
            string content2 = File.ReadAllText("apiFile2.cs.txt");
            ChangeLogResult r = new ChangeLogResult();
            r.ApiChange = Program.CompareApi(content2, content1);
            Release release = r.GenerateReleaseNote("1.2.3", "2030.3.3", new List<ChangeCatogory>() { ChangeCatogory.Obsoleted });

            string baseline =
@"## 1.2.3 (2030.3.3)

### Breaking Changes

- Removed method 'String MethodToBeDeleted()' in type Azure.ResourceManager.AppService.TestMethod
- Removed method 'String MethodToChangeReturnType()' in type Azure.ResourceManager.AppService.TestMethod
- Removed method 'String MethodToChangeParameter()' in type Azure.ResourceManager.AppService.TestMethod
- Removed property 'String PropertyToBeDeleted' in type Azure.ResourceManager.AppService.TestProperty
- Removed property method 'Get' for 'String PropertyToChangeToSet' in type Azure.ResourceManager.AppService.TestProperty
- Removed property method 'Set' for 'String PropertyToChangeToGet' in type Azure.ResourceManager.AppService.TestProperty
- Removed type 'Azure.ResourceManager.AppService.TypeToBeDeleted'

### Other Changes

- Obsoleted method 'String MethodToBeObsoleted()' in type Azure.ResourceManager.AppService.TestMethod
- Obsoleted property 'String PropertyToBeObsoleted' in type Azure.ResourceManager.AppService.TestProperty
- Obsoleted type 'Azure.ResourceManager.AppService.TypeToBeObsoleted'";
            string actual = release.ToString();
            Assert.AreEqual(baseline.Replace("\r\n", "\n"), actual.Replace("\r\n", "\n"));
        }
    }

}
