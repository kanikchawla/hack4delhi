import { Phone, PhoneIncoming, PhoneOutgoing, FileText, BarChart3, Info, X } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, activeView, setActiveView }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: BarChart3 },
    { id: 'inbound', label: 'Inbound Logs', icon: PhoneIncoming },
    { id: 'outbound', label: 'Outbound Calls', icon: PhoneOutgoing },
    { id: 'queries', label: 'Queries & Docs', icon: FileText },
    { id: 'contact', label: 'Govt Contact Info', icon: Info },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem of India" />
            <span>Govt of India</span>
          </div>
          {isOpen && (
            <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
              <X size={20} />
            </button>
          )}
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`nav-item ${activeView === item.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveView(item.id);
                  if (window.innerWidth < 768) onClose();
                }}
                aria-current={activeView === item.id ? 'page' : undefined}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;