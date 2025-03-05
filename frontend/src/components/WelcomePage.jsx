import { useState } from 'react';
import Lottie from 'lottie-react';
import welcomeAnimation from '../assets/animations/welcome.json';

const WelcomePage = ({ onAccept }) => {
  const [readTerms, setReadTerms] = useState(false);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
        <div className="bg-blue-600 dark:bg-blue-800 p-6 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome to Legal Simplifier</h1>
          <p className="text-blue-100 mt-2">AI-powered tool to make legal documents easy to understand</p>
          
          <div className="mt-6 w-64 mx-auto">
            <Lottie 
              animationData={welcomeAnimation} 
              loop={true} 
            />
          </div>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-4">
            Before We Begin
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please take a moment to review our terms and conditions. 
            Our commitment to privacy and security is our top priority.
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg max-h-64 overflow-y-auto mb-6">
            <h3 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Terms and Conditions</h3>
            
            <div className="prose dark:prose-invert max-w-none text-sm">
              <h4>1. Acceptance of Terms</h4>
              <p>
                By using our AI-Powered Legal Document Simplifier, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you may not use our service.
              </p>
              
              <h4>2. Privacy Policy</h4>
              <p>
                Your privacy is important to us. All documents processed through our platform remain private and are processed locally on your device. We do not store or share your documents with third parties.
              </p>
              
              <h4>3. Use of Service</h4>
              <p>
                Our AI-powered simplification is provided as an aid to understanding and should not be considered legal advice. Always consult with a qualified legal professional for legal matters.
              </p>
              
              <h4>4. Limitation of Liability</h4>
              <p>
                We strive for accuracy but cannot guarantee that all simplifications will be 100% accurate or complete. We are not liable for any damages or losses resulting from your reliance on our service.
              </p>
              
              <h4>5. Data Security</h4>
              <p>
                We use industry-standard security measures to protect your data. All document processing happens locally on your device, ensuring maximum privacy and security.
              </p>
              
              <h4>6. User Accounts</h4>
              <p>
                You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
              
              <h4>7. Modifications to Terms</h4>
              <p>
                We reserve the right to modify these terms at any time. Continued use of the service after such modifications constitutes your acceptance of the revised terms.
              </p>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                checked={readTerms}
                onChange={() => setReadTerms(!readTerms)}
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">
                I have read and agree to the Terms and Conditions
              </span>
            </label>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={onAccept}
              disabled={!readTerms}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to App
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;