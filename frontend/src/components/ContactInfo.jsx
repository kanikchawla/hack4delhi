import { Mail, Phone, MapPin, Globe, Building2, Clock } from 'lucide-react'

const ContactInfo = () => {
  const contactDetails = {
    organization: "Government of India",
    department: "Digital Services Division",
    address: "North Block, Raisina Hill, New Delhi - 110011",
    phone: "+91-11-23012345",
    email: "support@india.gov.in",
    website: "https://www.india.gov.in",
    workingHours: "Monday to Friday: 9:00 AM - 6:00 PM IST",
    emergency: "+91-11-23012346"
  }

  return (
    <div className="contact-info">
      <div className="contact-header">
        <Building2 size={40} />
        <h2>Government Contact Information</h2>
        <p>Get in touch with Government of India services and support</p>
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <div className="contact-icon">
            <Building2 size={24} />
          </div>
          <h3>Organization</h3>
          <p>{contactDetails.organization}</p>
          <p className="sub-text">{contactDetails.department}</p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <MapPin size={24} />
          </div>
          <h3>Address</h3>
          <p>{contactDetails.address}</p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <Phone size={24} />
          </div>
          <h3>Phone</h3>
          <p><a href={`tel:${contactDetails.phone}`}>{contactDetails.phone}</a></p>
          <p className="sub-text">Emergency: <a href={`tel:${contactDetails.emergency}`}>{contactDetails.emergency}</a></p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <Mail size={24} />
          </div>
          <h3>Email</h3>
          <p><a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a></p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <Globe size={24} />
          </div>
          <h3>Website</h3>
          <p><a href={contactDetails.website} target="_blank" rel="noopener noreferrer">{contactDetails.website}</a></p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <Clock size={24} />
          </div>
          <h3>Working Hours</h3>
          <p>{contactDetails.workingHours}</p>
          <p className="sub-text">Saturday & Sunday: Closed</p>
        </div>
      </div>

      <div className="contact-footer">
        <div className="info-box">
          <h4>About This Service</h4>
          <p>
            This AI-powered voice calling service is designed to assist citizens with government-related 
            queries and information. Our system supports both Hindi and English languages and is available 
            24/7 for your convenience. All calls are logged and documented for record-keeping purposes.
          </p>
        </div>

        <div className="info-box">
          <h4>Technical Support</h4>
          <p>
            For technical issues or assistance with the calling service, please contact our support team 
            at <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a> or call during 
            business hours at <a href={`tel:${contactDetails.phone}`}>{contactDetails.phone}</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ContactInfo