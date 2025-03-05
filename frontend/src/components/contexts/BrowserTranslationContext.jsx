import React, { createContext, useState, useContext, useEffect } from 'react';

const BrowserTranslationContext = createContext();

export const useBrowserTranslation = () => useContext(BrowserTranslationContext);

export const BrowserTranslationProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Check cookie for existing language preference
    const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
    return match && match[1] ? match[1] : 'en';
  });
  
  const [isTranslateReady, setIsTranslateReady] = useState(false);
  
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'mr', name: 'मराठी (Marathi)' },
    { code: 'gu', name: 'ગુજરાતી (Gujarati)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ml', name: 'മലയാളം (Malayalam)' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'or', name: 'ଓଡ଼ିଆ (Odia)' },
    { code: 'as', name: 'অসমীয়া (Assamese)' },
    { code: 'sd', name: 'سنڌي (Sindhi)' },
    { code: 'ur', name: 'اردو (Urdu)' }
  ];

  // Initialize Google Translate check
  useEffect(() => {
    // Function to check if Google Translate is ready
    const checkGoogleTranslate = () => {
      if (document.querySelector('.goog-te-combo') || 
          (window.google && window.google.translate)) {
        setIsTranslateReady(true);
        return true;
      }
      return false;
    };
    
    // Initial check
    if (checkGoogleTranslate()) return;
    
    // Set up observer for when Google Translate adds elements
    const observer = new MutationObserver((mutations) => {
      if (checkGoogleTranslate()) {
        observer.disconnect();
      }
    });
    
    // Start observing the body for changes
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // Fallback - check periodically
    const interval = setInterval(() => {
      if (checkGoogleTranslate()) {
        clearInterval(interval);
      }
    }, 1000);
    
    // Set a timeout to force readiness after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsTranslateReady(true);
    }, 5000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, []);

  // Function to detect language changes
  useEffect(() => {
    const detectLanguageChange = () => {
      // Method 1: Check cookie
      const match = document.cookie.match(/googtrans=\/en\/([^;]+)/);
      if (match && match[1] && match[1] !== currentLanguage) {
        setCurrentLanguage(match[1]);
        return;
      }
      
      // Method 2: Check HTML lang attribute
      const htmlLang = document.documentElement.lang;
      if (htmlLang && htmlLang !== 'en' && htmlLang !== currentLanguage) {
        setCurrentLanguage(htmlLang);
      }
    };
    
    // Set up observer for attribute changes on html element
    const observer = new MutationObserver(detectLanguageChange);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['lang'] 
    });
    
    // Also check periodically (some changes might not trigger observer)
    const interval = setInterval(detectLanguageChange, 2000);
    
    return () => {
      observer.disconnect();
      clearInterval(interval);
    };
  }, [currentLanguage]);

  // Function to change language
  const changeLanguage = (langCode) => {
    if (langCode === currentLanguage) return;
    
    try {
      // Update internal state
      setCurrentLanguage(langCode);
      
      // Method 1: Try using Google Translate element
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        return;
      }
      
      // Method 2: Try direct API
      if (window.google && window.google.translate) {
        if (window.google.translate.TranslateElement) {
          window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,gu,te,ta,kn,ml,pa,bn,or,as,sd,ur',
            autoDisplay: false
          }, 'google_translate_element');
        }
      }
      
      // Method 3: Use cookies
      const domain = window.location.hostname;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain}`;
      document.cookie = `googtrans=/en/${langCode}; path=/`;
      
      // If all else fails, reload the page (last resort)
      if (!selectElement && (!window.google || !window.google.translate)) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  return (
    <BrowserTranslationContext.Provider 
      value={{
        currentLanguage,
        changeLanguage,
        isTranslateReady,
        languages
      }}
    >
      {children}
    </BrowserTranslationContext.Provider>
  );
};