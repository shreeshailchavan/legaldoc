// src/components/SimplifiedResultPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useResult } from './contexts/ResultContext';
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  Printer, 
  MessageSquare, 
  Check,
  Volume2,
  Mic,
  VolumeX
} from 'lucide-react';

const SimplifiedResultPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [documentData, setDocumentData] = useState(null);
  const [viewMode, setViewMode] = useState('dual'); // 'dual', 'original', 'simplified'
  const [copied, setCopied] = useState(false);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechText, setSpeechText] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);

  const { results } = useResult();
  const result = results[id]; 
  console.log(results)
  console.log(result);


  // Text-to-Speech States
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSource, setAudioSource] = useState(null);
  const audioRef = useRef(null);
  
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        if (id === 'speech') {
          setDocumentData({
            title: 'Dictated Text',
            dateProcessed: new Date(),
            simplificationLevel: 'Moderate',
            originalText: result.legal_res.original_text,
            
            simplifiedText: result.legal_res.simplified_text
          });
        } else {
          setDocumentData({
            title: 'Rental Agreement.pdf',
            dateProcessed: new Date(),
            simplificationLevel: 'Moderate',
            originalText: results[id].legal_res.original_text,
            
            simplifiedText:results[id].legal_res.simplified_text
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching document:', error);
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id]);

  // Text-to-Speech Handler (Backend Route)
  const handleTextToSpeech = async (text, mode = 'simplified') => {
    // Stop any ongoing speech
    if (audioRef.current) {
      audioRef.current.pause();
    }

    try {
      // Determine which text to use
      const textToConvert = mode === 'simplified' 
        ? documentData.simplifiedText 
        : documentData.originalText;

      // Call backend text-to-speech route
      const response = await axios.post('/api/text-to-speech', 
        { 
          text: textToConvert,
          voice: 'default', 
          language: 'en-US'
        },
        { 
          responseType: 'blob' 
        }
      );

      // Create audio blob URL
      const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Set audio source and play
      setAudioSource(audioUrl);
      setIsSpeaking(true);

      // Create audio element
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsSpeaking(false);
      });

    } catch (error) {
      console.error('Text-to-Speech conversion failed:', error);
      
      // Fallback to browser speech synthesis if backend fails
      fallbackBrowserSpeech(text);
    }
  };

  // Fallback Browser Speech Synthesis
  const fallbackBrowserSpeech = (text) => {
    // Check if browser supports speech synthesis
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      // Create speech utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Optional: Customize voice, rate, pitch
      utterance.rate = 0.9; 
      utterance.pitch = 1; 

      // Event listeners
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      // Speak the text
      window.speechSynthesis.speak(utterance);
    } else {
      console.error('Browser does not support speech synthesis');
    }
  };

  // Stop Speech
  const stopSpeech = () => {
    // Stop backend audio
    if (audioRef.current) {
      audioRef.current.pause();
      setIsSpeaking(false);
      URL.revokeObjectURL(audioSource);
    }

    // Stop browser speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Copy Text Handler
  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        console.log('Failed to copy text. Please try again.');
      });
  };

  // Download Handler
  const handleDownload = () => {
    const element = document.createElement('a');
    const textToDownload = documentData.simplifiedText;
    const file = new Blob([textToDownload], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${documentData.title.split('.')[0]}-simplified.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Print Handler
  const handlePrint = () => {
    const textToPrint = documentData.simplifiedText;
    
    const printContent = `
      <html>
        <head>
          <title>${documentData.title} - Simplified</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; padding: 20px; }
            h1 { color: #2563eb; }
            .content { margin-top: 20px; white-space: pre-wrap; }
            .footer { margin-top: 40px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <h1>${documentData.title} - Simplified</h1>
          <div class="content">${textToPrint.replace(/\n/g, '<br>')}</div>
          <div class="footer">Simplified by Legal Document Simplifier on ${new Date().toLocaleDateString()}</div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    
    // Print after a small delay to ensure content loads
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Ask Question Handler
  const askQuestion = async () => {
    if (!question.trim()) {
      console.log('Please enter a question first.');
      return;
    }
    
    setAskingQuestion(true);
    
    try {
      // Simulate API call delay (optional)
      await new Promise(resolve => setTimeout(resolve, 1500));
    
      // Retrieve authentication token
      const authToken = localStorage.getItem("authToken");
    
      if (!authToken) {
        console.error("No authentication token found.");
        return;
      }
    
      // Ensure 'id' exists in 'results'
      if (!results[id]) {
        console.error("Invalid ID. Unable to retrieve legal context.");
        return;
      }
    
      // Prepare headers
      const headers = {
        "Authorization": `Token ${authToken}`,
        "Content-Type": "multipart/form-data",
      };
    
      // Prepare form data
      const formData = new FormData();
      formData.append("prompt", question + " for this context " + results[id].legal_res.original_text);
    
      // Send request to backend (correct headers placement)
      const response = await axios.post("http://localhost:8000/api/users/chat/", formData, { headers });
    
      // Extract the AI response
      const answer = response.data.response;
    
      // Update UI with the answer
      setAnswer(answer);
      setShowAnswer(true);
    
    } catch (error) {
      console.error("Error asking question:", error);
      console.log("Failed to process your question. Please try again.");
    } finally {
      setAskingQuestion(false);
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

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-10 w-10 text-blue-600 dark:text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-700 dark:text-gray-300">
            Loading document...
          </p>
        </div>
      </div>
    );
  }

  // Document Not Found State
  if (!documentData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            Document Not Found
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            The document you're looking for could not be found or has been removed.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                {documentData.title}
              </h1>
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="mr-3">
                  Processed on {documentData.dateProcessed.toLocaleDateString()}
                </span>
                <span className="mr-3">•</span>
                <span>
                  Level: 
                  <span className="ml-1 font-medium">
                    {documentData.simplificationLevel}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* View Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-6">
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('dual')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                viewMode === 'dual' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('original')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                viewMode === 'original' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Original Only
            </button>
            <button
              onClick={() => setViewMode('simplified')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                viewMode === 'simplified' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Simplified Only
            </button>
          </div>
          
          <div className="flex space-x-2 items-center">
            {/* Text-to-Speech Buttons */}
            <div className="flex items-center space-x-2">
              {isSpeaking ? (
                <button
                  onClick={stopSpeech}
                  className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900"
                >
                  <VolumeX size={16} className="mr-1.5" />
                  Stop
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleTextToSpeech(documentData.simplifiedText, 'simplified')}
                    className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900"
                  >
                    <Volume2 size={16} className="mr-1.5" />
                    Speak Simplified
                  </button>
                  <button
                    onClick={() => handleTextToSpeech(documentData.originalText, 'original')}
                    className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900"
                  >
                    <Volume2 size={16} className="mr-1.5" />
                    Speak Original
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <button
              onClick={() => handleCopyText(documentData.simplifiedText)}
              className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {copied ? <Check size={16} className="mr-1.5" /> : <Copy size={16} className="mr-1.5" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Download size={16} className="mr-1.5" />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Printer size={16} className="mr-1.5" />
              Print
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="p-6">
        {/* Document Content */}
        <div className={`grid ${viewMode === 'dual' ? 'grid-cols-1 lg:grid-cols-2 gap-6' : 'grid-cols-1'} mb-8`}>
          {/* Original Text */}
          {(viewMode === 'dual' || viewMode === 'original') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Original Text
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-y-auto max-h-[60vh] whitespace-pre-wrap">
                <p className="text-gray-800 dark:text-gray-200">
                  {documentData.originalText}
                </p>
              </div>
            </div>
          )}
          
          {/* Simplified Text */}
          {(viewMode === 'dual' || viewMode === 'simplified') && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                Simplified Text
              </h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 overflow-y-auto max-h-[60vh] whitespace-pre-wrap">
                <p className="text-gray-800 dark:text-gray-200">
                  {documentData.simplifiedText}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Ask AI Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Ask about this document
          </h2>
          
          <div className="flex space-x-2 mb-6">
            <input
              type="text"
              placeholder="E.g., What is the security deposit amount?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {/* <input type="text" id="user_question" name="original_text" value={results[id].legal_res.original_text} hidden /> */}
            <button
              onClick={askQuestion}
              disabled={askingQuestion || !question.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
            >
              {askingQuestion ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                'Ask Question'
              )}
            </button>

            <button 
              className="flex items-center justify-center h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition duration-150 ease-in-out speech-input-intro"
              onClick={startSpeechRecognition}
              disabled={isRecording}
            >
              <Mic size={18} className="mr-2" />
              <span>Speech Input</span>
            </button>
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
                    onClick={askQuestion}
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

          
          {showAnswer && (
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <div className="flex items-start mb-2">
                <div className="flex-shrink-0 mt-0.5">
                  <MessageSquare size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    Answer:
                  </p>
                </div>
              </div>
              <div className="pl-7">
                <p className="text-gray-800 dark:text-gray-200">{answer}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimplifiedResultPage;