import { Phone, BarChart3, Info, X } from 'lucide-react'

const Sidebar = ({ isOpen, onClose, activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'contact', label: 'Contact Info', icon: Info },
  ]

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Phone size={24} />
            <span>GoI Caller</span>
          </div>
          {isOpen && (
            <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
              <X size={20} />
            </button>
          )}
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveView(item.id)
                  if (window.innerWidth < 768) onClose()
                }}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar

