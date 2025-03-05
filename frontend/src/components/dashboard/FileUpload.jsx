import React from 'react';
import { Upload } from 'lucide-react';

const FileUpload = ({ handleFileUpload, isUploading, isProcessing }) => {
  if (isUploading || isProcessing) {
    return null; // Don't show when uploading/processing

  }

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
      <div className="flex flex-col items-center justify-center">
        <Upload size={48} className="text-blue-600 dark:text-blue-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
          Drag & Drop or Click to Upload
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Support for PDF, DOCX, and image files (JPG, PNG)
        </p>
        <form action="" method="post" encType='multipart/formdata'>

        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.docx,.jpg,.jpeg,.png"
          onChange={(e) => handleFileUpload(e.target.files)}
          />
          </form>
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
  );
};

export default FileUpload;