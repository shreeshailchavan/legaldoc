import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, resolvePath, useNavigate } from 'react-router-dom';

import { 
  FilePen, 
  Upload, 
  History, 
  Settings, 
  LogOut,
  Moon,
  Sun,
  Mic,
  HelpCircle
} from 'lucide-react';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';
import BrowserLanguageSelector from './common/BrowserLanguageSelector';
import { useBrowserTranslation } from './contexts/BrowserTranslationContext';
import axios from 'axios'
import { useResult } from './contexts/ResultContext';




const Dashboard = () => {
  
  const navigate = useNavigate();
  const  { saveResult  } = useResult(); // Access context function

  const { currentLanguage } = useBrowserTranslation();
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('darkMode') === 'true' || 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentDocs, setRecentDocs] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [stats, setStats] = useState({
    totalDocuments: 0,
    simplifiedToday: 0,
    savedTime: 0,
    wordsSimplified: 0
  });

  

  // Intro.js state
  const [introEnabled, setIntroEnabled] = useState(false);
  const [initialIntro, setInitialIntro] = useState(true);

  // Intro.js steps
  const introSteps = [
    {
      element: '.sidebar-intro',
      intro: 'This is the sidebar. Here you can navigate through different sections of the app, toggle dark mode, and change languages.',
      position: 'right'
    },
    {
      element: '.upload-section-intro',
      intro: 'Upload your legal documents here. You can drag and drop files or click to browse. Choose the simplification level that suits your needs.',
      position: 'top'
    },
    {
      element: '.speech-input-intro',
      intro: 'Use speech recognition to dictate text directly. Great for hands-free document input.',
      position: 'left'
    },
    {
      element: '.stats-section-intro',
      intro: 'Track your document simplification progress. See total documents, time saved, and words simplified.',
      position: 'top'
    },
    {
      element: '.recent-docs-intro',
      intro: 'View your recently processed documents. You can view details or delete documents from here.',
      position: 'top'
    },
    {
      element: '.tips-section-intro',
      intro: 'Quick tips and features of the Legal Document Simplifier app.',
      position: 'left'
    }
  ];

  // Check if it's first-time user
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('hasSeenIntro');
    if (!hasSeenIntro && initialIntro) {
      setIntroEnabled(true);
    }
  }, []);

  // Handle intro completion
  const onIntroComplete = () => {
    setIntroEnabled(false);
    setInitialIntro(false);
    localStorage.setItem('hasSeenIntro', 'true');
  };

  // Manually trigger intro
  const startIntro = () => {
    setIntroEnabled(true);
  };


  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real app, you would fetch from your API
        // Simulating API response for demo purposes
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setRecentDocs([
          { 
            id: 1, 
            title: 'Employment Contract.pdf', 
            dateUploaded: new Date(2025, 2, 1),
            size: '1.2 MB',
            simplificationLevel: 'Moderate',
            status: 'Completed'
          },
          { 
            id: 2, 
            title: 'Rental Agreement.docx', 
            dateUploaded: new Date(2025, 2, 3),
            size: '850 KB',
            simplificationLevel: 'Mild', 
            status: 'Completed'
          },
          { 
            id: 3, 
            title: 'Terms of Service.pdf', 
            dateUploaded: new Date(2025, 2, 4),
            size: '2.3 MB',
            simplificationLevel: 'Extreme',
            status: 'Completed'
          }
        ]);
        
        setStats({
          totalDocuments: 18,
          simplifiedToday: 2,
          savedTime: 240, // minutes
          wordsSimplified: 45680
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        console.log('Failed to load dashboard data. Please try again later.');
      }
    };
    
    fetchDashboardData();
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };
  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) {
      console.error("No file selected.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append("file", files[0]);

      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        console.error("Authentication token not found. Please log in.");
        alert("Please log in to upload files.");
        setIsUploading(false);
        return;
      }

      console.log("Uploading file:", files[0].name);
      console.log("Auth Token:", authToken);

      const response = await axios.post(
        "http://localhost:8000/api/users/upload/",
        formData,
        {
          headers: {
            "Authorization": `Token ${authToken}`, // Correct token format
            "Content-Type": "multipart/form-data", // Ensures file upload works correctly
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadProgress(progress);
          },
        }
      );

      console.log("File uploaded successfully:", response.data);

      // Handle success response
      alert("File uploaded successfully!");
       const { file_id } = response.data;
       console.log(file_id);
       

      console.log("saveResult function:", saveResult); // ✅ Debugging Log

      if (typeof saveResult === "function") {
        saveResult(file_id, response.data); // ✅ Ensure it's a function before calling
      } else {
        console.error("saveResult is not a function! Check context usage.");
      }

      navigate(`/simplified-result/${file_id}`);
    } catch (error) {
      console.error("Error uploading file:", error);

      if (error.response) {
        // Server response with error message
        console.error("Server Error:", error.response.data);
        alert(`Upload failed: ${error.response.data.error || "Unknown error"}`);
      } else if (error.request) {
        // No response from server
        alert("Server is not responding. Please try again later.");
      } else {
        // Other errors
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Start speech recognition
  const startSpeechRecognition = () => {
    if (!('webkitSpeechRecognition' in window)) {
      console.log('Speech recognition is not supported in your browser.');
      return;
    }
    
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    
    recognition.onstart = () => {
      setIsRecording(true);
      console.log('Speech recognition started. Speak now...');
    };
    
    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }
      
      setSpeechText(finalTranscript || interimTranscript);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      console.log('Speech recognition error. Please try again.');
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.start();
    
    // Stop recording after 30 seconds
    setTimeout(() => {
      if (recognition) {
        recognition.stop();
      }
    }, 30000);
  };

  // Navigation menu items
  const menuItems = [
    { name: 'Dashboard', icon: <FilePen size={20} />, path: '/dashboard' },
    { name: 'Upload', icon: <Upload size={20} />, path: '/dashboard' },
    { name: 'History', icon: <History size={20} />, path: '/history' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Intro.js Steps */}
      <Steps
        enabled={introEnabled}
        steps={introSteps}
        initialStep={0}
        onExit={onIntroComplete}
        onComplete={onIntroComplete}
      />

      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-20'} sidebar-intro transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen relative`}
      >
        <div className="h-full flex flex-col justify-between">
          <div>
            {/* App Logo/Name */}
            <div className="p-4 flex items-center justify-between">
              {sidebarOpen ? (
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  Legal Simplifier
                </h1>
              ) : (
                <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">LS</h1>
              )}
              
              {/* Sidebar Toggle Button */}
              <button 
                onClick={toggleSidebar}
                className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {sidebarOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* Navigation Menu */}
            <nav className="mt-6">
              <ul className="space-y-2 px-4">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      to={item.path}
                      className="flex items-center p-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {sidebarOpen && <span>{item.name}</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          
          {/* Sidebar Footer */}
          <div className="p-4 mt-auto">
            {sidebarOpen && (
              <div className="mb-4">
                <BrowserLanguageSelector />
              </div>
            )}
            
            {/* Dark Mode Toggle */}
            <div className="flex items-center mb-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              {sidebarOpen && (
                <span className="ml-3 text-gray-600 dark:text-gray-300">
                  {darkMode ? 'Light Mode' : 'Dark Mode'}
                </span>
              )}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="ml-3">Logout</span>}
            </button>
          </div>
        </div>

        {/* Help/Intro Tour Button */}
        <div className="absolute bottom-4 right-4">
          <button 
            onClick={startIntro}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
            title="Show App Tour"
          >
            <HelpCircle size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
            Dashboard
          </h1>
          
          {/* Top Navigation Right Side */}
          <div className="flex items-center space-x-4">
            {!sidebarOpen && <BrowserLanguageSelector />}
            
            {/* Speech Input Button */}
            <button 
              className="flex items-center justify-center h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition duration-150 ease-in-out speech-input-intro"
              onClick={startSpeechRecognition}
              disabled={isRecording}
            >
              <Mic size={18} className="mr-2" />
              <span>Speech Input</span>
            </button>
            
            {/* User Profile */}
            <div className="relative">
              <button className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
                <span className="text-sm font-medium">JD</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 stats-section-intro">
            {/* Total Documents */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total Documents
              </span>
              <span className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                {stats.totalDocuments}
              </span>
            </div>
            
            {/* Simplified Today */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Simplified Today
              </span>
              <span className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                {stats.simplifiedToday}
              </span>
            </div>
            
            {/* Time Saved */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Time Saved
              </span>
              <span className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                {Math.floor(stats.savedTime / 60)}h {stats.savedTime % 60}m
              </span>
            </div>
            
            {/* Words Simplified */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex flex-col">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Words Simplified
              </span>
              <span className="text-3xl font-bold text-gray-800 dark:text-white mt-2">
                {stats.wordsSimplified.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Speech Recognition Section */}
          {(isRecording || speechText) && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8 speech-input-intro">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Speech Recognition
                </h2>
                <div className="flex space-x-2">
                  {isRecording ? (
                    <button 
                      onClick={() => setIsRecording(false)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                    >
                      Stop Recording
                    </button>
                  ) : (
                    <button 
                      onClick={startSpeechRecognition}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                    >
                      Start Recording
                    </button>
                  )}
                  
                  <button 
                    onClick={() => navigate('/simplified-result/speech')}
                    disabled={!speechText.trim()}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Process Text
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 min-h-24 max-h-48 overflow-y-auto">
                {speechText ? (
                  <p className="text-gray-800 dark:text-gray-200">{speechText}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">
                    {isRecording ? 'Listening...' : 'Speech will appear here...'}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Upload and Processing Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Upload Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 lg:col-span-2 upload-section-intro">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Upload Document
              </h2>
              
              {(isUploading || isProcessing) ? (
                <div className="py-8">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex items-center justify-center mb-4">
                      {isUploading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600 dark:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            Uploading... {uploadProgress}%
                          </span>
                        </>
                      ) : isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-green-600 dark:text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">
                            Processing document...
                          </span>
                        </>
                      ) : (
                        <span className="text-green-600 dark:text-green-500">
                          Upload complete!
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Upload size={48} className="text-blue-600 dark:text-blue-500 mb-4" />
                    <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                      Drag & Drop or Click to Upload
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Support for PDF, DOCX, and image files (JPG, PNG)
                    </p>
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".pdf,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                    <label
                      htmlFor="file-upload"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer"
                    >
                      Browse Files
                    </label>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Simplification Level
                    </h4>
                    <div className="flex justify-center space-x-4">
                      {['Mild', 'Moderate', 'Extreme'].map((level) => (
                        <div key={level} className="flex items-center">
                          <input
                            type="radio"
                            id={level}
                            name="simplification-level"
                            value={level}
                            defaultChecked={level === 'Moderate'}
                            className="mr-2"
                          />
                          <label htmlFor={level} className="text-sm text-gray-600 dark:text-gray-400">
                            {level}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Tips Section */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 tips-section-intro">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Tips & Features
              </h2>
              
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      1
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Upload any legal document</strong> - OCR technology will extract text from PDFs and images
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      2
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Select simplification level</strong> - Choose between mild, moderate, or extreme simplification
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      3
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Voice input available</strong> - Use the speech recognition feature to dictate text
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      4
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>100% private processing</strong> - All documents are processed locally on your device
                    </p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      5
                    </div>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Language Translation</strong> - Change the language and use browser translation for global accessibility
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Recent Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow recent-docs-intro">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                Recent Documents
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Document Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentDocs.length > 0 ? (
                    recentDocs.map((doc) => (
                      <tr key={doc.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {doc.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {doc.dateUploaded.toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {doc.size}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${doc.simplificationLevel === 'Mild' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                              doc.simplificationLevel === 'Moderate' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                              'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'}`
                          }>
                            {doc.simplificationLevel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {doc.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            to={`/simplified-result/${doc.id}`}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                          >
                            View
                          </Link>
                          <button className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No documents yet. Upload your first document to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;