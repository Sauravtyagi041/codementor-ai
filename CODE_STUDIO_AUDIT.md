# Code Studio checks — 2026-09-14

Verified live in browser: stopwatch start/pause/reset; hint expansion; problem drawer; Next-question replacement of statement, starter and sample inputs; JavaScript real execution (3/3 target-pair tests including alternate valid indices); local Prettier formatting; AI complexity response.

Verified independently: 27 original reference solutions, 80 sample tests; all 20 configured Judge0 language starters; C++ and Julia print-42 executions via Compiler Explorer. These provider smoke tests are not full language-specific end-to-end application tests.

Fixes: stale AI results ignored after editor/question change; formatting preserves undo snapshot and no longer uses AI for unsupported formatters; generated exercise drafts retained when changing problems; problem-specific JavaScript starter restored.

Remaining: PowerShell execution unsupported; formatting only available for configured Prettier parsers; GitHub live push not tested in this audit; original exercise generation correctness not independently established; no full external statement import; no hidden-test submission judge/acceptance rate. AI response live check revealed an incorrect space comparison, so prompts strengthened, not claimed to guarantee correctness.

No fake accepted submissions or fake completion data were recorded during testing.
