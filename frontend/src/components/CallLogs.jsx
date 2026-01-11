import { useState, useEffect } from 'react'
import { Download, RefreshCw, Phone, Clock } from 'lucide-react'
import { API_URL } from '../config'

const CallLogs = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [downloadStatus, setDownloadStatus] = useState(null)
  const [filterDirection, setFilterDirection] = useState('all') // all, inbound, outbound

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/logs`)
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
    setDownloadStatus({ type: 'loading', message: 'Downloading logs...' })
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
      
      setDownloadStatus({ type: 'success', message: 'Logs downloaded successfully!' })
      setTimeout(() => setDownloadStatus(null), 3000)
    } catch (error) {
      console.error('Download error:', error)
      setDownloadStatus({ 
        type: 'error', 
        message: `Failed to download logs. Backend: ${API_URL}` 
      })
    }
  }

  // Filter logs based on selected direction
  const filteredLogs = filterDirection === 'all' 
    ? logs 
    : logs.filter(log => log.direction === (filterDirection === 'inbound' ? 'Inbound' : 'Outbound'))

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Call Logs</h2>
        <div className="header-actions">
          <button onClick={fetchLogs} className="btn-icon" title="Refresh logs" aria-label="Refresh">
            <RefreshCw size={20} />
          </button>
          <button onClick={handleDownload} className="btn-primary">
            <Download size={18} />
            Download CSV
          </button>
        </div>
      </div>

      {downloadStatus && (
        <div className={`status-message ${downloadStatus.type}`}>
          {downloadStatus.type === 'loading' && <RefreshCw className="spinning" size={18} />}
          {downloadStatus.type === 'success' && '✓'}
          {downloadStatus.type === 'error' && '✗'}
          <span>{downloadStatus.message}</span>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filterDirection === 'all' ? 'active' : ''}`}
          onClick={() => setFilterDirection('all')}
        >
          All Calls ({logs.length})
        </button>
        <button 
          className={`filter-btn ${filterDirection === 'inbound' ? 'active' : ''}`}
          onClick={() => setFilterDirection('inbound')}
        >
          Inbound ({logs.filter(l => l.direction === 'Inbound').length})
        </button>
        <button 
          className={`filter-btn ${filterDirection === 'outbound' ? 'active' : ''}`}
          onClick={() => setFilterDirection('outbound')}
        >
          Outbound ({logs.filter(l => l.direction === 'Outbound').length})
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon info">
            <Phone size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Calls</div>
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

      {/* Logs Table */}
      <div className="card">
        <div className="card-header">
          <h3>Call Records</h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="loading">Loading calls...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="empty-state">
              <Phone size={40} />
              <p>No calls found</p>
              <p className="sub-text">Calls will appear here as they are logged</p>
            </div>
          ) : (
            <div className="logs-table">
              <table>
                <thead>
                  <tr>
                    <th>Call Time</th>
                    <th>Direction</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Call SID</th>
                    <th>Last Message</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.call_sid}>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Clock size={14} />
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <span className={`direction-badge ${log.direction.toLowerCase()}`}>
                          {log.direction}
                        </span>
                      </td>
                      <td className={log.direction === 'Inbound' ? 'highlight-cell' : ''}>{log.from_number}</td>
                      <td className={log.direction === 'Outbound' ? 'highlight-cell' : ''}>{log.to_number}</td>
                      <td><code>{log.call_sid}</code></td>
                      <td className="transcript">{log.last_message ? log.last_message.substring(0, 100) : <em>No message</em>}</td>
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

export default CallLogs
