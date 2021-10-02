using System;
using System.Collections.Generic;
using Xunit;
using FluentAssertions;

namespace Stress.Generator.Tests
{
    public class TestPrompter : IPrompter
    {
        public Queue<string> PromptValues;

        public TestPrompter()
        {
            PromptValues = new Queue<string>();
        }

        public void SetResponse(List<string> promptValues)
        {
            PromptValues = new Queue<string>();
            AddResponse(promptValues);
        }

        public void AddResponse(List<string> promptValues)
        {
            for (var i = 0; i < promptValues.Count; i++)
            {
                PromptValues.Enqueue(promptValues[i]);
                if (i == promptValues.Count - 1)
                {
                    PromptValues.Enqueue("n");
                }
                else
                {
                    PromptValues.Enqueue("y");
                }
            }
        }

        public void SetResponse(string promptValue)
        {
            PromptValues = new Queue<string>();
            AddResponse(promptValue);
        }

        public void AddResponse(string promptValue)
        {
            PromptValues.Enqueue(promptValue);
        }

        public string Prompt()
        {
            var response = PromptValues.Dequeue();
            Console.WriteLine($"{response} <-- test prompter");
            return response;
        }
    }

    public class GeneratorTests
    {
        [Fact]
        public void TestPrompt()
        {
            var prompter = new TestPrompter();
            var generator = new Generator(prompter);

            prompter.SetResponse("stringvalue");
            generator.Prompt<string>().Should().Be("stringvalue");

            prompter.SetResponse("1.5");
            generator.Prompt<double>().Should().Be(1.5);
            prompter.SetResponse("1");
            generator.Prompt<double>().Should().Be(1);

            prompter.SetResponse("true");
            generator.Prompt<bool>().Should().Be(true);
            prompter.SetResponse("false");
            generator.Prompt<bool>().Should().Be(false);

            prompter.SetResponse("itemvalue1 itemvalue2 itemvalue3");
            List<string> list = generator.PromptList();
            list.Count.Should().Be(3);
            list[0].Should().Be("itemvalue1");
            list[1].Should().Be("itemvalue2");
            list[2].Should().Be("itemvalue3");
        }

        [Fact]
        public void TestGenerateResource()
        {
            var prompter = new TestPrompter();
            var generator = new Generator(prompter);

            // Test resource name selection
            prompter.AddResponse("JobWithoutAzureResourceDeployment");
            prompter.AddResponse("TestJobName");
            prompter.AddResponse("bash -c sleep 3600");
            prompter.AddResponse("true");

            var resource = (JobWithoutAzureResourceDeployment)generator.GenerateResource();
            resource.Name.Should().Be("TestJobName");
            resource.Command.Should().Equal(new List<string>{"bash", "-c", "sleep", "3600"});

            // Test resource index selector
            prompter.SetResponse("0");
            prompter.AddResponse("TestJobName");
            prompter.AddResponse("binary");
            prompter.AddResponse("true");

            resource = (JobWithoutAzureResourceDeployment)generator.GenerateResource();
            resource.Name.Should().Be("TestJobName");
            resource.Command.Should().Equal(new List<string>{"binary"});
            resource.ChaosEnabled.Should().Be(true);
        }

        [Fact]
        public void TestGenerateOptionalResource()
        {
            var prompter = new TestPrompter();
            var generator = new Generator(prompter);

            prompter.AddResponse("NetworkChaos");
            prompter.AddResponse("TestNetChaos");
            prompter.AddResponse("bing.com");
            prompter.AddResponse("n");

            NetworkChaos resource = (NetworkChaos)generator.GenerateResource();
            resource.ExternalTargets.Should().Equal(new List<string>{"bing.com"});
            resource.Action.Should().Be("loss");
        }

        [Fact]
        public void TestGenerateResources()
        {
            var prompter = new TestPrompter();
            var generator = new Generator(prompter);

            prompter.AddResponse("JobWithoutAzureResourceDeployment");
            prompter.AddResponse("TestJobName");
            prompter.AddResponse("bash -c sleep 3600");
            prompter.AddResponse("true");
            prompter.AddResponse("y");
            prompter.AddResponse("NetworkChaos");
            prompter.AddResponse("TestNetChaos");
            prompter.AddResponse("to");
            prompter.AddResponse("bing.com");
            prompter.AddResponse("LossAction");
            prompter.AddResponse("0.5");
            prompter.AddResponse("0.2");
            prompter.AddResponse("n");

            var resources = generator.GenerateResources();
            var job = (JobWithoutAzureResourceDeployment)resources[0];
            job.Name.Should().Be("TestJobName");
            job.Command.Should().Equal(new List<string>{"bash", "-c", "sleep", "3600"});
            job.ChaosEnabled.Should().Be(true);
            var chaos = (NetworkChaos)resources[1];
            chaos.ExternalTargets.Should().Equal(new List<string>{"bing.com"});
            chaos.Action.Should().Be("loss");
        }

        [Fact]
        public void TestGenerateNestedResources()
        {
            var prompter = new TestPrompter();
            var generator = new Generator(prompter);

            prompter.AddResponse("NetworkChaos");
            prompter.AddResponse("TestNetChaos");
            prompter.AddResponse("to");
            prompter.AddResponse("bing.com");
            prompter.AddResponse("DelayAction");
            prompter.AddResponse("50ms");
            prompter.AddResponse("n");
            prompter.AddResponse("n");
            prompter.AddResponse("y");
            prompter.AddResponse("2");
            prompter.AddResponse("0.5");
            prompter.AddResponse("n");

            var resources = generator.GenerateResources();
            var chaos = (NetworkChaos)resources[0];
            chaos.ExternalTargets.Should().Equal(new List<string>{"bing.com"});
            chaos.Action.Should().BeAssignableTo(typeof(NetworkChaos.DelayAction));
        }
    }
}
