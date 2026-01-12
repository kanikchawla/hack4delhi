import { useState, useEffect } from 'react'
import { PhoneOutgoing, Phone, RefreshCw, Download, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../translations/en-hi'
import { API_URL } from '../config'

const OutboundCalls = () => {
  const { language } = useLanguage()
  const t = translations[language] || translations['en']
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [callStatus, setCallStatus] = useState(null)
  const [showSuggestions, setShowSuggestions] = useState(false)
  
  // Load phone number history from localStorage
  const [phoneHistory, setPhoneHistory] = useState(() => {
    const savedHistory = localStorage.getItem('phoneNumberHistory')
    if (savedHistory) {
      try {
        return JSON.parse(savedHistory)
      } catch (e) {
        console.error('Error parsing phone history:', e)
      }
    }
    return []
  })
  
  // Initialize form data from localStorage
  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('outboundCallFormData')
    if (savedData) {
      try {
        return JSON.parse(savedData)
      } catch (e) {
        console.error('Error parsing saved form data:', e)
      }
    }
    return {
      to_number: '',
      custom_message: '',
      webhook_url: ''
    }
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

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('outboundCallFormData', JSON.stringify(formData))
  }, [formData])

  // Save phone number to history
  const savePhoneToHistory = (phoneNumbers) => {
    const numbers = phoneNumbers.split(/[,\n]/).map(n => n.trim()).filter(n => n)
    const updatedHistory = [...new Set([...numbers, ...phoneHistory])].slice(0, 10) // Keep last 10 unique numbers
    setPhoneHistory(updatedHistory)
    localStorage.setItem('phoneNumberHistory', JSON.stringify(updatedHistory))
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
      setCallStatus({ type: 'error', message: t.pleaseEnterPhoneNumber })
      return
    }
    if (!formData.webhook_url.trim()) {
      setCallStatus({ type: 'error', message: t.pleaseProvideWebhookUrl })
      return
    }

    setCallStatus({ type: 'loading', message: t.initiatingCalls })

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
      // Save phone numbers to history before clearing
      savePhoneToHistory(formData.to_number)
      // Keep webhook URL and custom message, only clear phone numbers
      setFormData(prev => ({ ...prev, to_number: '' }))
      setTimeout(fetchLogs, 2000)
    } catch (error) {
      console.error('Make call error:', error)
      const errorMessage = error.message.includes('Failed to fetch')
        ? `${t.queryError}. ${t.pleaseProvideWebhookUrl} ${API_URL}`
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
        <h2>{t.outboundCallsMonitor}</h2>
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
          <PhoneOutgoing size={20} />
          <h3>{t.aboutOutboundCalls}</h3>
        </div>
        <div className="card-body">
          <div className="guide-content">
            <p>
              {t.outboundCallsIntro}
            </p>
            
            <div className="guide-section">
              <h4>{t.howItWorks}</h4>
              <ol className="guide-list">
                <li>{t.selectNumbers}</li>
                <li>{t.enterCustomMessage}</li>
                <li>{t.webhookUrl}</li>
                <li>Click "{t.initiateCallsNow}"</li>
                <li>Monitor call status in the table below</li>
              </ol>
            </div>

            <div className="guide-section">
              <h4>Required Configuration:</h4>
              <ul className="guide-list">
                <li><strong>{t.enterPhoneNumber}:</strong> Recipient numbers in international format (e.g., +919999999999)</li>
                <li><strong>{t.customCallMessage}:</strong> Your announcement or greeting (optional, overrides default)</li>
                <li><strong>{t.webhookUrl}:</strong> Your ngrok/local server endpoint that handles the voice call</li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* Make Call Section */}
      <div className="card">
        <div className="card-header">
          <Phone size={20} />
          <h3>{t.makeCall}</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleMakeCall} className="call-form">
            <div className="form-group">
              <label htmlFor="phone-numbers">{t.enterPhoneNumber} *</label>
              <div style={{ position: 'relative', width: '100%' }}>
                <textarea
                  id="phone-numbers"
                  value={formData.to_number}
                  onChange={(e) => setFormData({ ...formData, to_number: e.target.value })}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder="+919999999999&#10;+919876543210&#10;+1234567890"
                  rows="4"
                  required
                  style={{ width: '100%' }}
                />
                {showSuggestions && phoneHistory.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    marginTop: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    zIndex: 1000
                  }}>
                    <div style={{ padding: '8px 12px', fontSize: '12px', color: '#666', borderBottom: '1px solid #eee' }}>
                      Previously used numbers:
                    </div>
                    {phoneHistory.map((number, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          const currentNumbers = formData.to_number.trim()
                          const newValue = currentNumbers ? `${currentNumbers}\n${number}` : number
                          setFormData({ ...formData, to_number: newValue })
                          setShowSuggestions(false)
                        }}
                        style={{
                          padding: '10px 12px',
                          cursor: 'pointer',
                          borderBottom: index < phoneHistory.length - 1 ? '1px solid #f0f0f0' : 'none',
                          transition: 'background 0.2s',
                          fontFamily: 'monospace'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                        onMouseLeave={(e) => e.target.style.background = 'white'}
                      >
                        {number}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <small>Enter numbers in international format, one per line or separated by comma</small>
            </div>

            <div className="form-group">
              <label htmlFor="custom-message">{t.customCallMessage}</label>
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
              <label htmlFor="webhook-url">Secret Key *</label>
              <input
                id="webhook-url"
                type="password"
                value={formData.webhook_url}
                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                placeholder="Enter your webhook URL (will be hidden)"
                required
              />
              <small>Your webhook URL will be encrypted and hidden for security</small>
            </div>

            <button type="submit" className="btn-primary btn-block" disabled={callStatus?.type === 'loading'}>
              <Phone size={18} />
              {callStatus?.type === 'loading' ? t.initiatingCalls : t.makeCallButton}
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

      {/* Recent Calls Highlight */}
      {!loading && logs.length > 0 && (
        <div className="card">
          <div className="card-header">
            <Clock size={20} />
            <h3>Recent Calls (Last 5)</h3>
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
                    <div className="call-number"><strong>To:</strong> {log.to_number}</div>
                    <div className="call-message">Call SID: <code>{log.call_sid}</code></div>
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

export default OutboundCalls
