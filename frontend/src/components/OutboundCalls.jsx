import { useState, useEffect } from 'react'
import { PhoneOutgoing, Phone, RefreshCw, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import { API_URL } from '../config'

const OutboundCalls = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [callStatus, setCallStatus] = useState(null)
  const [formData, setFormData] = useState({
    to_number: '',
    custom_message: '',
    webhook_url: ''
  })

  const fetchLogs = async () => {
    try {
      const response = await fetch(`${API_URL}/api/logs`)
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }
      const data = await response.json()
      setLogs(data.filter(log => log.direction === 'Outbound'))
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

  const handleMakeCall = async (e) => {
    e.preventDefault()
    
    // Validate inputs
    if (!formData.to_number.trim()) {
      setCallStatus({ type: 'error', message: 'Please enter at least one phone number' })
      return
    }
    if (!formData.webhook_url.trim()) {
      setCallStatus({ type: 'error', message: 'Please provide a webhook URL' })
      return
    }

    setCallStatus({ type: 'loading', message: 'Initiating calls...' })

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('to_number', formData.to_number)
      formDataToSend.append('custom_message', formData.custom_message)
      formDataToSend.append('webhook_url', formData.webhook_url)

      const response = await fetch(`${API_URL}/make-call`, {
        method: 'POST',
        body: formDataToSend
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()

      setCallStatus({ 
        type: 'success', 
        message: result.message,
        details: result
      })
      setFormData({ to_number: '', custom_message: '', webhook_url: '' })
      setTimeout(fetchLogs, 2000)
    } catch (error) {
      console.error('Make call error:', error)
      const errorMessage = error.message.includes('Failed to fetch')
        ? `Cannot connect to backend server. Make sure the backend is running on ${API_URL}`
        : `Error: ${error.message}`
      setCallStatus({ type: 'error', message: errorMessage })
    }
  }

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
      
      setCallStatus({ type: 'success', message: 'Logs downloaded successfully!' })
      setTimeout(() => setCallStatus(null), 3000)
    } catch (error) {
      console.error('Download error:', error)
      setCallStatus({ type: 'error', message: `Failed to download logs. Check backend connection on ${API_URL}` })
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Outbound Calls Manager</h2>
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
          <PhoneOutgoing size={20} />
          <h3>About Outbound Calls</h3>
        </div>
        <div className="card-body">
          <div className="guide-content">
            <p>
              <strong>Outbound calls</strong> are initiated by government administrators to reach citizens with specific announcements, 
              schemes, or urgent information. These calls are made through Twilio and processed by our AI voice agent system.
            </p>
            
            <div className="guide-section">
              <h4>How to Make Outbound Calls:</h4>
              <ol className="guide-list">
                <li>Enter one or more phone numbers (comma-separated)</li>
                <li>(Optional) Add a custom message/announcement</li>
                <li>Provide your ngrok webhook URL for the voice handler</li>
                <li>Click "Initiate Calls"</li>
                <li>Monitor call status in the table below</li>
              </ol>
            </div>

            <div className="guide-section">
              <h4>Required Configuration:</h4>
              <ul className="guide-list">
                <li><strong>Phone Numbers:</strong> Recipient numbers in international format (e.g., +919999999999)</li>
                <li><strong>Custom Message:</strong> Your announcement or greeting (optional, overrides default)</li>
                <li><strong>Webhook URL:</strong> Your ngrok/local server endpoint that handles the voice call</li>
              </ul>
            </div>

            <div className="guide-section">
              <h4>Setting Up Ngrok (For Local Testing):</h4>
              <ol className="guide-list">
                <li>Download and install <code>ngrok</code> from https://ngrok.com</li>
                <li>Run: <code className="code-inline">ngrok http 5000</code></li>
                <li>Copy the HTTPS URL provided (e.g., https://xyz.ngrok-free.app)</li>
                <li>Append <code className="code-inline">/voice</code> to get your webhook URL</li>
                <li>Use this URL in the form above</li>
              </ol>
            </div>

            <div className="guide-section important">
              <h4>⚠️ Important Notes:</h4>
              <ul className="guide-list">
                <li>Twilio account must be configured with valid API credentials</li>
                <li>Recipient numbers must be verified in Twilio (for trial accounts)</li>
                <li>Webhook URL must be publicly accessible (ngrok provides this)</li>
                <li>Custom message will be the first greeting citizens hear</li>
                <li>Each call will be logged with timestamp and transcript</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Make Call Section */}
      <div className="card">
        <div className="card-header">
          <Phone size={20} />
          <h3>Initiate Outbound Call</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleMakeCall} className="call-form">
            <div className="form-group">
              <label htmlFor="phone-numbers">Phone Numbers *</label>
              <textarea
                id="phone-numbers"
                value={formData.to_number}
                onChange={(e) => setFormData({ ...formData, to_number: e.target.value })}
                placeholder="+919999999999&#10;+919876543210&#10;+1234567890"
                rows="4"
                required
              />
              <small>Enter numbers in international format, one per line or separated by comma</small>
            </div>

            <div className="form-group">
              <label htmlFor="custom-message">Custom Message (Optional)</label>
              <textarea
                id="custom-message"
                value={formData.custom_message}
                onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                placeholder="E.g., 'Hello, this is an important announcement from the government...'"
                rows="3"
              />
              <small>This will be the first message callers hear. Leave empty for default greeting.</small>
            </div>

            <div className="form-group">
              <label htmlFor="webhook-url">Ngrok Webhook URL *</label>
              <input
                id="webhook-url"
                type="url"
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                placeholder="https://abc123.ngrok-free.app/voice"
                required
              />
              <small>Example: https://your-ngrok-url.ngrok-free.app/voice</small>
            </div>

            <button type="submit" className="btn-primary btn-block" disabled={callStatus?.type === 'loading'}>
              <Phone size={18} />
              {callStatus?.type === 'loading' ? 'Initiating Calls...' : 'Initiate Calls'}
            </button>
          </form>

          {callStatus && (
            <div className={`status-message ${callStatus.type}`}>
              {callStatus.type === 'loading' && <RefreshCw className="spinning" size={18} />}
              {callStatus.type === 'success' && <CheckCircle size={18} />}
              {callStatus.type === 'error' && <XCircle size={18} />}
              <div>
                <span>{callStatus.message}</span>
                {callStatus.details?.successful && (
                  <small className="status-details">
                    ✓ Success: {callStatus.details.successful.length} | 
                    ✗ Failed: {callStatus.details.failed.length}
                  </small>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon info">
            <PhoneOutgoing size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Outbound Calls</div>
            <div className="stat-value">{logs.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
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
          <h3>Recent Outbound Calls</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">Loading calls...</div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <PhoneOutgoing size={40} />
              <p>No outbound calls yet</p>
              <p className="sub-text">Calls initiated through this interface will appear here</p>
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
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.call_sid}>
                      <td>
                        <Clock size={14} />
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>{log.from_number}</td>
                      <td className="highlight-cell">{log.to_number}</td>
                      <td><code>{log.call_sid}</code></td>
                      <td>
                        <span className="status-badge success">Active</span>
                      </td>
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

export default OutboundCalls
