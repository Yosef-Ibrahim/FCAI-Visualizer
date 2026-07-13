export const STATUS_ACTIVE = 'active';
export const STATUS_OUT_OF_WORK = 'out_of_work';
export const COOLDOWN_HOURS = 24;

export class ApiKey {
  constructor({ id, key, provider, model, label, status = STATUS_ACTIVE, lastUsed = null, cooldownUntil = null }) {
    this.id = id;
    this.key = key;
    this.provider = provider;
    this.model = model;
    this.label = label;
    this.status = status;
    this.lastUsed = lastUsed;
    this.cooldownUntil = cooldownUntil;
  }

  get isAvailable() {
    if (this.status === STATUS_ACTIVE) return true;
    if (this.cooldownUntil && Date.now() >= this.cooldownUntil) return true;
    return false;
  }

  get isOutOfWork() {
    return this.status === STATUS_OUT_OF_WORK && !this.isAvailable;
  }

  get remainingCooldown() {
    if (!this.cooldownUntil) return 0;
    return Math.max(0, this.cooldownUntil - Date.now());
  }
}
