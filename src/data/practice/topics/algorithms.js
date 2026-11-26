// ── Practice bank: dynamic programming & greedy ─────────────────────────────
// Table answers (knapsack value, LCS, coin counts, interval counts) are computed
// by the same recurrences taught on the course pages.

import { conceptBatch, list, makeRng, mcq, randInt, uniqueBy } from '../core.js';

const DP_CONCEPTS = [
  { lvl: 'easy', q: 'Dynamic programming combines which two properties?', a: 'Overlapping subproblems and optimal substructure', d: ['Greedy choice and recursion', 'Hashing and sorting', 'Divide and conquer only'], e: 'DP stores repeated subproblem answers and builds optimal solutions from optimal parts.' },
  { lvl: 'medium', q: 'What is memoization?', a: 'Caching the results of recursive calls', d: ['Filling a table iteratively', 'Sorting the input first', 'Removing overlapping work by hashing inputs'], e: 'Top-down DP stores each subproblem result before returning it.' },
  { lvl: 'medium', q: 'What is tabulation?', a: 'Filling a DP table bottom-up', d: ['Recursing with a cache', 'Sorting subproblems', 'Using a greedy choice'], e: 'Tabulation computes smaller states first and fills the table iteratively.' },
  { lvl: 'easy', q: 'What is the naive time complexity of recursive Fibonacci?', a: 'O(2ⁿ)', d: ['O(n)', 'O(n log n)', 'O(n²)'], e: 'Each call branches into two overlapping calls.' },
  { lvl: 'medium', q: 'What is the time complexity of Fibonacci with memoization?', a: 'O(n)', d: ['O(2ⁿ)', 'O(log n)', 'O(n²)'], e: 'Each of n states is computed once.' },
  { lvl: 'medium', q: 'What is the state in the 0/1 knapsack DP?', a: 'Best value using the first i items and capacity c', d: ['The value of item i only', 'The total weight only', 'The number of items'], e: 'The table entry dp[i][c] covers a prefix of items and a capacity.' },
  { lvl: 'medium', q: 'What is the time complexity of the 0/1 knapsack DP for n items and capacity W?', a: 'O(nW)', d: ['O(n log W)', 'O(2ⁿ)', 'O(W²)'], e: 'The table has n × W states, each filled in constant time.' },
  { lvl: 'medium', q: 'Why is the knapsack DP called pseudo-polynomial?', a: 'Its runtime depends on the numeric value of W, not just the input size', d: ['It uses floating point', 'It is always exponential', 'It never fills a table'], e: 'W can be exponentially large in the number of bits used to encode it.' },
  { lvl: 'medium', q: 'What distinguishes 0/1 knapsack from unbounded knapsack?', a: 'Each item can be used at most once', d: ['Items cannot be split', 'Capacity is unlimited', 'Weights are always 1'], e: 'Unbounded knapsack may reuse the same item repeatedly.' },
  { lvl: 'medium', q: 'In the unbounded knapsack recurrence, which direction is the capacity loop?', a: 'Increasing, so items can be reused', d: ['Decreasing, to avoid reuse', 'Random', 'It does not matter'], e: 'Increasing capacity allows the current item again.' },
  { lvl: 'easy', q: 'The LCS of "ABCBDAB" and "BDCABA" has length what?', a: '4', d: ['3', '5', '6'], e: 'BCBA and BDAB are both common subsequences of length 4.' },
  { lvl: 'medium', q: 'What does the LCS DP recurrence do when the two characters match?', a: 'Add 1 to the diagonal value', d: ['Take the maximum of the top and left', 'Reset the cell to 0', 'Swap the characters'], e: 'A match extends the LCS of the two prefixes.' },
  { lvl: 'medium', q: 'What is the time complexity of the standard LCS DP?', a: 'O(mn)', d: ['O(m + n)', 'O(log mn)', 'O(2^(m+n))'], e: 'The table has one cell per pair of prefix lengths.' },
  { lvl: 'medium', q: 'What is the time complexity of coin change with DP for amount A and c coin types?', a: 'O(cA)', d: ['O(A²)', 'O(2^A)', 'O(c log A)'], e: 'Every amount is combined with every coin type.' },
  { lvl: 'medium', q: 'Which problem does the recurrence dp[i] = min(dp[i − coin] + 1) solve?', a: 'Minimum coins to make an amount', d: ['Maximum coins in a bag', 'Longest common subsequence', 'Number of paths'], e: 'Each choice of last coin adds one to a smaller subproblem.' },
  { lvl: 'medium', q: 'Edit distance between two strings measures what?', a: 'The minimum insertions, deletions and substitutions to transform one into the other', d: ['Their length difference', 'The number of shared characters', 'Their alphabetical order'], e: 'The DP considers the three edit operations.' },
  { lvl: 'medium', q: 'What is the time complexity of edit distance for lengths m and n?', a: 'O(mn)', d: ['O(m + n)', 'O(n²) only', 'O(2ⁿ)'], e: 'Each cell pairs a prefix of each string.' },
  { lvl: 'hard', q: 'What does the optimal substructure property mean?', a: 'An optimal solution contains optimal solutions to its subproblems', d: ['Every subproblem has a unique answer', 'Greedy choices always work', 'The input must be sorted'], e: 'DP builds the global optimum from optimal subparts.' },
  { lvl: 'hard', q: 'When does a problem NOT fit dynamic programming?', a: 'When subproblems are not independent or do not overlap structurally', d: ['When it has a recurrence', 'When it can be tabulated', 'When it has optimal substructure'], e: 'DP needs a well-defined state whose optimal value composes.' },
  { lvl: 'medium', q: 'Which problem is commonly solved with DP rather than a greedy choice?', a: '0/1 Knapsack', d: ['Activity selection', 'Fractional knapsack', 'Huffman coding'], e: 'Greedy ratio ordering fails when items cannot be split.' },
  { lvl: 'medium', q: 'What is the space complexity of the 0/1 knapsack DP with a 1D rolling array?', a: 'O(W)', d: ['O(nW)', 'O(n)', 'O(1)'], e: 'Only the current capacity row is needed.' },
  { lvl: 'hard', q: 'When using a 1D knapsack array, why must capacity iterate downward?', a: 'To prevent using the same item more than once', d: ['To sort the items', 'To reduce space to O(1)', 'To allow reuse of items'], e: 'Descending capacity reads values from before the current item was considered.' },
  { lvl: 'medium', q: 'Longest increasing subsequence can be computed in which time with binary search?', a: 'O(n log n)', d: ['O(n²)', 'O(n)', 'O(2ⁿ)'], e: 'Patience sorting maintains the smallest tail per length.' },
  { lvl: 'medium', q: 'What is the DP state for longest increasing subsequence?', a: 'The best length ending at each index', d: ['The value of the last element only', 'The array length', 'The number of distinct values'], e: 'dp[i] is the LIS length ending at position i.' },
  { lvl: 'medium', q: 'Matrix chain multiplication DP minimizes what?', a: 'The number of scalar multiplications', d: ['The matrix dimensions', 'The number of matrices', 'Memory allocation time'], e: 'The parenthesization changes the multiplication cost.' },
  { lvl: 'medium', q: 'What is the complexity of matrix chain multiplication DP?', a: 'O(n³)', d: ['O(n²)', 'O(n)', 'O(2ⁿ)'], e: 'There are O(n²) subproblems, each trying O(n) split points.' },
  { lvl: 'medium', q: 'Which DP computes all-pairs shortest paths?', a: 'Floyd-Warshall', d: ['Dijkstra', 'Prim', 'Kruskal'], e: 'It considers each intermediate vertex in turn.' },
  { lvl: 'hard', q: 'What is the recurrence for the number of ways to climb n stairs taking 1 or 2 steps?', a: 'f(n) = f(n − 1) + f(n − 2)', d: ['f(n) = 2f(n − 1)', 'f(n) = f(n − 3)', 'f(n) = n'], e: 'The last move is either a 1-step or a 2-step.' },
  { lvl: 'medium', q: 'Which technique reduces DP space from O(nW) to O(W) in knapsack?', a: 'A rolling 1D array', d: ['Memoization with a hash map', 'Sorting the items', 'Recursion without caching'], e: 'Only the previous item row matters.' },
  { lvl: 'medium', q: 'What is the base case of the LCS DP?', a: 'An empty prefix has LCS length 0', d: ['The first characters must match', 'The table starts at 1', 'Both strings must have equal length'], e: 'Comparing any prefix with an empty string yields 0.' },
  { lvl: 'medium', q: 'Which problem counts the number of distinct paths in a grid?', a: 'Grid path DP where dp[i][j] = dp[i−1][j] + dp[i][j−1]', d: ['Bin packing', 'Activity selection', 'Huffman coding'], e: 'Each cell is reached from above or from the left.' },
  { lvl: 'hard', q: 'What does the Bellman equation express?', a: 'The optimal value of a state in terms of successor states', d: ['The sorted order of states', 'The greedy choice at each step', 'The hash of a state'], e: 'It is the recursive backbone of DP and reinforcement learning.' },
  { lvl: 'medium', q: 'Which DP problem uses two sequences and a match/mismatch cost?', a: 'Edit distance', d: ['Activity selection', 'Fractional knapsack', 'Counting sort'], e: 'Substitution, insertion and deletion costs build the table.' },
  { lvl: 'medium', q: 'What is the first step when designing a DP solution?', a: 'Define the state precisely', d: ['Sort the input', 'Write the code', 'Choose a hash function'], e: 'The state determines the recurrence and table dimensions.' },
  { lvl: 'medium', q: 'Which of these is an overlapping subproblem?', a: 'Fibonacci(5) needing Fibonacci(4) and Fibonacci(3), where Fibonacci(4) also needs Fibonacci(3)', d: ['Sorting two independent halves', 'Reading an array element', 'Comparing two strings once'], e: 'The same subproblem appears on multiple paths.' },
  { lvl: 'hard', q: 'Memoization trades which resource for speed?', a: 'Memory', d: ['Correctness', 'Input size', 'Output size'], e: 'Cached results consume memory to avoid recomputation.' },
  { lvl: 'medium', q: 'Which problem can be solved by both greedy and DP but greedy is simpler?', a: 'Activity selection', d: ['0/1 Knapsack', 'Longest common subsequence', 'Matrix chain multiplication'], e: 'Earliest-finish ordering is provably optimal for intervals.' },
  { lvl: 'hard', q: 'What is the DP for the minimum number of coins when no combination exists?', a: 'The state stays at infinity', d: ['The state becomes 0', 'The state becomes −1', 'The algorithm throws an error'], e: 'Unreachable amounts keep an infinite cost.' },
  { lvl: 'medium', q: 'What does the term “optimal substructure” allow a DP to do?', a: 'Reuse optimal answers of smaller states', d: ['Skip all subproblems', 'Guarantee linear time', 'Avoid defining a recurrence'], e: 'The optimum composes from optima of smaller states.' },
  { lvl: 'medium', q: 'Which of these has exponential naive recursion but linear DP?', a: 'Fibonacci numbers', d: ['Binary search', 'Merge sort', 'Bubble sort'], e: 'Overlapping calls make naive Fibonacci exponential; memoization makes it linear.' },
  { lvl: 'medium', q: 'In the coin change DP, dp[0] is set to what?', a: '0', d: ['1', 'Infinity', 'The smallest coin'], e: 'Zero amount needs zero coins.' },
];

