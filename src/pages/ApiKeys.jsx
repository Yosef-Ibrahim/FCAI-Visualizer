import ApiKeyTable from '../components/ai/ApiKeyTable';

export default function ApiKeys() {
  return (
    <div className="page api-keys-page">
      <div className="page__header">
        <h1>API Key Management</h1>
        <p className="page__subtitle">
          Monitor and manage AI API keys. Keys are automatically rotated and enter a 24-hour cooldown when rate-limited.
        </p>
      </div>
      <ApiKeyTable />
    </div>
  );
}
