import { Mail, Phone, MapPin, Globe, Building2, Clock } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { translations } from '../translations/en-hi'

const ContactInfo = () => {
  const { language } = useLanguage()
  const t = translations[language] || translations['en']
  const contactDetails = {
    organization: t.organizationValue,
    department: t.departmentValue,
    address: t.addressValue,
    phone: t.phoneValue,
    email: t.emailValue,
    website: t.websiteValue,
    workingHours: t.workingHoursValue,
    emergency: t.emergencyValue
  }

  return (
    <div className="contact-info">
      <div className="contact-header">
        <Building2 size={40} />
        <h2>{t.governmentContactInfo}</h2>
        <p>{t.getInTouch}</p>
      </div>

      <div className="contact-grid">
        <div className="contact-card">
          <div className="contact-icon">
            <Building2 size={24} />
          </div>
          <h3>{t.organization}</h3>
          <p>{contactDetails.organization}</p>
          <p className="sub-text">{contactDetails.department}</p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <MapPin size={24} />
          </div>
          <h3>{t.address}</h3>
          <p>{contactDetails.address}</p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <Phone size={24} />
          </div>
          <h3>{t.phone}</h3>
          <p><a href={`tel:${contactDetails.phone}`}>{contactDetails.phone}</a></p>
          <p className="sub-text">{t.emergency}: <a href={`tel:${contactDetails.emergency}`}>{contactDetails.emergency}</a></p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <Mail size={24} />
          </div>
          <h3>{t.email}</h3>
          <p><a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a></p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <Globe size={24} />
          </div>
          <h3>{t.website}</h3>
          <p><a href={contactDetails.website} target="_blank" rel="noopener noreferrer">{contactDetails.website}</a></p>
        </div>

        <div className="contact-card">
          <div className="contact-icon">
            <Clock size={24} />
          </div>
          <h3>{t.workingHours}</h3>
          <p>{contactDetails.workingHours}</p>
          <p className="sub-text">{t.saturdaySundayClosed}</p>
        </div>
      </div>

      <div className="contact-footer">
        <div className="info-box">
          <h4>{t.aboutThisService}</h4>
          <p>
            {t.aboutThisServiceDesc}
          </p>
        </div>

        <div className="info-box">
          <h4>{t.technicalSupport}</h4>
          <p>
            {t.technicalSupportDesc} <a href={`mailto:${contactDetails.email}`}>{contactDetails.email}</a> or call during 
            business hours at <a href={`tel:${contactDetails.phone}`}>{contactDetails.phone}</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ContactInfo