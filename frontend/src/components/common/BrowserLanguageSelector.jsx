// src/components/common/BrowserLanguageSelector.jsx
import { useState, useRef, useEffect } from 'react';
import { useBrowserTranslation } from '../contexts/BrowserTranslationContext';
import { Globe } from 'lucide-react';

const BrowserLanguageSelector = () => {
  const { 
    currentLanguage, 
    changeLanguage, 
    supportedLanguages, 
    getCurrentLanguageObject,
    isInGoogleTranslate
  } = useBrowserTranslation();
  
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const currentLang = getCurrentLanguageObject();

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={toggleDropdown}
        className="flex items-center space-x-1 px-3 py-2 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe size={16} className="text-gray-600 dark:text-gray-300" />
        <span className="text-sm text-gray-700 dark:text-gray-300">{currentLang.nativeName}</span>
        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 py-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700">
          <ul 
            className="py-1 max-h-60 overflow-y-auto" 
            role="listbox"
            aria-activedescendant={currentLanguage}
          >
            {supportedLanguages.map((language) => (
              <li 
                key={language.code}
                id={language.code}
                role="option"
                aria-selected={currentLanguage === language.code}
                className={`px-4 py-2 text-sm cursor-pointer flex justify-between items-center
                  ${currentLanguage === language.code 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <span>{language.nativeName}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{language.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BrowserLanguageSelector;