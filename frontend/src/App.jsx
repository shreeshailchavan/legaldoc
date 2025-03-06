// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Register, Login } from './components/auth';
import Dashboard from './components/DashboardPage';
import SimplifiedResultPage from './components/SimplifiedResult';
import WelcomePage from './components/WelcomePage';
import { BrowserTranslationProvider } from './components/contexts/BrowserTranslationContext';
import ErrorBoundary from './components/common/ErrorBoundry';
import LanguageContext from './components/contexts/LanguageContext';
import { ResultProvider } from './components/contexts/ResultContext';

// Create a PrivateRoute wrapper component
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('authToken');
  return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(
    localStorage.getItem('termsAccepted') === 'true'
  );
  
  const acceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setHasAcceptedTerms(true);
  };
  
  return (
    <ErrorBoundary>
      <BrowserTranslationProvider>
        {!hasAcceptedTerms ? (
          <WelcomePage onAccept={acceptTerms} />
        ) : (
          <ResultProvider>
          <Router>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                     </PrivateRoute>
                  }
                  />
              <Route 
                path="/simplified-result/:id" 
                element={
                  <PrivateRoute>
                  
                  <SimplifiedResultPage />
                  
                   </PrivateRoute>
                }
                />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </Router>
        </ResultProvider>
        )}
      </BrowserTranslationProvider>
    </ErrorBoundary>
  );
};

export default App;