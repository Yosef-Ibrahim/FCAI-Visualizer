import { GreedyAlgorithm } from './GreedyAlgorithm';
import { Step } from '../../../domain/algorithms/Step';

const LINES = {
  SORT: { js: 1, python: 1, cpp: 1, java: 1, csharp: 1 },
  SKIP: { js: 5, python: 5, cpp: 5, java: 5, csharp: 5 },
  PICK: { js: 6, python: 6, cpp: 6, java: 6, csharp: 6 },
  DONE: { js: 10, python: 8, cpp: 10, java: 10, csharp: 10 },
};

/**
 * Lightweight exact DP solver for optimal coin change reference comparison.
 */
function solveOptimalCoins(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  const parent = new Array(amount + 1).fill(null);
  dp[0] = 0;

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] !== Infinity && dp[a - coin] + 1 < dp[a]) {
        dp[a] = dp[a - coin] + 1;
        parent[a] = coin;
      }
    }
  }

  if (dp[amount] === Infinity) {
    return { reachable: false, count: -1, coins: [] };
  }

  const chosen = [];
  let cur = amount;
  while (cur > 0 && parent[cur] !== null) {
    chosen.push(parent[cur]);
    cur -= parent[cur];
  }
  chosen.sort((a, b) => b - a);
  return { reachable: true, count: dp[amount], coins: chosen };
}

export class GreedyCoinChange extends GreedyAlgorithm {
  constructor() {
    super('greedy-coin-change');
  }

  getDefaultInput() {
    return { coins: [1, 5, 10, 25], amount: 41 };
  }

  generateSteps(rawInput) {
    const input = rawInput ?? this.getDefaultInput();
    const amount = Number(input?.amount);
    if (!Number.isInteger(amount) || amount < 0 || amount > 200) {
      throw new Error('Greedy Coin Change amount must be an integer between 0 and 200');
    }

    const rawCoins = Array.isArray(input?.coins) ? input.coins : [];
    const deduped = [];
    for (const raw of rawCoins) {
      const c = Number(raw);
      if (!Number.isInteger(c) || c <= 0) {
        throw new Error('Coin denominations must be positive integers');
      }
      if (!deduped.includes(c)) deduped.push(c);
    }
    if (deduped.length === 0 || deduped.length > 8) {
      throw new Error('Greedy Coin Change requires between 1 and 8 positive integer denominations');
    }

    const sorted = [...deduped].sort((a, b) => b - a);
    const counts = Object.fromEntries(sorted.map((c) => [c, 0]));
    const picked = [];
    const rejected = [];
    let remaining = amount;
    const steps = [];

    const buildItems = () => sorted.map((value) => ({
      value,
      count: counts[value],
    }));

    const pushStep = ({
      activeIndex = null,
      phase = 'scan',
      optimalComparison = null,
      msg,
      msgKey,
      msgParams = {},
      codeLines,
    }) => {
      steps.push(new Step({
        msg,
        msgKey,
        msgParams,
        codeLine: codeLines.js,
        codeLines,
        greedy: {
          kind: 'coin-change',
          phase,
          items: buildItems(),
          activeIndex,
          accepted: [...picked],
          rejected: [...rejected],
          metrics: {
            target: amount,
            remaining,
            covered: amount - remaining,
            coinCount: picked.length,
          },
          optimalComparison,
        },
      }));
    };

    pushStep({
      phase: 'sort',
      msg: `Sorted denominations descending: [${sorted.join(', ')}] for target ${amount}.`,
      msgKey: 'greedy:steps.coinSort',
      msgParams: { coins: sorted.join(', '), amount },
      codeLines: LINES.SORT,
    });

    sorted.forEach((coin, idx) => {
      if (coin > remaining) {
        rejected.push(idx);
        pushStep({
          activeIndex: idx,
          msg: `Skip coin ${coin} — larger than remaining amount ${remaining}.`,
          msgKey: 'greedy:steps.coinSkip',
          msgParams: { coin, remaining },
          codeLines: LINES.SKIP,
        });
        return;
      }

      while (coin <= remaining) {
        remaining -= coin;
        counts[coin] += 1;
        picked.push(coin);
        pushStep({
          activeIndex: idx,
          msg: `Pick coin ${coin} → remaining amount becomes ${remaining} (${picked.length} coins used).`,
          msgKey: 'greedy:steps.coinPick',
          msgParams: { coin, remaining, count: picked.length },
          codeLines: LINES.PICK,
        });
      }
    });

    const optimal = solveOptimalCoins(sorted, amount);
    const greedyReachable = remaining === 0;
    const isOptimal = greedyReachable
      ? (!optimal.reachable || picked.length === optimal.count)
      : !optimal.reachable;

    const optimalComparison = {
      greedyReachable,
      greedyCoins: [...picked],
      greedyCount: greedyReachable ? picked.length : -1,
      optimalReachable: optimal.reachable,
      optimalCoins: optimal.coins,
      optimalCount: optimal.count,
      isOptimal,
      remaining,
    };

    if (!greedyReachable) {
      pushStep({
        phase: 'done',
        activeIndex: null,
        optimalComparison,
        msg: optimal.reachable
          ? `Greedy failed with remainder ${remaining}, whereas DP solves ${amount} in ${optimal.count} coins [${optimal.coins.join(', ')}].`
          : `Target ${amount} cannot be formed by either greedy or DP.`,
        msgKey: optimal.reachable ? 'greedy:steps.coinDoneFailedWithOpt' : 'greedy:steps.coinDoneImpossible',
        msgParams: {
          amount,
          remaining,
          optCount: optimal.count,
          optCoins: optimal.coins.join(', '),
        },
        codeLines: LINES.DONE,
      });
    } else if (!isOptimal) {
      pushStep({
        phase: 'done',
        activeIndex: null,
        optimalComparison,
        msg: `Greedy used ${picked.length} coins [${picked.join(', ')}], but DP optimal uses ${optimal.count} coins [${optimal.coins.join(', ')}]!`,
        msgKey: 'greedy:steps.coinDoneSuboptimal',
        msgParams: {
          greedyCount: picked.length,
          greedyCoins: picked.join(', '),
          optCount: optimal.count,
          optCoins: optimal.coins.join(', '),
        },
        codeLines: LINES.DONE,
      });
    } else {
      pushStep({
        phase: 'done',
        activeIndex: null,
        optimalComparison,
        msg: `Done! Greedy found an optimal solution: ${picked.length} coins [${picked.join(', ') || '∅'}].`,
        msgKey: 'greedy:steps.coinDoneOptimal',
        msgParams: {
          count: picked.length,
          coins: picked.join(', ') || '∅',
        },
        codeLines: LINES.DONE,
      });
    }

    return steps;
  }
}
