// src/components/common/TranslateButton.jsx
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

// This button component is used for translating larger blocks of text on demand
// rather than automatically
const TranslateButton = ({ 
  text, 
  onTranslated, 
  buttonText = "Translate", 
  className = "" 
}) => {
  const { translateText, currentLanguage } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!text || isTranslating) return;
    
    setIsTranslating(true);
    try {
      const translatedText = await translateText(text, currentLanguage);
      onTranslated(translatedText);
    } catch (error) {
      console.error('Translation failed:', error);
      // You might want to show a toast notification here
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <button
      onClick={handleTranslate}
      disabled={isTranslating || currentLanguage === 'en'}
      className={`inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md 
        ${currentLanguage === 'en' 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' 
          : 'bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
        } transition-colors duration-200 ${className}`}
    >
      <Globe size={16} className="mr-1.5" />
      
      {isTranslating ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Translating...
        </>
      ) : (
        buttonText
      )}
    </button>
  );
};

export default TranslateButton;