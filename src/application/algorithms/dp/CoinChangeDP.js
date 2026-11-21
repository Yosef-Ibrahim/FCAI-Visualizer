import { DPAlgorithm } from './DPAlgorithm';
import { Step } from '../../../domain/algorithms/Step';

const LINES = {
  INIT: { js: 2, python: 2, cpp: 2, java: 2, csharp: 2 },
  AMOUNT: { js: 3, python: 3, cpp: 3, java: 3, csharp: 3 },
  RELAX: { js: 6, python: 6, cpp: 6, java: 6, csharp: 6 },
  DONE: { js: 10, python: 7, cpp: 10, java: 10, csharp: 10 },
};

const formatCell = (v) => (v === Infinity ? '∞' : v);

export class CoinChangeDP extends DPAlgorithm {
  constructor() {
    super('coin-change-dp');
  }

  getDefaultInput() {
    return { coins: [1, 3, 4], amount: 6 };
  }

  generateSteps(rawInput) {
    const input = rawInput ?? this.getDefaultInput();
    const amount = Number(input?.amount);
    if (!Number.isInteger(amount) || amount < 0 || amount > 20) {
      throw new Error('Coin Change target amount must be an integer between 0 and 20');
    }

    const rawCoins = Array.isArray(input?.coins) ? input.coins : [];
    const deduped = [];
    for (const c of rawCoins) {
      const coin = Number(c);
      if (!Number.isInteger(coin) || coin <= 0) {
        throw new Error('Coin denominations must be positive integers');
      }
      if (!deduped.includes(coin)) deduped.push(coin);
    }
    if (deduped.length === 0 || deduped.length > 6) {
      throw new Error('Coin Change requires between 1 and 6 positive integer denominations');
    }

    const coins = deduped.sort((a, b) => a - b);
    const dp = new Array(amount + 1).fill(Infinity);
    const choice = new Array(amount + 1).fill(null);
    dp[0] = 0;

    const rowLabels = ['dp[a]'];
    const colLabels = Array.from({ length: amount + 1 }, (_, a) => `${a}`);
    const steps = [];

    const snapshotTable = () => [dp.map(formatCell)];

    const pushStep = ({
      activeCell = null,
      dependencies = [],
      traceback = [],
      phase = 'fill',
      recurrenceText = '',
      result = null,
      summary = '',
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
        dp: {
          dims: 1,
          table: snapshotTable(),
          rowLabels,
          colLabels,
          activeCell,
          dependencies,
          traceback: traceback.map((c) => c.slice()),
          phase,
          recurrenceText,
          result,
          summary,
        },
      }));
    };

    pushStep({
      activeCell: [0, 0],
      phase: 'init',
      recurrenceText: 'dp[0] = 0; dp[a] = min(1 + dp[a - c]) for c ∈ coins',
      msg: `Initialize dp[0] = 0 and dp[1..${amount}] = ∞ with coins [${coins.join(', ')}].`,
      msgKey: 'dp:steps.coinInit',
      msgParams: { amount, coins: coins.join(', ') },
      codeLines: LINES.INIT,
    });

    for (let a = 1; a <= amount; a++) {
      const validDeps = [];
      let bestCoin = null;
      for (const coin of coins) {
        if (coin <= a) {
          validDeps.push([0, a - coin]);
          if (dp[a - coin] !== Infinity && dp[a - coin] + 1 < dp[a]) {
            dp[a] = dp[a - coin] + 1;
            choice[a] = coin;
            bestCoin = coin;
          }
        }
      }

      if (bestCoin !== null) {
        pushStep({
          activeCell: [0, a],
          dependencies: [[0, a - bestCoin]],
          phase: 'fill',
          recurrenceText: `dp[${a}] = 1 + dp[${a - bestCoin}] = 1 + ${dp[a - bestCoin]} = ${dp[a]} (coin ${bestCoin})`,
          msg: `Amount ${a}: using coin ${bestCoin} from dp[${a - bestCoin}] gives minimum ${dp[a]} coins.`,
          msgKey: 'dp:steps.coinFill',
          msgParams: { amount: a, coin: bestCoin, prev: a - bestCoin, value: dp[a] },
          codeLines: LINES.RELAX,
        });
      } else {
        pushStep({
          activeCell: [0, a],
          dependencies: validDeps,
          phase: 'fill',
          recurrenceText: `dp[${a}] = ∞ (no coin combination reaches ${a})`,
          msg: `Amount ${a}: no valid denomination transition — remains ∞.`,
          msgKey: 'dp:steps.coinUnreachableCell',
          msgParams: { amount: a },
          codeLines: LINES.AMOUNT,
        });
      }
    }

    const reachable = dp[amount] !== Infinity;
    const pickedCoins = [];
    const tracebackCells = [];

    if (reachable) {
      let cur = amount;
      tracebackCells.push([0, cur]);
      while (cur > 0 && choice[cur] !== null) {
        const coin = choice[cur];
        const next = cur - coin;
        pickedCoins.push(coin);
        pushStep({
          activeCell: [0, cur],
          dependencies: [[0, next]],
          traceback: tracebackCells,
          phase: 'traceback',
          recurrenceText: `Traceback: take coin ${coin} (${cur} → ${next})`,
          msg: `Traceback at amount ${cur}: pick coin ${coin}, remaining ${next}.`,
          msgKey: 'dp:steps.coinTrace',
          msgParams: { current: cur, coin, next },
          codeLines: LINES.DONE,
        });
        cur = next;
        tracebackCells.push([0, cur]);
      }

      const coinsLabel = pickedCoins.length ? pickedCoins.join(' + ') : '0';
      pushStep({
        activeCell: [0, amount],
        traceback: tracebackCells,
        phase: 'done',
        recurrenceText: `Minimum coins = ${dp[amount]} (${coinsLabel})`,
        result: { minCoins: dp[amount], coins: pickedCoins, reachable: true },
        summary: `${dp[amount]} coins [${pickedCoins.join(', ')}]`,
        msg: `Done! Minimum coins for ${amount} is ${dp[amount]} using [${pickedCoins.join(', ')}].`,
        msgKey: 'dp:steps.coinDone',
        msgParams: { amount, minCoins: dp[amount], picked: pickedCoins.join(', ') || '∅' },
        codeLines: LINES.DONE,
      });
    } else {
      pushStep({
        activeCell: [0, amount],
        phase: 'done',
        recurrenceText: `dp[${amount}] = ∞ — target ${amount} cannot be formed`,
        result: { minCoins: -1, coins: [], reachable: false },
        summary: 'Unreachable (∞)',
        msg: `Done! Target amount ${amount} cannot be formed with coins [${coins.join(', ')}].`,
        msgKey: 'dp:steps.coinDoneUnreachable',
        msgParams: { amount, coins: coins.join(', ') },
        codeLines: LINES.DONE,
      });
    }

    return steps;
  }
}