const GREEDY_EASY_CONCEPTS = [
  { lvl: 'easy', q: 'A greedy algorithm makes which kind of choice at each step?', a: 'The best choice available right now', d: ['A random choice', 'The choice that looks worst later', 'Every possible choice in turn'], e: 'Greedy commits to the locally optimal option and never reconsiders.' },
  { lvl: 'easy', q: 'Does a greedy algorithm always find the optimal solution?', a: 'No, only when the problem has the greedy-choice property', d: ['Yes, for every problem', 'Never', 'Only on sorted input'], e: 'Counterexamples exist whenever a local choice blocks a better global solution.' },
  { lvl: 'easy', q: 'Which problem is solved optimally by a simple greedy algorithm?', a: 'Activity selection', d: ['0/1 knapsack', 'Longest common subsequence', 'Optimal binary search tree'], e: 'Picking the activity with the earliest finish time is provably optimal.' },
  { lvl: 'easy', q: 'For fractional knapsack, greedy sorts items by which key?', a: 'Value per unit weight', d: ['Total value', 'Weight alone', 'Insertion order'], e: 'Taking the highest value-to-weight ratio first fills the capacity best.' },
  { lvl: 'easy', q: 'Is greedy optimal for 0/1 knapsack?', a: 'No, it can miss the best combination', d: ['Yes, always', 'Yes, if items are sorted', 'Only when weights are equal'], e: 'A high-ratio item can block a combination with greater total value.' },
  { lvl: 'easy', q: 'Greedy coin change with coins {1, 5, 10} for amount 12 uses how many coins?', a: '3', d: ['2', '4', '12'], e: 'Greedy takes 10 then 1 then 1, which is optimal here.' },
  { lvl: 'easy', q: 'What is a feasible solution?', a: 'One that satisfies every constraint', d: ['One with the lowest cost', 'One that uses every input', 'One produced by a heuristic'], e: 'Feasibility is about constraints; optimality is about the objective.' },
  { lvl: 'easy', q: 'What does optimal substructure mean?', a: 'An optimal solution contains optimal solutions to subproblems', d: ['The problem has no subproblems', 'Every subproblem is greedy', 'The input is already sorted'], e: 'It is the property that lets dynamic programming combine smaller optima.' },
  { lvl: 'easy', q: 'How does greedy differ from dynamic programming?', a: 'Greedy never revisits earlier choices', d: ['Greedy stores every subproblem result', 'Greedy is always slower', 'Greedy considers all choices'], e: 'DP may reconsider choices through a table; greedy commits once.' },
  { lvl: 'easy', q: 'Huffman coding greedily merges which two nodes?', a: 'The two with the smallest frequencies', d: ['The two with the largest frequencies', 'The two deepest nodes', 'A random pair'], e: 'Repeatedly merging the rarest symbols builds an optimal prefix code.' },
  { lvl: 'easy', q: 'Is Dijkstra’s algorithm greedy?', a: 'Yes — it finalises the nearest unvisited vertex', d: ['No, it is exhaustive search', 'No, it is dynamic programming', 'Only on unweighted graphs'], e: 'Settling the minimum tentative distance is a greedy choice that is safe with non-negative weights.' },
  { lvl: 'easy', q: 'Kruskal’s MST algorithm processes edges in which order?', a: 'Ascending weight', d: ['Descending weight', 'Insertion order', 'Random order'], e: 'Adding the cheapest edge that avoids a cycle builds a minimum spanning tree.' },
];

