import { useState, useEffect } from 'react'
import { PhoneIncoming, Clock, MapPin, RefreshCw, Download } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../translations/en-hi'
import { API_URL } from '../config'


const InboundCalls = () => {
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
        <h2>{t.inboundCallsMonitor}</h2>
        <div className="header-actions">
          <button onClick={fetchLogs} className="btn-icon" title={t.refreshLogs} aria-label={t.refreshLogs}>
            <RefreshCw size={20} />
          </button>
          <button onClick={handleDownload} className="btn-primary">
            <Download size={18} />
            {t.downloadLogs}
          </button>
        </div>
      </div>

      {/* Guide Section */}
      <div className="card guide-card">
        <div className="card-header">
          <PhoneIncoming size={20} />
          <h3>{t.aboutInboundCalls}</h3>
        </div>
        <div className="card-body">
          <div className="guide-content">
            <p>
              {t.inboundCallsIntro}
            </p>
            
            <div className="guide-section">
              <h4>{t.howItWorks}</h4>
              <ol className="guide-list">
                <li>{t.howItWorksSteps[0]}</li>
                <li>{t.howItWorksSteps[1]}</li>
                <li>{t.howItWorksSteps[2]}</li>
                <li>{t.howItWorksSteps[3]}</li>
                <li>{t.howItWorksSteps[4]}</li>
              </ol>
            </div>

            <div className="guide-section">
              <h4>{t.keyFeatures}</h4>
              <ul className="guide-list">
                <li>{t.keyFeaturesList[0]}</li>
                <li>{t.keyFeaturesList[1]}</li>
                <li>{t.keyFeaturesList[2]}</li>
                <li>{t.keyFeaturesList[3]}</li>
                <li>{t.keyFeaturesList[4]}</li>
              </ul>
            </div>

            <div className="guide-section">
              <h4>{t.callInformationCaptured}</h4>
              <ul className="guide-list">
                <li>{t.callInformationList[0]}</li>
                <li>{t.callInformationList[1]}</li>
                <li>{t.callInformationList[2]}</li>
                <li>{t.callInformationList[3]}</li>
                <li>{t.callInformationList[4]}</li>
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
            <div className="stat-label">{t.totalInboundCalls}</div>
            <div className="stat-value">{logs.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon info">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">{t.last24Hours}</div>
            <div className="stat-value">{logs.filter(l => {
              const callTime = new Date(l.timestamp);
              const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              return callTime > oneDayAgo;
            }).length}</div>
          </div>
        </div>
      </div>

      {/* Recent Calls Highlight */}
      {!loading && logs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <Clock size={20} />
            <h3>{t.recentCallsLast5}</h3>
          </div>
          <div className="card-body">
            <div className="recent-calls-list">
              {logs.slice(0, 5).map((log) => (
                <div key={log.call_sid} className="recent-call-item">
                  <div className="recent-call-time">
                    <Clock size={16} />
                    <span>{new Date(log.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="recent-call-details">
                    <div className="call-number"><strong>{t.from}:</strong> {log.from_number}</div>
                    <div className="call-message">{log.last_message || <em className="text-muted">{t.noMessage}</em>}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      
    </div>
  )
}

export default InboundCalls
