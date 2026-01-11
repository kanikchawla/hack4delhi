import { useState, useEffect } from 'react'
import { Phone, Download, RefreshCw, BarChart3, Clock } from 'lucide-react'
import { API_URL } from '../config'

const Dashboard = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchLogs = async () => {
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
     
      
    </div>
  )
}

export default Dashboard