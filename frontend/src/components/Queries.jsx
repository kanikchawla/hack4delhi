import { useState } from 'react';
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { API_URL } from '../config';

const Queries = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setStatus({ type: 'error', text: 'Please enter a query before submitting.' });
      return;
    }

    setStatus({ type: 'loading', text: 'Syncing...' });

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
      setStatus({ type: 'success', text: 'Query sent successfully!' });
      setQuery('');
      setTimeout(() => setStatus(null), 3000);
    } catch (err) {
      console.error('Query submit error:', err)
      const errorMsg = err.message.includes('Failed to fetch')
        ? `Cannot connect to backend server. Make sure the backend is running on ${API_URL}`
        : `Error: ${err.message}`
      setStatus({ type: 'error', text: errorMsg });
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Official Query Registry</h2>
      </div>

      <div className="card">
        <div className="card-header">
          <FileText size={20} />
          <h3>Make a Query</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="call-form">
            <div className="form-group">
              <label htmlFor="query-input">Query / Grievance Details</label>
              <textarea
                id="query-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type your query here..."
                rows="6"
                required
              />
              <small>This will be automatically synced to the Central Government Database.</small>
            </div>
            
            <button type="submit" className="btn-primary btn-block" disabled={status?.type === 'loading'}>
              <Send size={18} />
              {status?.type === 'loading' ? 'Syncing...' : 'Send'}
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