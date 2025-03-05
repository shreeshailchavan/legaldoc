import React from 'react';
import { Mic } from 'lucide-react';

const Navbar = ({ startSpeechRecognition, isRecording }) => {
  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-4 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Dashboard</h1>
      
      <div className="flex items-center space-x-4">
        <button 
          className="flex items-center justify-center h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white rounded-lg transition duration-150 ease-in-out"
          onClick={startSpeechRecognition}
          disabled={isRecording}
        >
          <Mic size={18} className="mr-2" />
          <span>Speech Input</span>
        </button>
        
        <div className="relative">
          <button className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-700 dark:text-gray-300">
            <span className="text-sm font-medium">JD</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
