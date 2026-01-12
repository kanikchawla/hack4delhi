import { useState } from 'react';
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations/en-hi';
import { API_URL } from '../config';

const Queries = () => {
  const { language } = useLanguage();
  const t = translations[language] || translations['en'];
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setStatus({ type: 'error', text: t.enterQueryBefore });
      return;
    }

    setStatus({ type: 'loading', text: t.syncing });

    try {
      const res = await fetch(`${API_URL}/api/submit-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, user: 'Dashboard Admin' })
      });
      
      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`)
      }

      const data = await res.json();
      setStatus({ type: 'success', text: t.querySent });
      setQuery('');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error('Query submit error:', err)
      const errorMsg = err.message.includes('Failed to fetch')
        ? `${t.queryError}. Make sure the backend is running on ${API_URL}`
        : `Error: ${err.message}`
      setStatus({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>{t.officialQueryRegistry}</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <FileText size={20} />
          <h3>{t.makeQuery}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="call-form">
            <div className="form-group">
              <label htmlFor="query-input">{t.submitQueryForGov}</label>
              <textarea
                id="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.enterYourQuery}
                rows="6"
                required
              />
              <small>This will be automatically synced to the Central Government Database.</small>
            </div>
            
            <button type="submit" className="btn-primary btn-block" disabled={status?.type === 'loading'}>
              <Send size={18} />
              {status?.type === 'loading' ? t.syncing : t.submit}
            </button>
          </form>

          {status && (
            <div className={`status-message ${status.type}`}>
              {status.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{status.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Queries;