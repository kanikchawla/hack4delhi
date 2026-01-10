import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import InboundCalls from './components/InboundCalls';
import OutboundCalls from './components/OutboundCalls';
import Queries from './components/Queries';
import ContactInfo from './components/ContactInfo';
import './App.css';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');

  const renderContent = () => {
    switch(activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'inbound':
        return <InboundCalls />;
      case 'outbound':
        return <OutboundCalls />;
      case 'queries':
        return <Queries />;
      case 'contact':
        return <ContactInfo />;
      default:
        return <Dashboard />;
    }
  };

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
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="header-branding">
            <h1 className="app-title">AI Sathi</h1>
            <span className="badge">Government Voice Agent</span>
          </div>
        </header>
        
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;