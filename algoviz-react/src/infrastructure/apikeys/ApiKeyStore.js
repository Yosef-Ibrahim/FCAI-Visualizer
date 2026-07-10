const STORAGE_KEY = 'fcai_visualizer_apikeys_status';

export class ApiKeyStore {
  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  save(statusMap) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(statusMap));
    } catch {
      // blocked
    }
  }

  clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }
}
