﻿using APIView;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace APIViewWeb.Models
{
    public class AssemblyModel
    {
        public AssemblyModel(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public int Id { get; set; }

        [Required]
        [Display(Name = "DLL Path")]
        public string DllPath { get; set; }

        [Display(Name = "Display String")]
        public string DisplayString { get; set; }

        // test DLL: C:\Users\t-mcpat\Documents\azure-sdk-tools\artifacts\bin\TestLibrary\Debug\netcoreapp2.1\TestLibrary.dll
        public AssemblyModel()
        {
            this.DisplayString = "<empty>";
            this.DllPath = "null";
        }

        public AssemblyModel(string dllPath, string fileName)
        {
            AssemblyAPIV assembly = null;
            foreach (AssemblyAPIV a in AssemblyAPIV.AssembliesFromFile(dllPath))
            {
                if (fileName.EndsWith(".dll") && a.Name.Equals(fileName.Remove(fileName.IndexOf('.'))))
                    assembly = a;
            }
            this.DisplayString = assembly.ToString();
            this.DllPath = dllPath;
        }
    }
}
