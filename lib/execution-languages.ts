// Fixed server-owned IDs from the public Judge0 CE runtime catalog.
export const judgeLanguages: Record<string, number> = {
  TypeScript: 101, Python: 100, C: 103, Java: 91, 'C#': 51,
  Go: 107, Rust: 108, Kotlin: 111, Swift: 83, PHP: 98, Ruby: 72,
  Dart: 90, Scala: 81, R: 80, Lua: 64, Perl: 85, Haskell: 61,
  Elixir: 57, Bash: 46, SQL: 82,
};
export const previewLanguages = ['HTML', 'CSS', 'Markdown', 'JSON', 'YAML', 'Plain text / Other'];
export const canExecute = (language: string) => language === 'JavaScript' || language === 'C++' || language === 'Julia' || Object.hasOwn(judgeLanguages,language);
