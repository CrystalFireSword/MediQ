import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

type Message = {
  text: string;
  sender: 'user' | 'bot';
};

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      text: "Hello! I'm here to help with information about Dr. Sharma. Please select a question below.", 
      sender: 'bot' 
    }
  ]);
  const [availableQuestions, setAvailableQuestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fallback questions if API fails
  const defaultQuestions = [
    "What are Dr. Sharma's qualifications?",
    "Where is the clinic located?",
    "What are the consultation timings?",
    "Is the doctor available today?",
    "How to contact for emergencies?",
    "What services does the doctor provide?"
  ];

  // Load questions on component mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chatbot/questions`, {
          timeout: 5000
        });
        setAvailableQuestions(response.data?.availableQuestions || defaultQuestions);
      } catch (error) {
        console.error("Failed to load questions:", error);
        setAvailableQuestions(defaultQuestions);
        setMessages(prev => [...prev, {
          text: "You can ask me anything about Dr. Sharma!",
          sender: 'bot'
        }]);
      }
    };

    isOpen && loadQuestions();
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => scrollToBottom(), [messages]);

  const handleSendMessage = async (question: string) => {
    if (!question.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: question, sender: 'user' }]);
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chatbot/chat`,
        { question },
        { timeout: 8000 }
      );

      // Simulate typing delay
      setTimeout(() => {
        if (response.data.success) {
          setMessages(prev => [...prev, { 
            text: response.data.answer, 
            sender: 'bot' 
          }]);
        } else {
          setMessages(prev => [...prev, {
            text: "I couldn't retrieve that information. Please try another question.",
            sender: 'bot'
          }]);
        }
        setIsLoading(false);
      }, 800);

    } catch (error) {
      console.error("API Error:", error);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: "Our systems are temporarily unavailable. Please try again shortly.",
          sender: 'bot'
        }]);
        setIsLoading(false);
      }, 800);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="w-80 h-[28rem] bg-white rounded-lg shadow-lg flex flex-col border border-blue-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center">
            <div>
              <h3 className="font-bold">Dr. Sharma Assistant</h3>
              <p className="text-xs opacity-90">How can I help?</p>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-blue-200 text-xl p-1"
              disabled={isLoading}
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>
          
          {/* Chat Area */}
          <div className="flex-1 p-3 overflow-y-auto bg-blue-50">
            {/* Messages */}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`mb-3 p-3 rounded-lg ${msg.sender === 'user' 
                  ? 'bg-blue-100 ml-auto' 
                  : 'bg-white mr-auto shadow-sm'}`}
                style={{ 
                  maxWidth: '90%', 
                  whiteSpace: 'pre-line',
                  lineHeight: '1.5'
                }}
              >
                {msg.text}
              </div>
            ))}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Questions List */}
            {availableQuestions.length > 0 && (
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Select a question:</p>
                <div className="grid grid-cols-1 gap-2">
                  {availableQuestions.map((question, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(question)}
                      className="text-sm bg-white hover:bg-blue-50 text-blue-600 px-3 py-2 rounded-lg border border-blue-100 text-left transition-colors"
                      disabled={isLoading}
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl animate-bounce"
          aria-label="Open chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Chatbot;