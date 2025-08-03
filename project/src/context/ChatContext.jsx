import React, { createContext, useContext, useState, useEffect } from 'react';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [conversations, setConversations] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedConversations = localStorage.getItem('conversations');
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations);
      setConversations(parsed);
      
      // Calculate unread count
      const unread = parsed.reduce((total, conv) => 
        total + conv.messages.filter(msg => !msg.read).length, 0
      );
      setUnreadCount(unread);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const sendMessage = (conversationId, message, senderId, senderType) => {
    const newMessage = {
      id: Date.now(),
      text: message,
      senderId,
      senderType,
      timestamp: new Date().toISOString(),
      read: false
    };

    setConversations(prev => {
      const existing = prev.find(conv => conv.id === conversationId);
      
      if (existing) {
        return prev.map(conv =>
          conv.id === conversationId
            ? { ...conv, messages: [...conv.messages, newMessage], lastMessage: new Date().toISOString() }
            : conv
        );
      } else {
        const newConversation = {
          id: conversationId,
          participants: [senderId],
          messages: [newMessage],
          lastMessage: new Date().toISOString()
        };
        return [...prev, newConversation];
      }
    });
  };

  const markAsRead = (conversationId, userId) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              messages: conv.messages.map(msg =>
                msg.senderId !== userId ? { ...msg, read: true } : msg
              )
            }
          : conv
      )
    );
  };

  const getConversation = (conversationId) => {
    return conversations.find(conv => conv.id === conversationId);
  };

  const getUserConversations = (userId) => {
    return conversations.filter(conv => 
      conv.participants.includes(userId) || 
      conv.messages.some(msg => msg.senderId === userId)
    );
  };

  const value = {
    conversations,
    unreadCount,
    sendMessage,
    markAsRead,
    getConversation,
    getUserConversations
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};