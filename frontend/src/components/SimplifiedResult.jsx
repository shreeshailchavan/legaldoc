// src/components/SimplifiedResultPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  Download, 
  Printer, 
  MessageSquare, 
  Check
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
  const [showAnswer, setShowAnswer] = useState(false);

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
            originalText: `The aforementioned party of the first part, hereinafter referred to as "Tenant," hereby acknowledges and agrees to remit monthly compensation in the amount of one thousand five hundred dollars ($1,500.00) to the party of the second part, hereinafter referred to as "Landlord," for the temporary occupancy and utilization of the residential premises located at 123 Main Street, Apartment 4B, Cityville, State 12345, with said compensation to be remitted no later than the first (1st) calendar day of each month for the duration of the lease agreement, which shall commence on March 1, 2025 and terminate on February 28, 2026, unless otherwise extended or terminated pursuant to the provisions contained herein. Failure to remit payment in a timely manner may result in the imposition of a late fee in the amount of fifty dollars ($50.00) per day for each day payment is delinquent.`,
            
            simplifiedText: `The Tenant agrees to pay the Landlord $1,500 monthly rent for the apartment at 123 Main Street, Apartment 4B, Cityville, State 12345. Rent is due on the 1st of each month during the lease period from March 1, 2025 to February 28, 2026. Late payments may result in a $50 daily late fee.`
          });
        } else {
          setDocumentData({
            title: 'Rental Agreement.pdf',
            dateProcessed: new Date(),
            simplificationLevel: 'Moderate',
            originalText: `RENTAL AGREEMENT

AGREEMENT made this 15th day of February, 2025, between ABC Property Management, LLC, a corporation organized and existing under the laws of the State, hereinafter referred to as "Landlord," and John Smith, an individual currently residing at 456 Previous Ave., Cityville, State 12345, hereinafter referred to as "Tenant."

WITNESSETH:

WHEREAS, Landlord is the owner of certain real property being, lying and situated in the City of Cityville, State, such real property having a street address of 123 Main Street, Apartment 4B, Cityville, State 12345, hereinafter referred to as the "Premises."

WHEREAS, Landlord desires to lease the Premises to Tenant upon the terms and conditions as contained herein; and

WHEREAS, Tenant desires to lease the Premises from Landlord on the terms and conditions as contained herein;

NOW, THEREFORE, for and in consideration of the covenants and obligations contained herein and other good and valuable consideration, the receipt and sufficiency of which is hereby acknowledged, the parties hereto agree as follows:

1. TERM. Landlord leases to Tenant and Tenant leases from Landlord the above described Premises together with any and all appurtenances thereto, for a term of twelve (12) months, such term beginning on March 1, 2025, and ending at 11:59 PM on February 28, 2026.

2. RENT. The total rent for the term hereof is the sum of EIGHTEEN THOUSAND DOLLARS ($18,000.00) payable on the 1st day of each month of the term, in equal installments of ONE THOUSAND FIVE HUNDRED DOLLARS ($1,500.00). All such payments shall be made to Landlord at Landlord's address as set forth in the preamble to this Agreement on or before the due date and without demand.

3. DAMAGE DEPOSIT. Upon the due execution of this Agreement, Tenant shall deposit with Landlord the sum of ONE THOUSAND FIVE HUNDRED DOLLARS ($1,500.00) receipt of which is hereby acknowledged by Landlord, as security for any damage caused to the Premises during the term hereof. Such deposit shall be returned to Tenant, without interest, and less any set off for damages to the Premises upon the termination of this Agreement.

4. USE OF PREMISES. The Premises shall be used and occupied by Tenant and Tenant's immediate family, consisting of John Smith, Jane Smith (spouse), and Bobby Smith (child), exclusively, as a private single-family dwelling, and no part of the Premises shall be used at any time during the term of this Agreement by Tenant for the purpose of carrying on any business, profession, or trade of any kind, or for any purpose other than as a private single-family dwelling. Tenant shall not allow any other person, other than Tenant's immediate family or transient relatives and friends who are guests of Tenant, to use or occupy the Premises without first obtaining Landlord's written consent to such use. Tenant shall comply with any and all laws, ordinances, rules and orders of any and all governmental or quasi-governmental authorities affecting the cleanliness, use, occupancy and preservation of the Premises.`,
            
            simplifiedText: `RENTAL AGREEMENT

This agreement is made on February 15, 2025, between ABC Property Management, LLC ("Landlord") and John Smith ("Tenant").

WHAT THIS MEANS:
- The Landlord owns the property at 123 Main Street, Apartment 4B, Cityville, State 12345
- The Landlord wants to rent this property to the Tenant
- The Tenant wants to rent this property from the Landlord

AGREEMENT TERMS:

1. LEASE PERIOD
The lease lasts for 12 months, starting March 1, 2025, and ending February 28, 2026.

2. RENT
Total rent: $18,000 for the entire lease
Monthly payments: $1,500 due on the 1st of each month
Payments must be made to the Landlord's address listed above.

3. SECURITY DEPOSIT
The Tenant must pay a $1,500 security deposit.
This deposit will be returned without interest at the end of the lease, minus any costs for damages.

4. USE OF PROPERTY
- The property is for residential use only by John Smith and his immediate family (Jane Smith and Bobby Smith)
- No business activities are allowed
- Other people can't live there without the Landlord's written permission
- The Tenant must follow all laws and regulations regarding the property`
          });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching document:', error);
        console.log('Failed to load document. Please try again.');
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id]);

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

  const askQuestion = async () => {
    if (!question.trim()) {
      console.log('Please enter a question first.');
      return;
    }
    
    setAskingQuestion(true);
    
    try {
      // Simulate API call for question answering
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock answers
      const answers = [
        "The security deposit is $1,500, which is the same amount as one month's rent.",
        "The lease term is 12 months, starting March 1, 2025 and ending February 28, 2026.",
        "Yes, late payments may result in a $50 daily late fee.",
        "According to the agreement, the tenant can only use the property as a private residence. No business activities are allowed.",
        "The agreement specifies that only John Smith, Jane Smith (spouse), and Bobby Smith (child) can live in the apartment. Anyone else would need written permission from the landlord."
      ];
      
      // Pick a random answer for demo purposes
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      setAnswer(randomAnswer);
      setShowAnswer(true);
      
    } catch (error) {
      console.error('Error asking question:', error);
      console.log('Failed to process your question. Please try again.');
    } finally {
      setAskingQuestion(false);
    }
  };

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
              className={`px-3 py-1.5 rounded-lg text-// src/components/SimplifiedResultPage.jsx (continued)
sm font-medium ${
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
          
          <div className="flex space-x-2">
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
          </div>
          
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