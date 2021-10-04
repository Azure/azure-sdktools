﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Stress.Generator
{
    public class Generator
    {
        public IPrompter Prompter;

        public static List<IResource> ResourceTypes = new List<IResource>{
            new JobWithoutAzureResourceDeployment(),
            new JobWithAzureResourceDeployment(),
            new NetworkChaos(),
        };

        public Generator()
        {
            Prompter = new Prompter();
        }

        public Generator(IPrompter prompter)
        {
            Prompter = prompter;
        }

        public List<IResource> GenerateResources()
        {
            var resources = new List<IResource>();
            PromptMultiple(() => resources.Add(GenerateResource()), "Enter another resource?");
            return resources;
        }

        public IResource GenerateResource()
        {
            var resourceTypeNames = ResourceTypes.Select(t => t.GetType().Name).ToList();
            var resourceTypeHelp = ResourceTypes.Select(t => t.Help).ToList();
            var selection = PromptMultipleChoice(resourceTypeNames, resourceTypeHelp, "Which resource would you like to generate? Available resources are:");
            var resourceType = ResourceTypes.Where(t => t.GetType().Name == selection);

            var resource = PrompSetResourceProperties(resourceType.First().GetType());

            resource.Render();
            return resource;
        }

        public IResource PrompSetResourceProperties(Type resourceType)
        {
            var resource = Activator.CreateInstance(resourceType) as IResource;
            if (resource == null)
            {
                throw new NullReferenceException();
            }

            foreach (var prop in resource.Properties())
            {
                PromptSetProperty(resource, prop.Info, prop.Property.Help);
            }

            foreach (var prop in resource.OptionalProperties())
            {
                PromptSetOptionalProperty(resource, prop);
            }

            foreach (var prop in resource.NestedProperties())
            {
                PromptSetNestedProperty(resource, prop);
            }

            foreach (var prop in resource.OptionalNestedProperties())
            {
                PromptSetOptionalNestedProperty(resource, prop);
            }

            return resource;
        }

        public void PromptSetOptionalProperty(IResource resource, ResourcePropertyInfo<OptionalResourceProperty> prop)
        {
            var set = "";
            while (set != "y" && set != "n")
            {
                set = Prompt<string>($"Set a value for optional property {prop.Info.Name}? (y/n): ");
            }
            if (set == "y")
            {
                PromptSetProperty(resource, prop.Info, prop.Property.Help);
            }
        }

        public void PromptSetProperty(IResource resource, PropertyInfo prop, string help)
        {
            Console.WriteLine($"--> {prop.Name} ({help})");

            var propType = Nullable.GetUnderlyingType(prop.PropertyType) ?? prop.PropertyType;

            if (propType == typeof(string))
            {
                resource.SetProperty(prop, Prompt<string>($"(string): "));
            }
            else if (propType == typeof(double))
            {
                resource.SetProperty(prop, Prompt<double>($"(number): "));
            }
            else if (propType == typeof(int))
            {
                resource.SetProperty(prop, Prompt<int>($"(number): "));
            }
            else if (propType == typeof(bool))
            {
                resource.SetProperty(prop, Prompt<bool>($"(true/false): "));
            }
            else if (propType == typeof(List<string>))
            {
                resource.SetProperty(prop, PromptList($"(list item string): "));
            }
            else
            {
                throw new Exception($"Unsupported value type: {prop.PropertyType.Name}");
            }
        }

        public void PromptSetNestedProperty(IResource resource, ResourcePropertyInfo<NestedResourceProperty> prop)
        {
            var resourceTypeMap = prop.Property.Types.ToDictionary(t => t.Name, t => t);
            var resourceTypeHelp = prop.Property.Types.Select(t =>
            {
                var r = Activator.CreateInstance(t) as IResource;
                return r?.Help ?? "";
            }).ToList();

            Type? resourceType = null;
            while (resourceType == null)
            {
                var selection = "";
                if (resourceTypeMap.Count == 1)
                {
                    selection = resourceTypeMap.Keys.First();
                }
                else
                {
                    selection = PromptMultipleChoice(
                                        resourceTypeMap.Keys.ToList(),
                                        resourceTypeHelp,
                                        $"Select a type of {prop.Info.PropertyType.Name}"
                                    );
                }
                resourceTypeMap.TryGetValue(selection, out resourceType);
            }

            var nestedResource = PrompSetResourceProperties(resourceType);
            resource.SetProperty(prop.Info, nestedResource);
        }

        public void PromptSetOptionalNestedProperty(IResource resource, ResourcePropertyInfo<OptionalNestedResourceProperty> prop)
        {
            var set = "";
            while (set != "y" && set != "n")
            {
                set = Prompt<string>($"Set a value for optional property {prop.Info.Name}? (y/n): ");
            }
            if (set == "y")
            {
                var nestedProp = new ResourcePropertyInfo<NestedResourceProperty>(prop.Info, prop.Property.AsNestedResourceProperty());
                PromptSetNestedProperty(resource, nestedProp);
            }
        }

        private List<string> PadStrings(IEnumerable<string> left)
        {
            var leftSize = left.OrderBy(s => s.Length).Last().Length;
            return left.Select(s => s + new string(' ', leftSize - s.Length)).ToList();
        }

        public string PromptMultipleChoice(List<string> options, List<string> help, string promptMessage)
        {
            if (options.Count != help.Count)
            {
                throw new Exception("Expected multiple choice options to be the same length as options help.");
            }

            var padded = PadStrings(options);
            var selected = "";

            while (string.IsNullOrEmpty(selected))
            {
                Console.WriteLine(promptMessage);
                for (int i = 0; i < padded.Count; i++)
                {
                    Console.WriteLine($"    ({i}) {padded[i]} - {help[i]}");
                }

                var optionSelection = Prompt<string>();
                if (uint.TryParse(optionSelection, out var idx) && idx < options.Count)
                {
                    optionSelection = options[(int)idx];
                }
                selected = options.Find(o => o == optionSelection);
            }

            return selected;
        }

        public List<string> PromptList(string promptMessage = "(list item value):")
        {
            return Prompt<string>("(space separated list): ").Split(' ').ToList();
        }

        public T Prompt<T>(string promptMessage = "(value): ")
        {
            var retryMessage = $"Invalid value, expected {typeof(T)}: ";
            Console.Write(promptMessage);
            var value = Prompter.Prompt();

            if (typeof(T) == typeof(string))
            {
                return (T)(object)value;
            }

            if (typeof(T) == typeof(double))
            {
                if (!double.TryParse(value, out double parsed))
                {
                    return Prompt<T>(retryMessage);
                }
                return (T)(object)parsed;
            }

            if (typeof(T) == typeof(int))
            {
                if (!int.TryParse(value, out int parsed))
                {
                    return Prompt<T>(retryMessage);
                }
                return (T)(object)parsed;
            }

            if (typeof(T) == typeof(bool))
            {
                if (!bool.TryParse(value, out bool parsed))
                {
                    return Prompt<T>(retryMessage);
                }
                return (T)(object)parsed;
            }

            throw new Exception($"Unsupported value {typeof(T)}");
        }

        public void PromptMultiple(Action promptAction, string message)
        {
            var another = "y";
            while (true)
            {
                if (another == "n")
                {
                    break;
                }
                else if (another == "y")
                {
                    promptAction();
                }

                Console.Write(message + " (y/n): ");
                another = Prompter.Prompt();
            }
        }
    }
}
