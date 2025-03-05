// src/contexts/LanguageContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

// Supported languages
const LANGUAGES = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  gu: 'Gujarati',
  te: 'Telugu',
  ta: 'Tamil',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
  bn: 'Bengali',
  or: 'Odia',
  as: 'Assamese',
  sd: 'Sindhi',
  ur: 'Urdu'
};

// Create the context
const LanguageContext = createContext();

// Provider component
export function LanguageProvider({ children }) {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Detect browser language on initial load
  useEffect(() => {
    const browserLanguage = navigator.language.split('-')[0];
    if (LANGUAGES[browserLanguage]) {
      setCurrentLanguage(browserLanguage);
    }
  }, []);

  // Mock translation function (replace with actual translation service)
  const translateText = async (text, targetLanguage = currentLanguage) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simple mock translation - just prepend language code
        resolve(`[${targetLanguage}] ${text}`);
      }, 500);
    });
  };

  const value = {
    currentLanguage,
    setCurrentLanguage,
    translateText,
    supportedLanguages: LANGUAGES
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use the language context
export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}

// Export as default the original context for reference if needed
export default LanguageContext;