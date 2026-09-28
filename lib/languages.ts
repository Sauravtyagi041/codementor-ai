export const languageConfigs = [
  {
    name: "JavaScript",
    extension: "js",
    parser: "babel",
    template:
      'function solve() {\n  console.log("Hello, CodeMentor!");\n}\n\nsolve();\n',
  },
  {
    name: "TypeScript",
    extension: "ts",
    parser: "typescript",
    template:
      'function solve(message: string): void {\n  console.log(message);\n}\n\nsolve("Hello, CodeMentor!");\n',
  },
  {
    name: "Python",
    extension: "py",
    template:
      'def solve():\n    print("Hello, CodeMentor!")\n\nif __name__ == "__main__":\n    solve()\n',
  },
  {
    name: "C++",
    extension: "cpp",
    template:
      '#include <iostream>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    cout << "Hello, CodeMentor!\\n";\n    return 0;\n}\n',
  },
  {
    name: "C",
    extension: "c",
    template:
      '#include <stdio.h>\n\nint main(void) {\n    printf("Hello, CodeMentor!\\n");\n    return 0;\n}\n',
  },
  {
    name: "Java",
    extension: "java",
    template:
      'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeMentor!");\n    }\n}\n',
  },
  {
    name: "C#",
    extension: "cs",
    template:
      'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Hello, CodeMentor!");\n    }\n}\n',
  },
  {
    name: "Go",
    extension: "go",
    template:
      'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello, CodeMentor!")\n}\n',
  },
  {
    name: "Rust",
    extension: "rs",
    template: 'fn main() {\n    println!("Hello, CodeMentor!");\n}\n',
  },
  {
    name: "Kotlin",
    extension: "kt",
    template: 'fun main() {\n    println("Hello, CodeMentor!")\n}\n',
  },
  {
    name: "Swift",
    extension: "swift",
    template: 'import Foundation\n\nprint("Hello, CodeMentor!")\n',
  },
  {
    name: "PHP",
    extension: "php",
    template:
      '<?php\nfunction solve() {\n    echo "Hello, CodeMentor!\\n";\n}\nsolve();\n',
  },
  {
    name: "Ruby",
    extension: "rb",
    template: 'def solve\n  puts "Hello, CodeMentor!"\nend\n\nsolve\n',
  },
  {
    name: "Dart",
    extension: "dart",
    template: 'void main() {\n  print("Hello, CodeMentor!");\n}\n',
  },
  {
    name: "Scala",
    extension: "scala",
    template:
      'object Main {\n  def main(args: Array[String]): Unit = {\n    println("Hello, CodeMentor!")\n  }\n}\n',
  },
  {
    name: "R",
    extension: "r",
    template: 'message <- "Hello, CodeMentor!"\nprint(message)\n',
  },
  {
    name: "Julia",
    extension: "jl",
    template:
      'function solve()\n    println("Hello, CodeMentor!")\nend\n\nsolve()\n',
  },
  {
    name: "Lua",
    extension: "lua",
    template:
      'local function solve()\n    print("Hello, CodeMentor!")\nend\n\nsolve()\n',
  },
  {
    name: "Perl",
    extension: "pl",
    template: 'use strict;\nuse warnings;\n\nprint "Hello, CodeMentor!\\n";\n',
  },
  {
    name: "Haskell",
    extension: "hs",
    template: 'main :: IO ()\nmain = putStrLn "Hello, CodeMentor!"\n',
  },
  {
    name: "Elixir",
    extension: "ex",
    template:
      'defmodule Main do\n  def solve do\n    IO.puts("Hello, CodeMentor!")\n  end\nend\n\nMain.solve()\n',
  },
  {
    name: "Bash",
    extension: "sh",
    template:
      '#!/usr/bin/env bash\nset -euo pipefail\n\nprintf "%s\\n" "Hello, CodeMentor!"\n',
  },
  {
    name: "PowerShell",
    extension: "ps1",
    template:
      'function Invoke-Solve {\n    Write-Output "Hello, CodeMentor!"\n}\n\nInvoke-Solve\n',
  },
  {
    name: "SQL",
    extension: "sql",
    template: "SELECT 'Hello, CodeMentor!' AS message;\n",
  },
  {
    name: "HTML",
    extension: "html",
    parser: "html",
    template:
      '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <title>My first page</title>\n  </head>\n  <body>\n    <h1>Hello, CodeMentor!</h1>\n  </body>\n</html>\n',
  },
  {
    name: "CSS",
    extension: "css",
    parser: "css",
    template:
      "body {\n  font-family: system-ui, sans-serif;\n  color: #192337;\n  background: #f7f9fc;\n}\n",
  },
  {
    name: "JSON",
    extension: "json",
    parser: "json",
    template: '{\n  "project": "CodeMentor",\n  "learning": true\n}\n',
  },
  {
    name: "YAML",
    extension: "yaml",
    parser: "yaml",
    template: "project: CodeMentor\nlearning: true\n",
  },
  {
    name: "Markdown",
    extension: "md",
    parser: "markdown",
    template:
      "# My learning notes\n\n## What I learned\n\n- Add a useful idea here.\n",
  },
  {
    name: "Plain text / Other",
    extension: "txt",
    template:
      "Write your code here. Specify the language and version in the problem context before asking for AI help.\n",
  },
];
export function languageFromFilename(name: string) {
  const extension = name.split(".").at(-1)?.toLowerCase();
  const aliases: Record<string, string> = {
    cc: "C++",
    cxx: "C++",
    hpp: "C++",
    h: "C",
    jsx: "JavaScript",
    tsx: "TypeScript",
    yml: "YAML",
    exs: "Elixir",
  };
  return (
    aliases[extension || ""] ||
    languageConfigs.find((c) => c.extension === extension)?.name ||
    "Plain text / Other"
  );
}
