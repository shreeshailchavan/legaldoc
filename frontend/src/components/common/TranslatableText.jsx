// src/components/common/TranslatableText.jsx
import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// This component handles automatic translation of text content
const TranslatableText = ({ 
  children, 
  translationKey = null, // Optional key to use predefined translations
  component = 'span',    // HTML element to render
  className = '',        // CSS classes
  ...rest               // Additional props to pass to the element
}) => {
  const { currentLanguage, translateText } = useLanguage();
  const [translatedText, setTranslatedText] = useState(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Skip translation if the text is empty
    if (!children) {
      setTranslatedText('');
      return;
    }

    // Skip translation if we're already using English
    if (currentLanguage === 'en') {
      setTranslatedText(children);
      return;
    }

    const performTranslation = async () => {
      setIsLoading(true);
      try {
        const result = await translateText(children, currentLanguage);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation failed:', error);
        // Fallback to original text
        setTranslatedText(children);
      } finally {
        setIsLoading(false);
      }
    };

    performTranslation();
  }, [children, currentLanguage, translateText]);

  // Dynamic component rendering (span, p, h1, etc.)
  const Component = component;

  return (
    <Component 
      className={`${className} ${isLoading ? 'opacity-70' : ''}`} 
      {...rest}
    >
      {translatedText || children}
    </Component>
  );
};

export default TranslatableText;