const GREEDY_CONCEPTS = [
  { lvl: 'easy', q: 'What defines a greedy algorithm?', a: 'It makes the best local choice at each step without backtracking', d: ['It tries every possibility', 'It sorts the final answer', 'It uses a hash table'], e: 'Greedy commits to a locally optimal decision.' },
  { lvl: 'medium', q: 'Which two properties must hold for a greedy algorithm to be optimal?', a: 'Greedy choice property and optimal substructure', d: ['Overlapping subproblems and memoization', 'Hashing and sorting', 'Stability and in-place operation'], e: 'A locally optimal choice must lead to a globally optimal solution.' },
  { lvl: 'medium', q: 'Activity selection chooses activities in which order?', a: 'Earliest finishing time first', d: ['Latest start time first', 'Shortest duration first', 'Largest duration first'], e: 'Finishing earliest leaves the most room for later activities.' },
  { lvl: 'medium', q: 'Which problem is solved optimally by sorting by value/weight ratio?', a: 'Fractional knapsack', d: ['0/1 Knapsack', 'Activity selection', 'Longest common subsequence'], e: 'With splittable items, the ratio order is optimal.' },
  { lvl: 'medium', q: 'Why does greedy fail for 0/1 knapsack?', a: 'A locally best item can block a better combination', d: ['Items cannot be compared', 'The capacity is too small', 'There are no weights'], e: 'Taking the best ratio item may leave unused capacity.' },
  { lvl: 'hard', q: 'What is a counterexample to greedy coin change?', a: 'Coins {1, 3, 4} for amount 6', d: ['Coins {1, 5, 10} for amount 25', 'Coins {1, 2} for amount 5', 'Coins {1} for amount 3'], e: 'Greedy takes 4 + 1 + 1 (three coins) while 3 + 3 uses two.' },
  { lvl: 'medium', q: 'Which coin system makes greedy coin change optimal?', a: 'Canonical systems such as {1, 5, 10, 25}', d: ['Any set of powers of 3', 'Any set containing 4', 'Every arbitrary set'], e: 'Canonical systems satisfy the greedy choice property.' },
  { lvl: 'medium', q: 'Which greedy algorithm finds a minimum spanning tree?', a: 'Kruskal’s algorithm', d: ['Dijkstra’s algorithm', 'Bellman-Ford', 'Floyd-Warshall'], e: 'Kruskal adds the cheapest edge that does not create a cycle.' },
  { lvl: 'medium', q: 'What is the cut property in MST algorithms?', a: 'The cheapest edge crossing a cut belongs to some MST', d: ['Every edge in the graph is in every MST', 'The longest edge is always excluded', 'Only edges of one vertex matter'], e: 'Both Prim and Kruskal rely on this property.' },
  { lvl: 'medium', q: 'Huffman coding greedily merges which two nodes?', a: 'The two lowest-frequency nodes', d: ['The two highest-frequency nodes', 'The two deepest nodes', 'The root and a leaf'], e: 'Rare symbols end up with longer codes.' },
  { lvl: 'medium', q: 'Huffman coding produces which kind of code?', a: 'A prefix-free variable-length code', d: ['A fixed-length code', 'A run-length code', 'An encrypted code'], e: 'No codeword is a prefix of another.' },
  { lvl: 'medium', q: 'Which shortest-path algorithm is greedy?', a: 'Dijkstra’s algorithm', d: ['Bellman-Ford', 'Floyd-Warshall', 'A* without a heuristic'], e: 'Dijkstra settles the closest unsettled vertex each step.' },
  { lvl: 'medium', q: 'Why can Dijkstra’s greedy choice fail with negative edges?', a: 'A later negative edge can reduce an already settled distance', d: ['Negative edges are not comparable', 'The heap cannot store negatives', 'It changes the graph size'], e: 'Settled distances are assumed final.' },
  { lvl: 'medium', q: 'Job sequencing with deadlines maximizes what?', a: 'Total profit of scheduled jobs', d: ['Number of jobs only', 'Average deadline', 'Total duration'], e: 'Profitable jobs are placed in the latest free slot before their deadlines.' },
  { lvl: 'medium', q: 'Which greedy order is used for job sequencing with deadlines?', a: 'Decreasing profit', d: ['Increasing deadline', 'Increasing profit', 'Random order'], e: 'High-profit jobs are considered first.' },
  { lvl: 'medium', q: 'What is the greedy strategy for the minimum number of platforms?', a: 'Sort arrival and departure times and sweep', d: ['Sort by train number', 'Take the longest train first', 'Use a stack'], e: 'The sweep tracks overlapping intervals.' },
  { lvl: 'medium', q: 'Which problem is NOT solvable by a simple greedy choice?', a: 'Longest common subsequence', d: ['Activity selection', 'Fractional knapsack', 'Huffman coding'], e: 'LCS requires comparing alternatives, which DP handles.' },
  { lvl: 'hard', q: 'What is an exchange argument used for?', a: 'Proving that a greedy choice can replace an optimal solution’s choice', d: ['Sorting the input', 'Computing a hash', 'Detecting cycles'], e: 'It shows the greedy decision is safe.' },
  { lvl: 'medium', q: 'Which greedy approach solves interval covering with the fewest points?', a: 'Sort by right endpoint and place a point at each uncovered end', d: ['Sort by left endpoint and place a point at the start', 'Pick random points', 'Use the midpoint of all intervals'], e: 'Right endpoints cover the most remaining intervals.' },
  { lvl: 'medium', q: 'What is the complexity of greedy activity selection after sorting?', a: 'O(n log n) for the sort, then O(n)', d: ['O(n²)', 'O(2ⁿ)', 'O(log n)'], e: 'Sorting dominates; the scan is linear.' },
  { lvl: 'medium', q: 'In Huffman coding, what does a longer codeword mean?', a: 'The symbol is less frequent', d: ['The symbol is more frequent', 'The symbol is uppercase', 'The code is invalid'], e: 'Frequent symbols receive shorter codes.' },
  { lvl: 'medium', q: 'Which data structure efficiently merges Huffman nodes?', a: 'A priority queue (min-heap)', d: ['A stack', 'A queue', 'A hash set'], e: 'The two minimum weights are repeatedly extracted.' },
  { lvl: 'hard', q: 'What is the total cost of building a Huffman tree for n symbols?', a: 'O(n log n)', d: ['O(n)', 'O(n²)', 'O(2ⁿ)'], e: 'Each symbol is pushed once and merged once with heap operations.' },
  { lvl: 'medium', q: 'Which property makes the fractional knapsack greedy choice safe?', a: 'Items can be split, so capacity is always fully used by the best ratio', d: ['All weights are equal', 'All values are equal', 'Items must be taken whole'], e: 'Splitting removes the blocking problem of 0/1 knapsack.' },
  { lvl: 'medium', q: 'Greedy algorithms usually do not do which of the following?', a: 'Reconsider earlier choices', d: ['Sort the input', 'Use a priority queue', 'Scan the input once'], e: 'No backtracking means a wrong early choice is never undone.' },
  { lvl: 'medium', q: 'Which problem uses greedy interval scheduling with the earliest deadline?', a: 'Minimizing maximum lateness', d: ['Longest common subsequence', 'Matrix chain multiplication', 'Edit distance'], e: 'Earliest-deadline-first is optimal for that objective.' },
  { lvl: 'hard', q: 'What is a matroid in the context of greedy algorithms?', a: 'A structure whose independent sets make greedy optimal', d: ['A type of hash table', 'A balanced tree', 'A sorting network'], e: 'Greedy works on matroids when weights are considered in order.' },
  { lvl: 'medium', q: 'What is the greedy choice for the coin change problem?', a: 'Take the largest coin that fits', d: ['Take the smallest coin', 'Take a random coin', 'Take the median coin'], e: 'That local choice is optimal only for canonical coin systems.' },
  { lvl: 'medium', q: 'Which condition makes a greedy algorithm produce a non-optimal answer?', a: 'A local optimum that prevents a better global combination', d: ['A sorted input', 'A connected graph', 'A low load factor'], e: 'Greedy’s blindness to future consequences is the risk.' },
  { lvl: 'medium', q: 'Kruskal’s algorithm rejects an edge when which condition holds?', a: 'Its endpoints are already in the same component', d: ['It is the cheapest edge', 'It connects two components', 'It has the largest weight'], e: 'Adding it would create a cycle.' },
  { lvl: 'medium', q: 'Prim’s algorithm adds which edge at each step?', a: 'The cheapest edge leaving the current tree', d: ['The cheapest edge in the graph', 'The longest edge', 'A random incident edge'], e: 'The tree grows outward along the minimum crossing edge.' },
  { lvl: 'medium', q: 'Which greedy algorithm is used for data compression?', a: 'Huffman coding', d: ['Dijkstra', 'Kruskal', 'Prim'], e: 'Frequent symbols get shorter prefix-free codes.' },
  { lvl: 'medium', q: 'What is the greedy strategy for the Egyptian fraction problem?', a: 'Repeatedly subtract the largest unit fraction that fits', d: ['Use the smallest unit fraction', 'Split into equal fractions', 'Use decimal fractions'], e: 'Each step takes the largest possible unit fraction.' },
  { lvl: 'medium', q: 'Which problem’s greedy solution sorts by start time and is wrong?', a: 'Activity selection', d: ['Fractional knapsack', 'Huffman coding', 'Job sequencing'], e: 'Activity selection must sort by finishing time, not start time.' },
  { lvl: 'medium', q: 'What does it mean that greedy algorithms are “myopic”?', a: 'They optimize only the current step', d: ['They cannot see the input', 'They require sorted data', 'They use recursion'], e: 'Future consequences are ignored.' },
  { lvl: 'hard', q: 'Which technique can turn a greedy heuristic into an exact algorithm?', a: 'Add backtracking or dynamic programming over choices', d: ['Sort the input again', 'Remove the priority queue', 'Use a bigger hash table'], e: 'Exactness requires exploring alternatives.' },
];

