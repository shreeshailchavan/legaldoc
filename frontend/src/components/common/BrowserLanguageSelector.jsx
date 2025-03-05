import React, { useState, useEffect } from 'react';
import { useBrowserTranslation } from '../contexts/BrowserTranslationContext';
import { ChevronDown, Check } from 'lucide-react';

const BrowserLanguageSelector = ({ compact = false }) => {
  const { languages, currentLanguage, changeLanguage, isTranslateReady } = useBrowserTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [localReady, setLocalReady] = useState(false);

  // Additional check to ensure we can proceed even if context doesn't report ready
  useEffect(() => {
    // Try to find Google Translate element
    const checkGoogleTranslate = () => {
      if (document.querySelector('.goog-te-combo') || 
          (window.google && window.google.translate)) {
        setLocalReady(true);
        return true;
      }
      return false;
    };

    // Check immediately
    if (!checkGoogleTranslate()) {
      // Set up a retry mechanism
      const interval = setInterval(() => {
        if (checkGoogleTranslate()) {
          clearInterval(interval);
        }
      }, 500);
      
      // Clear interval after 5 seconds max to prevent infinite checking
      setTimeout(() => {
        clearInterval(interval);
        // Force enable after timeout
        setLocalReady(true);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, []);
  
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  const handleLanguageChange = (langCode) => {
    try {
      // Try multiple methods to change language
      
      // Method 1: Direct Google Translate element
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Update language in context
        if (typeof changeLanguage === 'function') {
          changeLanguage(langCode);
        }
        
        setIsOpen(false);
        return;
      }
      
      // Method 2: Cookies
      const domain = window.location.hostname;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=${domain}`;
      document.cookie = `googtrans=/en/${langCode}; path=/; domain=.${domain}`;
      
      // Method 3: Reload as last resort
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Error changing language:', error);
      
      // Fallback - force reload with cookie
      document.cookie = `googtrans=/en/${langCode}; path=/;`;
      window.location.reload();
    }
    
    setIsOpen(false);
  };

  // Find current language name
  const currentLangName = languages.find(lang => lang.code === currentLanguage)?.name || 'English';

  // Use either context readiness state or our local detection
  const ready = isTranslateReady || localReady;

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className={`flex items-center justify-between rounded-md bg-gray-100 dark:bg-gray-700 
          ${compact ? 'px-2 py-1 text-sm' : 'px-3 py-2'} 
          hover:bg-gray-200 dark:hover:bg-gray-600
          text-gray-700 dark:text-gray-300 transition-colors duration-150 w-full`}
      >
        <span className={compact ? 'mr-1' : 'mr-2'}>
          {compact ? currentLanguage.toUpperCase() : currentLangName}
        </span>
        <ChevronDown size={compact ? 14 : 16} />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <ul className="py-1">
            {languages.map((language) => (
              <li key={language.code}>
                <button
                  onClick={() => handleLanguageChange(language.code)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span>{language.name}</span>
                  {currentLanguage === language.code && (
                    <Check size={16} className="text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BrowserLanguageSelector;