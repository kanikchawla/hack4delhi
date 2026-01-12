import { useState, useEffect } from 'react'
import { Phone, Download, RefreshCw, BarChart3, Clock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../translations/en-hi'
import { API_URL } from '../config'

const Dashboard = () => {
  const { language } = useLanguage()
  const t = translations[language] || translations['en']
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
        <h2>{t.dashboardOverview}</h2>
        <div className="header-actions">
          <button onClick={fetchLogs} className="btn-icon" title={t.refreshLogs} aria-label="Refresh">
            <RefreshCw size={20} />
          </button>
          
        </div>
      </div>

      

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon success">
            <Phone size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">{t.totalCalls}</div>
            <div className="stat-value">{totalCalls}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">{t.last24Hours}</div>
            <div className="stat-value">{last24h}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Phone size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">{t.inboundCalls}</div>
            <div className="stat-value">{inboundLogs.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon success">
            <Phone size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">{t.outboundCallsCount}</div>
            <div className="stat-value">{outboundLogs.length}</div>
          </div>
        </div>
      </div>
      {/* Overview Guide */}
      <div className="card guide-card">
        <div className="card-header">
          <BarChart3 size={20} />
          <h3>{t.dashboardGuide}</h3>
        </div>
        <div className="card-body">
          <div className="guide-content">
            <p>
              {t.welcomeMessage}
            </p>
            
            <div className="guide-section">
              <h4>{t.mainFeatures}</h4>
              <ul className="guide-list">
                <li><strong>{t.dashboardHome}:</strong> {t.dashboardHomeDesc}</li>
                <li><strong>{t.inboundLogs}:</strong> {t.inboundLogsDesc}</li>
                <li><strong>{t.outboundCalls}:</strong> {t.outboundCallsDesc}</li>
                <li><strong>{t.queries}:</strong> {t.queriesDocsDesc}</li>
                <li><strong>{t.govContactInfo}:</strong> {t.govContactInfoDesc}</li>
              </ul>
            </div>


          </div>
        </div>
      </div>

      {/* Recent Calls Section */}
     
      
    </div>
  )
}

export default Dashboard