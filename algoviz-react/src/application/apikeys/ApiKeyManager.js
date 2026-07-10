import { ApiKey, STATUS_ACTIVE, STATUS_OUT_OF_WORK, COOLDOWN_HOURS } from '../../domain/apikeys/ApiKey';
import { API_KEYS_CONFIG } from './ApiKeyConfig';
import { ApiKeyStore } from '../../infrastructure/apikeys/ApiKeyStore';

let instance = null;

export class ApiKeyManager {
  constructor() {
    if (instance) return instance;
    this.store = new ApiKeyStore();
    this.keys = this._initKeys();
    this._onStatusChange = null;
    instance = this;
  }

  _initKeys() {
    const savedStatus = this.store.load();
    return API_KEYS_CONFIG.map(cfg => {
      const saved = savedStatus[cfg.id];
      return new ApiKey({
        ...cfg,
        status: saved?.status || STATUS_ACTIVE,
        lastUsed: saved?.lastUsed || null,
        cooldownUntil: saved?.cooldownUntil || null,
      });
    });
  }

  _persist() {
    const statusMap = {};
    this.keys.forEach(k => {
      statusMap[k.id] = {
        status: k.status,
        lastUsed: k.lastUsed,
        cooldownUntil: k.cooldownUntil,
      };
    });
    this.store.save(statusMap);
  }

  _notify() {
    if (this._onStatusChange) this._onStatusChange(this.getStatus());
  }

  onStatusChange(cb) {
    this._onStatusChange = cb;
  }

  refreshKeys() {
    let changed = false;
    this.keys.forEach(k => {
      if (k.status === STATUS_OUT_OF_WORK && k.cooldownUntil && Date.now() >= k.cooldownUntil) {
        k.status = STATUS_ACTIVE;
        k.cooldownUntil = null;
        changed = true;
      }
    });
    if (changed) {
      this._persist();
      this._notify();
    }
  }

  getAvailableKey() {
    this.refreshKeys();
    const available = this.keys.filter(k => k.isAvailable);
    if (available.length === 0) return null;
    available.sort((a, b) => (a.lastUsed || 0) - (b.lastUsed || 0));
    return available[0];
  }

  getKeyForRequest() {
    this.refreshKeys();
    let key = this.getAvailableKey();
    if (!key) {
      this.keys.sort((a, b) => a.remainingCooldown - b.remainingCooldown);
      key = this.keys[0];
    }
    key.lastUsed = Date.now();
    this._persist();
    return key;
  }

  markOutOfWork(keyId) {
    const key = this.keys.find(k => k.id === keyId);
    if (!key) return;
    key.status = STATUS_OUT_OF_WORK;
    key.cooldownUntil = Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000;
    this._persist();
    this._notify();
  }

  markSuccess(keyId) {
    const key = this.keys.find(k => k.id === keyId);
    if (!key) return;
    key.status = STATUS_ACTIVE;
    key.cooldownUntil = null;
    this._persist();
    this._notify();
  }

  getStatus() {
    this.refreshKeys();
    return this.keys.map(k => ({
      id: k.id,
      provider: k.provider,
      model: k.model,
      label: k.label,
      status: k.status,
      lastUsed: k.lastUsed,
      cooldownUntil: k.cooldownUntil,
      remainingCooldown: k.remainingCooldown,
      hasKey: !!k.key,
    }));
  }

  getTotalAvailable() {
    this.refreshKeys();
    return this.keys.filter(k => k.isAvailable && k.key).length;
  }

  resetAll() {
    this.keys.forEach(k => {
      k.status = STATUS_ACTIVE;
      k.cooldownUntil = null;
      k.lastUsed = null;
    });
    this._persist();
    this._notify();
  }
}