function knapsack(items, capacity) {
  const n = items.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));
  for (let i = 1; i <= n; i += 1) {
    const { w, v } = items[i - 1];
    for (let c = 0; c <= capacity; c += 1) {
      dp[i][c] = dp[i - 1][c];
      if (w <= c) dp[i][c] = Math.max(dp[i][c], dp[i - 1][c - w] + v);
    }
  }
  const chosen = [];
  let c = capacity;
  for (let i = n; i > 0; i -= 1) {
    if (dp[i][c] !== dp[i - 1][c]) {
      chosen.push(items[i - 1].name);
      c -= items[i - 1].w;
    }
  }
  return { best: dp[n][capacity], chosen: chosen.reverse() };
}

function lcs(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  let i = a.length;
  let j = b.length;
  const chars = [];
  while (i > 0 && j > 0) {
    if (a[i - 1] === b[j - 1]) {
      chars.push(a[i - 1]);
      i -= 1;
      j -= 1;
    } else if (dp[i - 1][j] >= dp[i][j - 1]) i -= 1;
    else j -= 1;
  }
  return { length: dp[a.length][b.length], text: chars.reverse().join('') };
}

function minCoins(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let value = 1; value <= amount; value += 1) {
    for (const coin of coins) {
      if (coin <= value && dp[value - coin] + 1 < dp[value]) dp[value] = dp[value - coin] + 1;
    }
  }
  return dp[amount];
}

