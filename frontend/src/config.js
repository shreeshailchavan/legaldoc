// src/config.js
export const config = {
    // Replace this with your actual ngrok URL when testing locally
    devProxyUrl: 'https://ngrok.com/r/aep',
    isLocalhost: window.location.hostname === 'localhost',
    
    // Helper function to get the correct URL for translation
    getTranslationBaseUrl: () => {
      const isLocal = window.location.hostname === 'localhost';
      if (isLocal) {
        return config.devProxyUrl;
      }
      return window.location.origin;
    }
  };