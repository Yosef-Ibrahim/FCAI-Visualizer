export class Step {
  constructor({ arr, compare, swap, sorted, current, found, msg, codeLine, codeLines, ...extra }) {
    this.arr = arr;
    this.compare = compare ?? null;
    this.swap = swap ?? null;
    this.sorted = sorted ?? null;
    this.current = current ?? null;
    this.found = found ?? null;
    this.msg = msg ?? '';
    this.codeLine = codeLine ?? -1;
    this.codeLines = codeLines ?? null;
    Object.assign(this, extra);
  }
}
