import { useState, useEffect } from 'react';
import { getApiKeyStatus, resetApiKeys } from '../../services/aiService';

function formatTime(ts) {
  if (!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
}

function formatCooldown(ms) {
  if (ms <= 0) return '—';
  const hours = Math.floor(ms / 3600000);
  const mins = Math.floor((ms % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

function StatusBadge({ status, isAvailable, hasKey }) {
  if (!hasKey) return <span className="api-badge api-badge--missing">No Key</span>;
  if (isAvailable) return <span className="api-badge api-badge--active">Active</span>;
  if (status === 'out_of_work') return <span className="api-badge api-badge--cooldown">Cooldown</span>;
  return <span className="api-badge api-badge--unknown">Unknown</span>;
}

export default function ApiKeyTable() {
  const [keys, setKeys] = useState([]);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    setKeys(getApiKeyStatus());
    const interval = setInterval(() => {
      setKeys(getApiKeyStatus());
      setRefreshTick(t => t + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    resetApiKeys();
    setKeys(getApiKeyStatus());
  };

  const totalAvailable = keys.filter(k => k.hasKey && (k.status === 'active' || (k.status === 'out_of_work' && k.remainingCooldown <= 0))).length;
  const totalKeys = keys.filter(k => k.hasKey).length;

  return (
    <div className="api-key-table-wrapper">
      <div className="api-key-table-header">
        <h2>AI API Keys Status</h2>
        <div className="api-key-table-actions">
          <span className="api-key-summary">
            {totalAvailable} / {totalKeys} available
          </span>
          <button className="api-reset-btn" onClick={handleReset}>Reset All</button>
        </div>
      </div>
      <div className="api-key-table-scroll">
        <table className="api-key-table">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Model</th>
              <th>Status</th>
              <th>Last Used</th>
              <th>Cooldown Remaining</th>
            </tr>
          </thead>
          <tbody>
            {keys.length === 0 ? (
              <tr><td colSpan="5" className="api-empty">No API keys configured.</td></tr>
            ) : (
              keys.map(k => (
                <tr key={k.id} className={!k.hasKey ? 'api-row--disabled' : ''}>
                  <td className="api-provider-cell">
                    <span className={`api-provider-dot api-provider-dot--${k.provider.toLowerCase()}`} />
                    {k.provider}
                  </td>
                  <td className="api-model-cell">{k.model}</td>
                  <td>
                    <StatusBadge status={k.status} isAvailable={k.remainingCooldown <= 0} hasKey={k.hasKey} />
                  </td>
                  <td className="api-time-cell">{formatTime(k.lastUsed)}</td>
                  <td className="api-time-cell">{formatCooldown(k.remainingCooldown)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
