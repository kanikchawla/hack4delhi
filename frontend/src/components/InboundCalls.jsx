import { useState, useEffect } from 'react'
import { PhoneIncoming, Clock, MapPin, RefreshCw, Download } from 'lucide-react'
import { API_URL } from '../config'


const InboundCalls = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logs`)
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      const data = await response.json()
      setLogs(data.filter(log => log.direction === 'Inbound'))
    } catch (error) {
      console.error('Error fetching logs:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleDownload = async () => {
    try {
      const response = await fetch(`${API_URL}/download-logs`)
      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `call_logs_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      alert(`Failed to download logs. Make sure the backend is running on ${API_URL}`)
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Inbound Calls Monitor</h2>
        <div className="header-actions">
          <button onClick={fetchLogs} className="btn-icon" title="Refresh logs" aria-label="Refresh">
            <RefreshCw size={20} />
          </button>
          <button onClick={handleDownload} className="btn-primary">
            <Download size={18} />
            Download Logs
          </button>
        </div>
      </div>

      {/* Guide Section */}
      <div className="card guide-card">
        <div className="card-header">
          <PhoneIncoming size={20} />
          <h3>About Inbound Calls</h3>
        </div>
        <div className="card-body">
          <div className="guide-content">
            <p>
              <strong>Inbound calls</strong> are calls initiated by citizens calling the government AI voice agent system. 
              These calls are automatically routed to our AI assistant which helps citizens with government schemes, services, 
              and information in both Hindi and English.
            </p>
            
            <div className="guide-section">
              <h4>How It Works:</h4>
              <ol className="guide-list">
                <li>Citizen calls the government helpline number</li>
                <li>System asks caller to select language (Hindi=1, English=2)</li>
                <li>AI assistant provides personalized guidance</li>
                <li>Conversation is recorded and logged automatically</li>
                <li>Data is stored for government records and analysis</li>
              </ol>
            </div>

            <div className="guide-section">
              <h4>Key Features:</h4>
              <ul className="guide-list">
                <li>24/7 availability - citizens can call anytime</li>
                <li>Bilingual support (Hindi & English)</li>
                <li>Real-time AI responses using Groq LLaMA 3.3</li>
                <li>Complete transcripts for record keeping</li>
                <li>Automatic government scheme information</li>
              </ul>
            </div>

            <div className="guide-section">
              <h4>Call Information Captured:</h4>
              <ul className="guide-list">
                <li>Call timestamp and duration</li>
                <li>Caller phone number (From)</li>
                <li>Government number called (To)</li>
                <li>Complete transcript of conversation</li>
                <li>Call SID for reference</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon success">
            <PhoneIncoming size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Inbound Calls</div>
            <div className="stat-value">{logs.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Last 24 Hours</div>
            <div className="stat-value">{logs.filter(l => {
              const callTime = new Date(l.timestamp);
              const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              return callTime > oneDayAgo;
            }).length}</div>
          </div>
        </div>
      </div>

      {/* Calls Table */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Inbound Calls</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">Loading calls...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <PhoneIncoming size={40} />
              <p>No inbound calls yet</p>
              <p className="sub-text">Citizens will appear here once they call the government helpline</p>
            </div>
          ) : (
            <div className="logs-table">
              <table>
                <thead>
                  <tr>
                    <th>Call Time</th>
                    <th>From Number</th>
                    <th>To Number</th>
                    <th>Call SID</th>
                    <th>Last Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.call_sid}>
                      <td>
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="highlight-cell">{log.from_number}</td>
                      <td>{log.to_number}</td>
                      <td><code>{log.call_sid}</code></td>
                      <td className="transcript">{log.last_message || <em>Ongoing...</em>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default InboundCalls
