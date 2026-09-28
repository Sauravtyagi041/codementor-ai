export const topics = [
  "Arrays",
  "Strings",
  "Linked Lists",
  "Trees",
  "Graphs",
  "DP",
  "Greedy",
  "Binary Search",
  "STL",
  "OOP",
  "OS",
  "DBMS",
];
import { languageConfigs } from "./languages.ts";
export const languages = languageConfigs.map((config) => config.name);
export type Entry = {
  id: string;
  kind: string;
  title: string;
  data: Record<string, any>;
  created: string;
};
export type Profile = {
  name: string;
  branch?: string;
  level: string;
  dailyGoal: number;
  minutes: number;
  timezone: string;
  timezoneMode?: "automatic" | "manual";
  github: string;
  company: string;
  companies?: string[];
  skills: string;
  bio: string;
  reminder: string;
};
export const defaultProfile: Profile = {
  name: "Your workspace",
  level: "Beginner",
  dailyGoal: 1,
  minutes: 30,
  timezone: "Asia/Kolkata",
  timezoneMode: "automatic",
  github: "",
  company: "General",
  skills: "",
  bio: "",
  reminder: "19:00",
};
export const problems = [
  [
    "two-sum",
    "Two Sum",
    "Arrays",
    "Easy",
    20,
    "Use a lookup to find a pair that adds to a target.",
    "two-sum",
  ],
  [
    "max-profit",
    "Best Time to Buy and Sell Stock",
    "Arrays",
    "Easy",
    20,
    "Track the best earlier purchase price.",
    "best-time-to-buy-and-sell-stock",
  ],
  [
    "product",
    "Product of Array Except Self",
    "Arrays",
    "Medium",
    35,
    "Combine prefix and suffix products without division.",
    "product-of-array-except-self",
  ],
  [
    "anagram",
    "Valid Anagram",
    "Strings",
    "Easy",
    15,
    "Compare character counts.",
    "valid-anagram",
  ],
  [
    "substring",
    "Longest Substring Without Repeating Characters",
    "Strings",
    "Medium",
    35,
    "Move a window while maintaining unique characters.",
    "longest-substring-without-repeating-characters",
  ],
  [
    "reverse-list",
    "Reverse Linked List",
    "Linked Lists",
    "Easy",
    20,
    "Preserve the next pointer before rewiring.",
    "reverse-linked-list",
  ],
  [
    "cycle",
    "Linked List Cycle",
    "Linked Lists",
    "Easy",
    20,
    "Compare pointers moving at different speeds.",
    "linked-list-cycle",
  ],
  [
    "depth",
    "Maximum Depth of Binary Tree",
    "Trees",
    "Easy",
    20,
    "Combine the depths of the two subtrees.",
    "maximum-depth-of-binary-tree",
  ],
  [
    "level-order",
    "Binary Tree Level Order Traversal",
    "Trees",
    "Medium",
    30,
    "Use a queue and process one level at a time.",
    "binary-tree-level-order-traversal",
  ],
  [
    "islands",
    "Number of Islands",
    "Graphs",
    "Medium",
    35,
    "Explore connected land without visiting it twice.",
    "number-of-islands",
  ],
  [
    "courses",
    "Course Schedule",
    "Graphs",
    "Medium",
    40,
    "Detect cycles in prerequisite dependencies.",
    "course-schedule",
  ],
  [
    "stairs",
    "Climbing Stairs",
    "DP",
    "Easy",
    20,
    "Relate the answer to the previous two steps.",
    "climbing-stairs",
  ],
  [
    "coin",
    "Coin Change",
    "DP",
    "Medium",
    45,
    "Store the minimum coins for every smaller amount.",
    "coin-change",
  ],
  [
    "jump",
    "Jump Game",
    "Greedy",
    "Medium",
    30,
    "Maintain the farthest reachable index.",
    "jump-game",
  ],
  [
    "intervals",
    "Non-overlapping Intervals",
    "Greedy",
    "Medium",
    35,
    "Try selecting intervals by earliest ending time.",
    "non-overlapping-intervals",
  ],
  [
    "search",
    "Binary Search",
    "Binary Search",
    "Easy",
    15,
    "Shrink a sorted interval while preserving the target.",
    "binary-search",
  ],
  [
    "rotated",
    "Search in Rotated Sorted Array",
    "Binary Search",
    "Medium",
    35,
    "Identify which half is sorted before choosing a side.",
    "search-in-rotated-sorted-array",
  ],
  [
    "parentheses",
    "Valid Parentheses",
    "STL",
    "Easy",
    20,
    "Use a stack to match the most recent opener.",
    "valid-parentheses",
  ],
  [
    "min-stack",
    "Min Stack",
    "STL",
    "Medium",
    30,
    "Maintain minimum information alongside each stack entry.",
    "min-stack",
  ],
  [
    "lru",
    "LRU Cache",
    "OOP",
    "Medium",
    45,
    "Separate recency ordering from key lookup.",
    "lru-cache",
  ],
].map(([id, title, topic, difficulty, minutes, hint, slug]) => ({
  id: String(id),
  title: String(title),
  topic: String(topic),
  difficulty: String(difficulty),
  minutes: Number(minutes),
  hint: String(hint),
  url: `https://leetcode.com/problems/${slug}/`,
}));
export const companyTopics: Record<string, string[]> = {
  ...Object.fromEntries(
    [
      "TCS",
      "Infosys",
      "Wipro",
      "HCLTech",
      "Tech Mahindra",
      "Cognizant",
      "Accenture",
      "Capgemini",
      "LTIMindtree",
      "Mphasis",
      "Persistent Systems",
      "Coforge",
      "Hexaware",
      "Zensar",
      "Birlasoft",
      "Deloitte",
      "PwC",
      "EY",
      "KPMG",
      "IBM",
      "Oracle",
      "SAP",
      "Cisco",
      "Salesforce",
      "Adobe",
      "ServiceNow",
      "Atlassian",
      "Intuit",
      "Nutanix",
      "VMware",
      "Apple",
      "Meta",
      "Netflix",
      "NVIDIA",
      "Intel",
      "AMD",
      "Qualcomm",
      "Texas Instruments",
      "Samsung",
      "MediaTek",
      "Broadcom",
      "Arm",
      "Synopsys",
      "Cadence",
      "Micron",
      "Flipkart",
      "Walmart Global Tech",
      "Meesho",
      "Swiggy",
      "Zomato",
      "PhonePe",
      "Razorpay",
      "Paytm",
      "Groww",
      "Zerodha",
      "CRED",
      "Zoho",
      "Freshworks",
      "BrowserStack",
      "Postman",
      "PayPal",
      "Uber",
      "Airbnb",
      "Booking.com",
      "Expedia",
      "MakeMyTrip",
      "JPMorgan Chase",
      "Goldman Sachs",
      "Morgan Stanley",
      "Bank of America",
      "Deutsche Bank",
      "Barclays",
      "HSBC",
      "American Express",
      "Visa",
      "Mastercard",
      "Wells Fargo",
      "Siemens",
      "Bosch",
      "Schneider Electric",
      "ABB",
      "Honeywell",
      "GE Aerospace",
      "Larsen & Toubro",
      "Tata Motors",
      "Mahindra & Mahindra",
      "Maruti Suzuki",
      "Ashok Leyland",
      "Bajaj Auto",
      "TVS Motor",
      "Tata Steel",
      "JSW Steel",
      "Reliance Industries",
      "Saint-Gobain",
      "Cummins",
      "Caterpillar",
      "Boeing",
      "Airbus",
      "Alstom",
      "Bharat Electronics",
      "BHEL",
      "NTPC",
      "ONGC",
      "Indian Oil",
    ].map((name) => [name, topics.slice(0, 10)]),
  ),
  General: topics.slice(0, 10),
  Google: ["Graphs", "Trees", "DP", "Binary Search"],
  Microsoft: ["Arrays", "Strings", "Linked Lists", "OOP"],
  Amazon: ["Arrays", "Trees", "Graphs", "STL"],
};
export const quizBank = [
  {
    id: "a1",
    topic: "Arrays",
    q: "An unsorted array has n elements. What is the worst-case cost of finding its maximum?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
    answer: 2,
    why: "Every element may be the maximum, so a single pass is necessary and sufficient.",
  },
  {
    id: "s1",
    topic: "Strings",
    q: "Which invariant helps a sliding window find a substring with no repeated characters?",
    options: [
      "The window is always sorted",
      "Every character in the window is unique",
      "The window always has length two",
      "Only vowels are included",
    ],
    answer: 1,
    why: "Shrink the window until duplicates disappear, then extend it while tracking the best length.",
  },
  {
    id: "l1",
    topic: "Linked Lists",
    q: "Before reversing node.next, which pointer must be preserved?",
    options: [
      "The head only",
      "The current node’s original next",
      "The tail only",
      "No pointer",
    ],
    answer: 1,
    why: "Without saving the original next node, the remainder of the list becomes inaccessible.",
  },
  {
    id: "t1",
    topic: "Trees",
    q: "A breadth-first traversal of a tree normally uses which structure?",
    options: ["Queue", "Stack only", "Heap", "Hash set only"],
    answer: 0,
    why: "A queue processes nodes in arrival order, which visits one depth level before the next.",
  },
  {
    id: "g1",
    topic: "Graphs",
    q: "When does BFS find shortest paths by number of edges?",
    options: [
      "Only in trees",
      "In unweighted graphs",
      "In all weighted graphs",
      "Only with negative weights",
    ],
    answer: 1,
    why: "BFS expands distance layers. Arbitrary weighted edges need a different shortest-path algorithm.",
  },
  {
    id: "d1",
    topic: "DP",
    q: "What distinguishes memoization from plain recursion?",
    options: [
      "Sorting inputs",
      "Caching results for repeated subproblems",
      "Avoiding all loops",
      "Always using constant memory",
    ],
    answer: 1,
    why: "Memoization stores each subproblem result so repeated calls can reuse it.",
  },
  {
    id: "gr1",
    topic: "Greedy",
    q: "What is needed to justify a greedy algorithm?",
    options: [
      "It works on one example",
      "A proof that local choices preserve an optimal solution",
      "The input is small",
      "Recursion",
    ],
    answer: 1,
    why: "An exchange argument or other correctness proof establishes that each greedy choice is safe.",
  },
  {
    id: "b1",
    topic: "Binary Search",
    q: "For ascending sorted numbers, lower_bound returns which position?",
    options: [
      "First element greater than the key",
      "First element not less than the key",
      "Last element equal to the key",
      "Always an existing key",
    ],
    answer: 1,
    why: "It finds the insertion position before any equal elements, or end when all elements are smaller.",
  },
  {
    id: "st1",
    topic: "STL",
    q: "What is the worst-case lookup complexity of std::unordered_map?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
    answer: 2,
    why: "Average lookup is constant, but severe hash collisions can make it linear.",
  },
  {
    id: "o1",
    topic: "OOP",
    q: "Which concept lets callers use an interface without depending on its implementation?",
    options: [
      "Encapsulation and abstraction",
      "Global variables",
      "Copy-paste reuse",
      "Sorting",
    ],
    answer: 0,
    why: "A stable interface hides implementation details and allows the implementation to change.",
  },
  {
    id: "os1",
    topic: "OS",
    q: "Which is one necessary condition for deadlock?",
    options: [
      "Preemptive scheduling",
      "Circular wait",
      "One process only",
      "Unlimited resources",
    ],
    answer: 1,
    why: "Deadlock requires mutual exclusion, hold and wait, no preemption, and circular wait.",
  },
  {
    id: "db1",
    topic: "DBMS",
    q: "Which SQL clause filters groups after aggregation?",
    options: ["WHERE", "ORDER BY", "HAVING", "SELECT DISTINCT"],
    answer: 2,
    why: "WHERE filters rows before aggregation; HAVING filters the resulting groups.",
  },
];
export const lessons = [
  {
    title: "lower_bound",
    topic: "STL",
    body: "Find the first element not less than a value in an ascending sorted range.\nSyntax: auto it = lower_bound(v.begin(), v.end(), key);\nExample: [1,3,3,8], key 3 → index 1.\nComplexity: O(log n) comparisons; iterator movement can be linear for non-random-access iterators.\nCommon mistake: using it on an unsorted vector, or dereferencing end().",
  },
  {
    title: "map vs unordered_map",
    topic: "STL",
    body: "std::map keeps keys ordered and has O(log n) lookup, insertion and deletion. std::unordered_map hashes keys: average O(1), worst-case O(n).\nSyntax: map<int,int> counts; unordered_map<int,int> fastCounts;\nExample: ++counts[7];\nCommon mistake: operator[] inserts a missing key. Use find() or contains() for a membership check.",
  },
  {
    title: "When to use deque",
    topic: "STL",
    body: "A deque supports insertion and removal at both ends in constant time and constant-time indexed access.\nSyntax: deque<int> q; q.push_back(4); q.push_front(2); q.pop_front();\nExample: maintain candidate maxima for a sliding window.\nCommon mistake: treating its storage as contiguous like vector.",
  },
  {
    title: "Breadth-first search",
    topic: "Graphs",
    body: "Visit nodes in increasing distance from a source in an unweighted graph.\nPseudocode: enqueue source; mark visited; while queue nonempty: dequeue v; for each unvisited neighbor: mark and enqueue.\nTime O(V+E), auxiliary space O(V).\nCommon mistake: marking only when removing a node, causing duplicate enqueues. Handle disconnected components with additional starts.",
  },
  {
    title: "Dynamic programming",
    topic: "DP",
    body: "Define a state, a recurrence, base cases and an evaluation order.\nExample: ways[i] = ways[i-1] + ways[i-2] for stairs. Keep only the previous two states to reduce auxiliary space from O(n) to O(1).\nTime equals the number of states times the work per state.\nCommon mistake: an incorrect base case or confusing subsequence with substring.",
  },
  {
    title: "Binary search invariant",
    topic: "Binary Search",
    body: "For a half-open range [lo, hi), preserve the invariant that the answer lies in that range.\nmid = lo + (hi-lo)/2; if a[mid] < target: lo = mid+1; else: hi = mid.\nStop when lo == hi. This is lower_bound.\nTime O(log n), auxiliary space O(1).\nCommon mistake: mixing closed and half-open endpoints.",
  },
  {
    title: "Object-oriented design",
    topic: "OOP",
    body: "Encapsulation groups state and behavior. Abstraction exposes only what callers need. Polymorphism lets implementations share an interface.\nExample: a PaymentMethod interface with separate CardPayment and BankPayment implementations.\nPrefer composition when behavior should vary independently. Avoid deep inheritance and mutable global state.",
  },
  {
    title: "Processes, threads and deadlock",
    topic: "OS",
    body: "A process has an address space; threads in a process share memory and need synchronization. A mutex protects a critical section.\nDeadlock conditions: mutual exclusion, hold and wait, no preemption, circular wait. A consistent lock ordering prevents circular wait.\nCommon mistake: assuming an increment is atomic, or holding a lock while waiting for network I/O.",
  },
  {
    title: "SQL indexes and transactions",
    topic: "DBMS",
    body: "An index helps find matching rows with fewer reads but increases storage and write cost. Composite-index column order matters.\nACID means atomicity, consistency, isolation and durability.\nExample: move money between two accounts within one transaction.\nCommon mistake: building SQL with user input instead of using bound parameters. Check query plans before adding indexes.",
  },
  {
    title: "Arrays and two pointers",
    topic: "Arrays",
    body: "Two pointers can replace repeated pair scans when a monotonic property tells you which pointer to move.\nFor a sorted array and a target sum, move left forward if the sum is too small, otherwise move right backward.\nTime O(n), auxiliary space O(1), excluding any sorting.\nCommon mistake: returning sorted positions when the problem asks for original indices.",
  },
];
export function dayKey(value: Date | string, timezone = "Asia/Kolkata") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}
export function shiftDay(day: string, n: number) {
  const d = new Date(day + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function statistics(
  entries: Entry[],
  profile: Profile,
  now = new Date(),
) {
  const attempts = entries.filter((e) => e.kind === "attempt");
  const today = dayKey(now, profile.timezone);
  const dates = [
    ...new Set(attempts.map((e) => dayKey(e.created, profile.timezone))),
  ].sort();
  let longest = 0,
    run = 0,
    previous = "";
  for (const d of dates) {
    run = previous && shiftDay(previous, 1) === d ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = d;
  }
  let streak = 0,
    cursor = dates.includes(today) ? today : shiftDay(today, -1);
  while (dates.includes(cursor)) {
    streak++;
    cursor = shiftDay(cursor, -1);
  }
  const solved = [
    ...new Set(
      attempts.filter((e) => e.data.solved).map((e) => e.data.problemId),
    ),
  ];
  const byTopic = topics.map((topic) => {
    const a = attempts.filter((e) => e.data.topic === topic);
    const quiz = a.filter((e) => e.data.source === "quiz");
    return {
      topic,
      attempts: a.length,
      solved: new Set(
        a.filter((e) => e.data.solved).map((e) => e.data.problemId),
      ).size,
      accuracy: quiz.length
        ? Math.round(
            (100 * quiz.filter((e) => e.data.correct).length) / quiz.length,
          )
        : null,
      last: a[0]?.created,
      coverage: Math.min(
        100,
        Math.round(
          (new Set(
            a
              .filter((e) => e.data.solved || e.data.correct)
              .map((e) => e.data.problemId || e.data.quizId),
          ).size /
            3) *
            100,
        ),
      ),
    };
  });
  const week = attempts.filter(
    (e) => dayKey(e.created, profile.timezone) >= shiftDay(today, -6),
  );
  const todaySolved = new Set(attempts.filter(
    (e) => e.data.solved && e.data.problemId && dayKey(e.created, profile.timezone) === today,
  ).map(e=>e.data.problemId)).size;
  return {
    today,
    dates,
    streak,
    longest,
    solved: solved.length,
    week: week.length,
    weeklyDays: new Set(week.map((e) => dayKey(e.created, profile.timezone)))
      .size,
    todaySolved,
    byTopic,
    coverage: Math.round(
      byTopic.slice(0, 10).reduce((s, t) => s + t.coverage, 0) / 10,
    ),
    minutes: week.reduce((s, e) => s + Number(e.data.minutes || 0), 0),
  };
}
export function similarity(a: string, b: string) {
  const tokens = (s: string) =>
    new Set(
      (
        s
          .replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, "")
          .match(/[A-Za-z_$][\w$]*|\d+|[^\s\w]/g) || []
      ).map((t) => (/^\d+$/.test(t) ? "#" : t)),
    );
  const x = tokens(a),
    y = tokens(b);
  if (!x.size || !y.size) return 0;
  return Math.round(
    (100 * [...x].filter((t) => y.has(t)).length) / new Set([...x, ...y]).size,
  );
}
export function staticReview(code: string, language: string) {
  const findings: string[] = [];
  const lines = code.split("\n");
  const repeated = lines.map((l) => l.trim()).filter((l) => l.length > 18);
  const duplicates = [
    ...new Set(repeated.filter((l, i) => repeated.indexOf(l) !== i)),
  ];
  if (duplicates.length)
    findings.push(
      `Repeated lines worth inspecting: ${duplicates.slice(0, 3).join(" | ")}`,
    );
  if (/==(?!=)/.test(code) && language === "JavaScript")
    findings.push(
      "Loose equality found. Check whether coercion is intentional; consider ===.",
    );
  if (/\b(var)\s/.test(code) && language === "JavaScript")
    findings.push(
      "var has function scope. Consider const or let for clearer block scope.",
    );
  if (/\b(eval|exec)\s*\(/.test(code))
    findings.push(
      "Dynamic evaluation found. Never pass untrusted text into it.",
    );
  if (/\.sort\(\s*\)/.test(code) && language === "JavaScript")
    findings.push(
      "sort() without a comparator sorts strings. Numeric order usually needs (a, b) => a - b.",
    );
  if (/\b(for|while)\b/.test(code))
    findings.push(
      "Loops detected. Check termination and bounds; nesting alone does not prove asymptotic complexity.",
    );
  if (/\bprint|console\.log|System\.out/.test(code))
    findings.push(
      "Output statements detected. Remove debug output if the judge expects an exact format.",
    );
  return [
    "STATIC CHECK • heuristic, not AI or execution",
    ...(findings.length
      ? findings
      : ["No supported pattern found. This does not establish correctness."]),
    "Test ideas: empty input, one element, duplicates, negative values, large inputs, and boundary indices.",
    "General complexity cannot be reliably inferred by this checker. Use an AI review for an estimate and verify its assumptions.",
  ].join("\n\n");
}
