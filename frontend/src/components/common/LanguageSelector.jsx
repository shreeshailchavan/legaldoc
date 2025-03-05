import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Globe } from 'lucide-react';

const LanguageSelector = ({ className = '' }) => {
  const { currentLanguage, setCurrentLanguage, supportedLanguages } = useLanguage();

  const handleLanguageChange = (e) => {
    const selectedLanguage = e.target.value;
    setCurrentLanguage(selectedLanguage);
  };

  return (
    <div className={`language-selector flex items-center ${className}`}>
      <Globe size={16} className="mr-2 text-gray-500" />
      <select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {Object.entries(supportedLanguages).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;