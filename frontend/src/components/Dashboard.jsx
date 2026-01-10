import { useState, useEffect } from 'react'
import { Phone, Download, RefreshCw, CheckCircle, XCircle, Clock } from 'lucide-react'

const Dashboard = () => {
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
      const response = await fetch('/api/logs')
      const data = await response.json()
      setLogs(data)
    } catch (error) {
      console.error('Error fetching logs:', error)
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
    setCallStatus({ type: 'loading', message: 'Initiating calls...' })

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('to_number', formData.to_number)
      formDataToSend.append('custom_message', formData.custom_message)
      formDataToSend.append('webhook_url', formData.webhook_url)

      const response = await fetch('/make-call', {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (response.ok) {
        setCallStatus({ 
          type: 'success', 
          message: result.message,
          details: result
        })
        setFormData({ to_number: '', custom_message: '', webhook_url: '' })
        setTimeout(fetchLogs, 2000)
      } else {
        setCallStatus({ type: 'error', message: result.error || 'Failed to make call' })
      }
    } catch (error) {
      setCallStatus({ type: 'error', message: 'Network error. Please check your connection.' })
    }
  }

  const handleDownload = () => {
    window.location.href = '/download-logs'
  }

  const inboundLogs = logs.filter(log => log.direction === 'Inbound')
  const outboundLogs = logs.filter(log => log.direction === 'Outbound')

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Call Management Dashboard</h2>
        <div className="header-actions">
          <button onClick={fetchLogs} className="btn-icon" title="Refresh">
            <RefreshCw size={20} />
          </button>
          <button onClick={handleDownload} className="btn-primary">
            <Download size={18} />
            Download Logs
          </button>
        </div>
      </div>

      {/* Make Call Section */}
      <div className="card">
        <div className="card-header">
          <Phone size={20} />
          <h3>Make Outbound Call</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleMakeCall} className="call-form">
            <div className="form-group">
              <label>Phone Numbers</label>
              <textarea
                value={formData.to_number}
                onChange={(e) => setFormData({ ...formData, to_number: e.target.value })}
                placeholder="+919999999999, +1234567890"
                rows="3"
                required
              />
              <small>Enter multiple numbers separated by comma</small>
            </div>

            <div className="form-group">
              <label>Custom Message (Optional)</label>
              <textarea
                value={formData.custom_message}
                onChange={(e) => setFormData({ ...formData, custom_message: e.target.value })}
                placeholder="Hello, this is a reminder regarding..."
                rows="3"
              />
              <small>Overrides the default greeting</small>
            </div>

            <div className="form-group">
              <label>Ngrok Webhook URL</label>
              <input
                type="url"
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                placeholder="https://xyz.ngrok-free.app/voice"
                required
              />
            </div>

            <button type="submit" className="btn-primary btn-block">
              <Phone size={18} />
              Initiate Calls
            </button>
          </form>

          {callStatus && (
            <div className={`status-message ${callStatus.type}`}>
              {callStatus.type === 'loading' && <RefreshCw className="spinning" size={18} />}
              {callStatus.type === 'success' && <CheckCircle size={18} />}
              {callStatus.type === 'error' && <XCircle size={18} />}
              <span>{callStatus.message}</span>
            </div>
          )}
        </div>
      </div>

      {/* Logs Section */}
      <div className="logs-section">
        <div className="logs-tabs">
          <div className="tab-header">
            <span className="tab-label">📥 Inbound Logs ({inboundLogs.length})</span>
          </div>
          <div className="tab-header">
            <span className="tab-label">📤 Outbound Logs ({outboundLogs.length})</span>
          </div>
        </div>

        <div className="logs-content">
          <div className="logs-pane">
            <h4>Inbound Calls</h4>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : inboundLogs.length === 0 ? (
              <div className="empty-state">No inbound calls yet</div>
            ) : (
              <div className="logs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>From Number</th>
                      <th>Call SID</th>
                      <th>Transcript</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inboundLogs.map((log) => (
                      <tr key={log.call_sid}>
                        <td>
                          <Clock size={14} />
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td>{log.from_number}</td>
                        <td><code>{log.call_sid}</code></td>
                        <td className="transcript">{log.last_message || <em>No transcript yet</em>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="logs-pane">
            <h4>Outbound Calls</h4>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : outboundLogs.length === 0 ? (
              <div className="empty-state">No outbound calls yet</div>
            ) : (
              <div className="logs-table">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>To Number</th>
                      <th>Call SID</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {outboundLogs.map((log) => (
                      <tr key={log.call_sid}>
                        <td>
                          <Clock size={14} />
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td>{log.to_number}</td>
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
    </div>
  )
}

export default Dashboard

