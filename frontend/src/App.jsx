import { useState, useEffect } from 'react'
import { Phone, Menu, X, LogOut, BarChart3, Users, Settings, Info, Clock } from 'lucide-react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import ContactInfo from './components/ContactInfo'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeView, setActiveView] = useState('dashboard')

  return (
    <div className="app-container">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        onOpen={() => setSidebarOpen(true)}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <header className="app-header">
          <button 
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="app-title">
            <Phone className="title-icon" size={28} />
            Government of India - Caller
          </h1>
        </header>
        
        <div className="content-wrapper">
          {activeView === 'dashboard' && <Dashboard />}
          {activeView === 'contact' && <ContactInfo />}
        </div>
      </main>
    </div>
  )
}

export default App
