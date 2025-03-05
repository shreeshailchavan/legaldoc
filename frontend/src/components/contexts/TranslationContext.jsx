// src/contexts/TranslationContext.jsx
import React, { createContext, useState, useContext, useMemo } from 'react';

// Supported languages
export const LANGUAGES = {
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
const TranslationContext = createContext();

// Create a provider component
export const TranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  // Custom translation function (mock implementation)
  const translateText = async (text, targetLanguage) => {
    // In a real-world scenario, you would:
    // 1. Check if translation is in cache
    // 2. Call an actual translation API (Google Translate, DeepL, etc.)
    // 3. Cache the result
    
    // Mock translation (just prepends language code)
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`[${targetLanguage}] ${text}`);
      }, 500);
    });
  };

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    currentLanguage,
    setCurrentLanguage,
    translateText,
    supportedLanguages: LANGUAGES
  }), [currentLanguage]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Custom hook to use the translation context
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  
  return context;
};