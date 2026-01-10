import { useState, useEffect } from 'react'
import { Phone, Download, RefreshCw, BarChart3, Clock } from 'lucide-react'

const Dashboard = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/logs')
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      const data = await response.json()
      setLogs(data)
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
      const response = await fetch('http://localhost:8000/download-logs')
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
      alert('Failed to download logs. Make sure the backend is running on http://localhost:8000')
    }
  }

  const inboundLogs = logs.filter(log => log.direction === 'Inbound')
  const outboundLogs = logs.filter(log => log.direction === 'Outbound')
  const totalCalls = logs.length
  const last24h = logs.filter(l => {
    const callTime = new Date(l.timestamp)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return callTime > oneDayAgo
  }).length

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <div className="header-actions">
          <button onClick={fetchLogs} className="btn-icon" title="Refresh logs" aria-label="Refresh">
            <RefreshCw size={20} />
          </button>
          <button onClick={handleDownload} className="btn-primary">
            <Download size={18} />
            Download All Logs
          </button>
        </div>
      </div>

      {/* Overview Guide */}
      <div className="card guide-card">
        <div className="card-header">
          <BarChart3 size={20} />
          <h3>Dashboard Guide</h3>
        </div>
        <div className="card-body">
          <div className="guide-content">
            <p>
              Welcome to the AI Sathi Government Voice Agent Dashboard. This system enables seamless communication 
              between citizens and government services through AI-powered voice conversations.
            </p>
            
            <div className="guide-section">
              <h4>Main Features:</h4>
              <ul className="guide-list">
                <li><strong>Dashboard Home:</strong> Overview of all call statistics and recent activity</li>
                <li><strong>Inbound Logs:</strong> Monitor calls initiated by citizens calling the government helpline</li>
                <li><strong>Outbound Calls:</strong> Initiate calls to reach citizens with announcements and information</li>
                <li><strong>Queries & Docs:</strong> Log and sync citizen queries to Google Docs for government records</li>
                <li><strong>Govt Contact Info:</strong> Display contact information and service details</li>
              </ul>
            </div>

            <div className="guide-section">
              <h4>How Citizens Call (Inbound):</h4>
              <ol className="guide-list">
                <li>Citizen dials the government helpline number</li>
                <li>Selects language preference (Hindi or English)</li>
                <li>AI assistant responds to their queries about government schemes</li>
                <li>Call is logged automatically</li>
              </ol>
            </div>

            <div className="guide-section">
              <h4>How to Make Outbound Calls:</h4>
              <ol className="guide-list">
                <li>Go to "Outbound Calls" in the sidebar</li>
                <li>Enter phone numbers to call</li>
                <li>Add custom announcement message (optional)</li>
                <li>Provide ngrok webhook URL</li>
                <li>Click "Initiate Calls"</li>
              </ol>
            </div>

            <div className="guide-section important">
              <h4>⚠️ Quick Setup Checklist:</h4>
              <ul className="guide-list">
                <li>✓ Twilio credentials configured in .env</li>
                <li>✓ Groq API key for LLaMA AI model</li>
                <li>✓ ngrok running for webhook access (for outbound)</li>
                <li>✓ Database initialized (voice_agent.db)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon success">
            <Phone size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Calls</div>
            <div className="stat-value">{totalCalls}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Last 24 Hours</div>
            <div className="stat-value">{last24h}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Phone size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Inbound Calls</div>
            <div className="stat-value">{inboundLogs.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <Phone size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Outbound Calls</div>
            <div className="stat-value">{outboundLogs.length}</div>
          </div>
        </div>
      </div>

      {/* Recent Calls Section */}
      <div className="card">
        <div className="card-header">
          <h3>Recent Calls (All Types)</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">Loading calls...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <Phone size={40} />
              <p>No calls yet</p>
              <p className="sub-text">Calls will appear here as citizens call the helpline or outbound calls are initiated</p>
            </div>
          ) : (
            <div className="logs-table">
              <table>
                <thead>
                  <tr>
                    <th>Call Time</th>
                    <th>Direction</th>
                    <th>From/To Number</th>
                    <th>Call SID</th>
                    <th>Last Message</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.slice(0, 20).map((log) => (
                    <tr key={log.call_sid}>
                      <td>
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <span className={`status-badge ${log.direction === 'Inbound' ? 'success' : 'warning'}`}>
                          {log.direction}
                        </span>
                      </td>
                      <td className="highlight-cell">
                        {log.direction === 'Inbound' ? log.from_number : log.to_number}
                      </td>
                      <td><code>{log.call_sid}</code></td>
                      <td className="transcript">{log.last_message || <em>No message</em>}</td>
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

export default Dashboard