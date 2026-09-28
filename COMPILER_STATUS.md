# Code Studio execution — 2026-09-13

23 programming languages are connected: JavaScript in the browser; C++17 and Julia 1.10 through Compiler Explorer; TypeScript, Python, C, Java, C#, Go, Rust, Kotlin, Swift, PHP, Ruby, Dart, Scala, R, Lua, Perl, Haskell, Elixir, Bash and SQL through Judge0 CE.

All 20 Judge0 language templates were tested against the public service. R 4.4.1 timed out even for print(5); R 4.0.0 passed and is selected. Julia print(5) and C++ execution were tested separately. JavaScript retains its sandboxed iframe/worker runner. These smoke tests are not comprehensive language conformance tests.

HTML/CSS have an isolated preview with scripts and network disabled. Markdown renders through the existing safe Markdown component. JSON parses and pretty-prints; YAML uses Prettier's YAML parser. Plain text has a document preview.

PowerShell is the sole unconnected programming runtime. It remains editable with an explicit unavailable message; no simulated execution. The public Piston execution API returns 401 and requires whitelisting or a self-hosted instance. Do not run user-submitted PowerShell directly on the application host as a workaround.

Remote code/input are sent to the named public providers. No paid key or subscription is configured. Availability is not guaranteed. The app caps remote test requests at 100/user/UTC day. Judge0 limits CPU to 3 seconds, wall time to 10 seconds, disables program networking, and bounds generated files; API wait is bounded at 45 seconds. UI truncation is an error, never a passing result. Cancellation stops waiting and later tests; provider jobs may finish independently.

Syntax-valid documents and passing custom test cases do not imply judge acceptance. This change does not push code to an external coding platform or mark its problems solved.
