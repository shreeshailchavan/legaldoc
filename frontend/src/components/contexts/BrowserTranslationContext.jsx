// src/contexts/BrowserTranslationContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';

// List of supported languages
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া' },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو' }
];

// Create the context
const BrowserTranslationContext = createContext();

// Hook to use the context
export const useBrowserTranslation = () => {
  const context = useContext(BrowserTranslationContext);
  if (!context) {
    throw new Error('useBrowserTranslation must be used within a BrowserTranslationProvider');
  }
  return context;
};

// The provider component
export const BrowserTranslationProvider = ({ children }) => {
  // Check if we're in a Google translated page
  const isInGoogleTranslatedPage = () => {
    return window.location.hostname.includes('translate.goog') || 
           window.location.href.includes('translate.google') ||
           document.documentElement.classList.contains('translated-ltr') ||
           document.documentElement.classList.contains('translated-rtl');
  };
  
  // Get the original URL (not the Google Translate URL)
  const getOriginalUrl = () => {
    if (window.location.hostname.includes('translate.goog')) {
      // Extract original URL from translate.goog URL format
      const currentUrl = window.location.href;
      const urlParts = currentUrl.split('_x_tr_');
      if (urlParts.length > 1) {
        const originalUrlPart = urlParts[0].replace('https://translate.goog/', 'https://');
        return originalUrlPart;
      }
    }
    
    // If we can't determine the original URL, return the current URL
    return window.location.href;
  };
  
  // Initial state setup - detect if we're in a translated page
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // If we're in a Google translated page, try to determine the language
    if (isInGoogleTranslatedPage()) {
      // Try to extract language from URL
      const matches = window.location.href.match(/_x_tr_sl=en&_x_tr_tl=([a-z]{2})/);
      if (matches && matches[1]) {
        return matches[1];
      }
      
      // Fallback to stored preference
      return localStorage.getItem('appLanguage') || 'en';
    }
    
    // Not in a translated page, use stored preference or browser language
    return localStorage.getItem('appLanguage') || 
           navigator.language.split('-')[0] || 
           'en';
  });

  // Save language preference to localStorage
  useEffect(() => {
    localStorage.setItem('appLanguage', currentLanguage);
  }, [currentLanguage]);

  // Function to change the current language
  const changeLanguage = (langCode) => {
    // Validate that it's a supported language
    if (supportedLanguages.some(lang => lang.code === langCode)) {
      setCurrentLanguage(langCode);
      
      // If switching to English and we're in a translated page, go back to original
      if (langCode === 'en' && isInGoogleTranslatedPage()) {
        window.location.href = getOriginalUrl();
        return;
      }
      
      // If switching to a non-English language, redirect to Google Translate
      if (langCode !== 'en') {
        // Show confirmation dialog first
        const langObj = supportedLanguages.find(lang => lang.code === langCode);
        if (window.confirm(`This will redirect you to a Google Translated version of this page in ${langObj?.name || langCode}. Continue?`)) {
          // Store language preference before redirect
          localStorage.setItem('appLanguage', langCode);
          
          // Get current URL (or original URL if we're already in a translated page)
          let currentUrl = isInGoogleTranslatedPage() ? getOriginalUrl() : window.location.href;
        
          // Create Google Translate URL
          const translateUrl = `https://translate.google.com/translate?sl=en&tl=${langCode}&u=${encodeURIComponent(currentUrl)}`;
          
          // Redirect to Google Translate
          window.location.href = translateUrl;
        }
      }
    }
  };

  // Function to get the current language object
  const getCurrentLanguageObject = () => {
    return supportedLanguages.find(lang => lang.code === currentLanguage) || supportedLanguages[0];
  };

  // Check if we're in Google Translate
  const [isInGoogleTranslate, setIsInGoogleTranslate] = useState(isInGoogleTranslatedPage());
  
  // Update flag when we detect Google Translate
  useEffect(() => {
    setIsInGoogleTranslate(isInGoogleTranslatedPage());
  }, [currentLanguage]);

  // Prepare the context value
  const value = {
    currentLanguage,
    changeLanguage,
    supportedLanguages,
    getCurrentLanguageObject,
    isInGoogleTranslate
  };

  return (
    <BrowserTranslationContext.Provider value={value}>
      {children}
    </BrowserTranslationContext.Provider>
  );
};

export default BrowserTranslationContext;