function greedyCoins(coins, amount) {
  const sorted = [...coins].sort((a, b) => b - a);
  let remaining = amount;
  let used = 0;
  for (const coin of sorted) {
    while (remaining >= coin) {
      remaining -= coin;
      used += 1;
    }
  }
  return remaining === 0 ? used : Infinity;
}

function activitySelection(activities) {
  const sorted = [...activities].sort((a, b) => a.finish - b.finish);
  const chosen = [];
  let lastFinish = -Infinity;
  for (const activity of sorted) {
    if (activity.start >= lastFinish) {
      chosen.push(activity.name);
      lastFinish = activity.finish;
    }
  }
  return chosen;
}

function fractionalKnapsack(items, capacity) {
  const sorted = [...items].sort((a, b) => b.v / b.w - a.v / a.w);
  let remaining = capacity;
  let value = 0;
  for (const item of sorted) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, item.w);
    value += (item.v / item.w) * take;
    remaining -= take;
  }
  return Number(value.toFixed(2));
}

const NAMES = ['A', 'B', 'C', 'D', 'E'];

export function buildDynamicProgrammingQuestions() {
  const rand = makeRng(0x4de1);
  const qs = [];

  // Fibonacci states.
  const fib = [0, 1];
  for (let i = 2; i <= 20; i += 1) fib.push(fib[i - 1] + fib[i - 2]);
  [5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36].forEach((n) => {
    qs.push(mcq({
      id: `dp-fib-${n}`,
      topic: 'dynamic-programming',
      difficulty: 'easy',
      question: `Using the recurrence F(n) = F(n − 1) + F(n − 2) with F(0) = 0 and F(1) = 1, what is F(${n})?`,
      correct: `${fib[n]}`,
      distractors: [fib[n] + 1, fib[n - 1], fib[n] + fib[n - 1]],
      explanation: `The sequence gives F(${n}) = ${fib[n]}.`,
    }, rand));
  });
  [8, 10, 12, 15, 20, 25, 30].forEach((n) => {
    qs.push(mcq({
      id: `dp-fib-states-${n}`,
      topic: 'dynamic-programming',
      difficulty: 'medium',
      question: `How many distinct Fibonacci values are computed by the memoized algorithm for F(${n})?`,
      correct: `${n + 1}`,
      distractors: [`${n}`, `${2 ** n}`, `${n * 2}`],
      explanation: 'Memoization computes F(0) through F(n) exactly once each.',
    }, rand));
  });

  // 0/1 Knapsack.
  for (let i = 0; i < 25; i += 1) {
    const capacity = randInt(rand, 6, 14);
    const items = Array.from({ length: randInt(rand, 3, 4) }, (_, index) => ({
      name: NAMES[index],
      w: randInt(rand, 1, 6),
      v: randInt(rand, 2, 15),
    }));
    const { best, chosen } = knapsack(items, capacity);
    const description = items.map((item) => `${item.name}(w=${item.w}, v=${item.v})`).join(', ');
    qs.push(mcq({
      id: `dp-knapsack-${i}`,
      topic: 'dynamic-programming',
      difficulty: 'hard',
      question: `0/1 knapsack with capacity ${capacity} and items ${description}. What is the maximum total value?`,
      correct: `${best}`,
      distractors: [best + 1, best + 3, Math.max(0, best - 2)],
      explanation: `The DP over items and capacities gives an optimal value of ${best}.`,
    }, rand));
    qs.push(mcq({
      id: `dp-knapsack-items-${i}`,
      topic: 'dynamic-programming',
      difficulty: 'hard',
      question: `0/1 knapsack with capacity ${capacity} and items ${description}. Which set of items achieves the optimum?`,
      correct: chosen.length ? list(chosen) : 'Take no items',
      distractors: [
        list(items.slice(0, Math.max(1, chosen.length)).map((item) => item.name)),
        list(items.slice(-Math.max(1, chosen.length)).map((item) => item.name)),
        list(items.map((item) => item.name)),
      ],
      explanation: `Backtracking the DP table selects ${chosen.length ? chosen.join(', ') : 'no items'} for value ${best}.`,
    }, rand));
  }

  // LCS.
  const LCS_PAIRS = [
    ['ABCBDAB', 'BDCABA'], ['AGGTAB', 'GXTXAYB'], ['ABC', 'AC'], ['XYZW', 'XYWZ'],
    ['ABAB', 'BABA'], ['ABCDEF', 'ACE'], ['STONE', 'LONGEST'], ['DYNAMIC', 'PROGRAM'],
    ['ABCXYZ', 'ACXZ'], ['SUNNY', 'WINNY'], ['ABCDGH', 'AEDFHR'], ['OLD', 'GOLD'],
    ['COMPUTER', 'HOUSEBOAT'], ['ALGORITHM', 'LOGARITHM'], ['TREE', 'STREE'], ['BANANA', 'ANANAS'],
    ['PEN', 'PENCIL'], ['SUN', 'SUNDAY'], ['FISH', 'FINISH'], ['STACK', 'SNACK'],
    ['GRAPH', 'GREP'], ['QUEUE', 'QUEEN'], ['NODE', 'CODE'], ['TRIE', 'TREE'],
  ];
  LCS_PAIRS.forEach(([a, b], i) => {
    const result = lcs(a, b);
    qs.push(mcq({
      id: `dp-lcs-length-${i}`,
      topic: 'dynamic-programming',
      difficulty: 'medium',
      question: `What is the length of the longest common subsequence of "${a}" and "${b}"?`,
      correct: `${result.length}`,
      distractors: [`${result.length + 1}`, `${Math.max(0, result.length - 1)}`, `${Math.min(a.length, b.length)}`],
      explanation: `The LCS has length ${result.length}; one example is "${result.text}".`,
    }, rand));
    qs.push(mcq({
      id: `dp-lcs-text-${i}`,
      topic: 'dynamic-programming',
      difficulty: 'hard',
      question: `Which string is a longest common subsequence of "${a}" and "${b}"?`,
      correct: result.text || '(none)',
      distractors: [
        a.split('').filter((char) => b.includes(char)).join(''),
        b.slice(0, result.length),
        `${result.text}x`,
      ],
      explanation: `Backtracking the LCS table yields "${result.text}" of length ${result.length}.`,
    }, rand));
  });

  // Coin change.
  const COIN_SETS = [
    [[1, 2, 5], 11], [[1, 3, 4], 6], [[2, 5], 9], [[1, 5, 10, 25], 63],
    [[1, 2, 5, 10], 27], [[3, 7], 11], [[1, 4, 5], 8], [[2, 3, 7], 12],
    [[1, 6, 10], 18], [[5, 7], 13], [[1, 9, 10], 18], [[2, 4], 7],
    [[1, 3, 5], 14], [[4, 5, 9], 13], [[1, 2, 3], 10], [[2, 4, 6], 9],
    [[3, 4, 11], 20], [[1, 8, 9], 24], [[5, 6, 7], 18], [[2, 7, 11], 21], [[1, 12, 15], 29],
  ];
  COIN_SETS.forEach(([coins, amount], i) => {
    const optimal = minCoins(coins, amount);
    const greedy = greedyCoins(coins, amount);
    qs.push(mcq({
      id: `dp-coins-${i}`,
      topic: 'dynamic-programming',
      difficulty: 'medium',
      question: `With coins ${list(coins)} and amount ${amount}, what is the minimum number of coins?`,
      correct: optimal === Infinity ? 'Impossible' : `${optimal}`,
      distractors: [`${optimal + 1}`, `${Math.max(1, optimal - 1)}`, `${amount}`],
      explanation: optimal === Infinity
        ? 'No combination of these coins reaches the amount.'
        : `The coin-change DP finds a minimum of ${optimal} coins.`,
    }, rand));
    qs.push(mcq({
      id: `dp-coins-greedy-${i}`,
      topic: 'dynamic-programming',
      difficulty: 'hard',
      question: `For coins ${list(coins)} and amount ${amount}, greedy takes the largest coin first. Is its answer optimal?`,
      correct: greedy === optimal ? 'Yes, greedy matches the optimum' : `No, greedy uses ${greedy === Infinity ? 'no valid' : greedy} coins instead of ${optimal === Infinity ? 'no valid' : optimal}`,
      distractors: [
        greedy === optimal ? 'No, greedy is worse' : 'Yes, greedy matches the optimum',
        'Only if the coins are sorted ascending',
        'Only when the amount is odd',
      ],
      explanation: greedy === optimal
        ? 'This coin system is canonical, so the greedy choice is optimal.'
        : `Greedy gives ${greedy} coins while the DP optimum is ${optimal}.`,
    }, rand));
  });

  return uniqueBy(
    [...qs, ...conceptBatch({ topic: 'dynamic-programming', prefix: 'dp', concepts: DP_CONCEPTS, rand })],
    (question) => question.id,
  );
}

