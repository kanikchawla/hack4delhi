import { createContext, useState, useContext, useEffect } from 'react'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('appLanguage')
    return saved || 'en'
  })

  useEffect(() => {
    localStorage.setItem('appLanguage', language)
  }, [language])

  const toggleLanguage = () => {
    setLanguage(lang => lang === 'en' ? 'hi' : 'en')
  }

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
