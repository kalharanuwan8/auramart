import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

const FloatingChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { unreadCount, sendMessage } = useChat();

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && user) {
      sendMessage('general', message, user.id, user.userType);
      setMessage('');
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative bg-primary-500 text-white p-4 rounded-full shadow-lg hover:bg-primary-600 transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col">
          {/* Chat Header */}
          <div className="bg-primary-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <h3 className="font-semibold">Chat Support</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-primary-600 p-1 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            <div className="space-y-3">
              {/* Sample Messages */}
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-lg shadow-sm max-w-xs">
                  <p className="text-sm text-gray-800">Hello! How can we help you today?</p>
                  <span className="text-xs text-gray-500">Support Team</span>
                </div>
              </div>
              
              <div className="flex justify-end">
                <div className="bg-primary-500 text-white p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Hi, I have a question about my order.</p>
                  <span className="text-xs opacity-75">You</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              <button
                type="submit"
                className="bg-primary-500 text-white p-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default FloatingChatButton;