export function buildGreedyQuestions() {
  const rand = makeRng(0x9a2d);
  const qs = [];

  // Activity selection.
  for (let i = 0; i < 50; i += 1) {
    const activities = Array.from({ length: 5 }, (_, index) => {
      const start = randInt(rand, 0, 12);
      return { name: NAMES[index], start, finish: start + randInt(rand, 1, 6) };
    });
    const chosen = activitySelection(activities);
    const description = activities.map((activity) => `${activity.name}[${activity.start},${activity.finish})`).join(', ');
    qs.push(mcq({
      id: `greedy-activity-count-${i}`,
      topic: 'greedy',
      difficulty: 'medium',
      question: `Activities are ${description}. Using earliest-finish greedy, what is the maximum number of non-overlapping activities?`,
      correct: `${chosen.length}`,
      distractors: [chosen.length + 1, Math.max(1, chosen.length - 1), activities.length],
      explanation: `Earliest-finish selection keeps ${chosen.join(', ')}.`,
    }, rand));
    qs.push(mcq({
      id: `greedy-activity-set-${i}`,
      topic: 'greedy',
      difficulty: 'hard',
      question: `Activities are ${description}. Which set does earliest-finish greedy select?`,
      correct: chosen.length ? list(chosen) : 'No activities',
      distractors: [
        list(activities.map((activity) => activity.name)),
        list([activities[0].name]),
        list([...activities].sort((a, b) => a.start - b.start).slice(0, 2).map((activity) => activity.name)),
      ],
      explanation: `Sorting by finish time and skipping overlaps selects ${chosen.join(', ')}.`,
    }, rand));
  }

  // Fractional knapsack.
  for (let i = 0; i < 34; i += 1) {
    const capacity = randInt(rand, 8, 20);
    const items = Array.from({ length: 3 }, (_, index) => ({
      name: NAMES[index],
      w: randInt(rand, 2, 10),
      v: randInt(rand, 4, 25),
    }));
    const value = fractionalKnapsack(items, capacity);
    const description = items.map((item) => `${item.name}(w=${item.w}, v=${item.v})`).join(', ');
    qs.push(mcq({
      id: `greedy-fractional-${i}`,
      topic: 'greedy',
      difficulty: 'hard',
      question: `Fractional knapsack with capacity ${capacity} and items ${description}. Sorting by value/weight, what is the maximum value?`,
      correct: `${value}`,
      distractors: [`${(value + 1).toFixed(2)}`, `${Math.max(0, value - 1).toFixed(2)}`, `${value.toFixed(2)}`.replace(/^/, '') + '5'],
      explanation: `Taking the best ratio first, then a fraction of the next item, gives ${value}.`,
    }, rand));
  }

  // Greedy coin change optimality.
  const COIN_CASES = [
    [[1, 3, 4], 6], [[1, 5, 10], 28], [[1, 5, 10, 25], 63], [[1, 2, 5, 10], 27],
    [[1, 4, 5], 8], [[1, 6, 10], 18], [[2, 5, 7], 15], [[1, 3, 4], 8],
    [[1, 5, 6], 10], [[1, 10, 25], 40], [[3, 5, 8], 14], [[1, 7, 10], 16],
    [[2, 3, 4], 11], [[1, 4, 6], 9], [[5, 8, 10], 19], [[1, 2, 9], 15],
  ];
  COIN_CASES.forEach(([coins, amount], i) => {
    const greedy = greedyCoins(coins, amount);
    const optimal = minCoins(coins, amount);
    qs.push(mcq({
      id: `greedy-coins-${i}`,
      topic: 'greedy',
      difficulty: 'hard',
      question: `Coins ${list(coins)}, amount ${amount}. How many coins does the greedy algorithm use?`,
      correct: greedy === Infinity ? 'No valid answer' : `${greedy}`,
      distractors: [`${optimal}`, `${greedy === Infinity ? 1 : greedy + 1}`, `${amount}`],
      explanation: greedy === Infinity
        ? 'Greedy cannot make the amount with these coins.'
        : `Greedy takes the largest fitting coin repeatedly, using ${greedy} coins (optimal is ${optimal}).`,
    }, rand));
  });

  // Job sequencing.
  for (let i = 0; i < 19; i += 1) {
    const jobs = Array.from({ length: 4 }, (_, index) => ({
      name: NAMES[index],
      deadline: randInt(rand, 1, 4),
      profit: randInt(rand, 5, 30),
    }));
    const slots = [false, false, false, false];
    let total = 0;
    for (const job of [...jobs].sort((a, b) => b.profit - a.profit)) {
      for (let slot = Math.min(job.deadline, 4) - 1; slot >= 0; slot -= 1) {
        if (!slots[slot]) {
          slots[slot] = true;
          total += job.profit;
          break;
        }
      }
    }
    qs.push(mcq({
      id: `greedy-jobs-${i}`,
      topic: 'greedy',
      difficulty: 'hard',
      question: `Jobs ${jobs.map((job) => `${job.name}(deadline ${job.deadline}, profit ${job.profit})`).join(', ')}. What maximum profit can be scheduled?`,
      correct: `${total}`,
      distractors: [total + 5, Math.max(0, total - 5), jobs.reduce((sum, job) => sum + job.profit, 0)],
      explanation: `Considering jobs by decreasing profit and placing each in the latest free slot gives ${total}.`,
    }, rand));
  }

  return uniqueBy(
    [...qs, ...conceptBatch({ topic: 'greedy', prefix: 'greedy', concepts: [...GREEDY_CONCEPTS, ...GREEDY_EASY_CONCEPTS], rand })],
    (question) => question.id,
  );
}
