import React, { useState, useEffect, useRef, useContext } from 'react';
import { useAuth } from '../../../lib/AuthContext';
import { io } from 'socket.io-client';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPaperPlane, 
  faBars, 
  faPaperclip, 
  faSearch, 
  faEllipsisV, 
  faArrowLeft,
  faImage,
  faFile,
  faLink,
  faReply,
  faEdit,
  faTrash,
  faArchive,
  faBan,
  faCheck,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { GlobalContext } from '@/component/GlobalStore/GlobalState';
import { formatDistanceToNow } from 'date-fns';
import { useDebounce } from '../../../hooks/useDebounce';
import "./Message.css";

const Message = () => {
  const { user } = useAuth();
  const { handleToggleState, upDatePage, selectedChatUser, setSelectedChatUser } = useContext(GlobalContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);
  const [showConversationMenu, setShowConversationMenu] = useState(null);
  const [replyTo, setReplyTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);
  const debouncedTyping = useDebounce(isTyping, 500);

  // Helper function to get the other participant
  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    return conversation.participants.find(p => p?._id !== user?._id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Initialize socket connection to the /messages namespace
    socketRef.current = io(`${import.meta.env.VITE_API_URL}/messages`, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    // Handle connection errors
    socketRef.current.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err.message);
    });

    // Join the selected conversation room
    if (selectedConversation) {
      socketRef.current.emit('joinRoom', selectedConversation._id);
    }

    // Listen for new messages
    socketRef.current.on('newMessage', (message) => {
      if (selectedConversation && message.conversationId === selectedConversation._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    // Listen for typing events
    socketRef.current.on('userTyping', ({ userId, isTyping }) => {
      if (selectedConversation && selectedConversation.participants.some((p) => p._id === userId)) {
        setTypingUsers((prev) => {
          const updated = new Set(prev);
          if (isTyping) {
            updated.add(userId);
          } else {
            updated.delete(userId);
          }
          return updated;
        });
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (debouncedTyping) {
      socketRef.current.emit('typing', {
        conversationId: selectedConversation?._id,
        isTyping: true
      });
    } else {
      socketRef.current.emit('typing', {
        conversationId: selectedConversation?._id,
        isTyping: false
      });
    }
  }, [debouncedTyping, selectedConversation]);

  // Update selectedConversation when selectedChatUser changes
  useEffect(() => {
    if (selectedChatUser) {
      const conversation = conversations.find(conv => 
        conv.participants.some(p => p._id === selectedChatUser._id)
      );
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        createConversation(selectedChatUser); // Create a new conversation if it doesn't exist
      }
    }
  }, [selectedChatUser, conversations]);

  const loadConversations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      setConversations(data);
      setLoading(false);
    } catch (err) {
      console.error('Error loading conversations:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${selectedConversation._id}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      console.error('Error loading messages:', err);
      setError(err.message);
    }
  };

  const createConversation = async (participant) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          participantId: participant._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create conversation');
      }

      const conversation = await response.json();
      setConversations(prev => [...prev, conversation]);
      setSelectedConversation(conversation);
    } catch (err) {
      console.error('Error creating conversation:', err);
      setError(err.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const formData = new FormData();
      formData.append('content', newMessage);
      formData.append('type', 'text');
      if (replyTo) {
        formData.append('replyTo', replyTo._id);
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      setReplyTo(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message);
    }
  };

  const handleFileUpload = async (files) => {
    if (!selectedConversation) return;

    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('attachments', file);
        formData.append('type', file.type.startsWith('image/') ? 'image' : 'file');
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${selectedConversation._id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload files');
      }

      setShowAttachMenu(false);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err.message);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content: newContent })
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }

      setEditingMessage(null);
    } catch (err) {
      console.error('Error editing message:', err);
      setError(err.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete message');
      }

      setShowMessageMenu(null);
    } catch (err) {
      console.error('Error deleting message:', err);
      setError(err.message);
    }
  };

  const handleArchiveConversation = async (conversationId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${conversationId}/archive`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to archive conversation');
      }

      setShowConversationMenu(null);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    } catch (err) {
      console.error('Error archiving conversation:', err);
      setError(err.message);
    }
  };

  const handleBlockConversation = async (conversationId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/messages/conversations/${conversationId}/block`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to block conversation');
      }

      setShowConversationMenu(null);
      setConversations(prev => prev.filter(conv => conv._id !== conversationId));
    } catch (err) {
      console.error('Error blocking conversation:', err);
      setError(err.message);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    setSelectedChatUser(conversation.participants.find(p => p._id !== user._id));
  };

  const handleBack = () => {
    setSelectedConversation(null);
    setSelectedChatUser(null);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!conv?.participants) return false;
    
    // Find the other user (not the current user)
    const otherUser = conv.participants.find(p => p?._id !== user?._id);
    if (!otherUser?.name) return false;

    // If there's no search query, show all conversations
    if (!searchQuery) return true;

    // Search in user name
    return otherUser.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-red-500 text-center p-4">
          <p className="text-lg font-medium">Error loading messages</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      <header className="flex justify-between p-4 border-b dark:border-gray-700">
        <div className="flex flex-col w-full lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-0 lg:justify-between">
          <div className="flex flex-col gap-4">
            <h1 className="text-[32px] font-medium">
              {user?.role === 'mentor' ? 'Mentees' : 'Mentors'}
            </h1>
            <p className="text-base font-medium text-slate-600">
              {user?.role === 'mentor' ? 'Connect with Mentees' : 'Find a Mentor'}
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <img
              onClick={() => upDatePage("Message")}
              src="/image/messageIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Message Icon"
              loading="lazy"
            />
            <img
              onClick={() => upDatePage("Setting")}
              src="/image/settingIcon.png"
              className="md:w-12 h-9 md:h-12 cursor-pointer"
              alt="Setting Icon"
              loading="lazy"
            />
          </div>
        </div>

        <div onClick={handleToggleState} className="block lg:hidden mt-3">
          <button aria-label="Toggle menu">
            <FontAwesomeIcon icon={faBars} />
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-180px)]">
        {/* Conversations List */}
        <div className={`w-full lg:w-1/3 border-r dark:border-gray-700 flex flex-col ${selectedConversation ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b dark:border-gray-700">
            <div className="relative">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations found
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherUser = conv.participants.find(p => p._id !== user._id);
                const unreadCount = conv.unreadCounts?.[user._id] || 0;
                const isOnline = onlineUsers.has(otherUser._id);

                return (
                  <div
                    key={conv._id}
                    onClick={() => handleConversationSelect(conv)}
                    className={`flex items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${
                      selectedConversation?._id === conv._id ? 'bg-gray-100 dark:bg-gray-800' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.name)}&background=random`}
                        alt={otherUser.name}
                        className="w-12 h-12 rounded-full"
                      />
                      {isOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{otherUser.name}</h3>
                        {conv.lastMessage && (
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(conv.lastMessage.createdAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {conv.lastMessage?.content || 'No messages yet'}
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowConversationMenu(showConversationMenu === conv._id ? null : conv._id);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600"
                      >
                        <FontAwesomeIcon icon={faEllipsisV} />
                      </button>
                      {showConversationMenu === conv._id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleArchiveConversation(conv._id)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FontAwesomeIcon icon={faArchive} className="mr-2" />
                            Archive
                          </button>
                          <button
                            onClick={() => handleBlockConversation(conv._id)}
                            className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FontAwesomeIcon icon={faBan} className="mr-2" />
                            Block
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b dark:border-gray-700 flex items-center">
                <button 
                  onClick={handleBack}
                  className="lg:hidden mr-4 text-gray-600 hover:text-gray-800"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                </button>
                <div className="flex items-center">
                  <div className="relative">
                    {getOtherParticipant(selectedConversation) && (
                      <>
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(getOtherParticipant(selectedConversation)?.name || '')}&background=random`}
                          alt={getOtherParticipant(selectedConversation)?.name || 'User'}
                          className="w-10 h-10 rounded-full"
                        />
                        {onlineUsers.has(getOtherParticipant(selectedConversation)?._id) && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="ml-4">
                    <h3 className="font-medium">
                      {getOtherParticipant(selectedConversation)?.name || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {onlineUsers.has(getOtherParticipant(selectedConversation)?._id)
                        ? 'Online'
                        : 'Offline'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender._id === user._id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div className={`relative group max-w-[70%] ${
                      message.sender._id === user._id ? 'ml-auto' : 'mr-auto'
                    }`}>
                      <div
                        className={`rounded-lg p-3 ${
                          message.sender._id === user._id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                      >
                        {message.replyTo && (
                          <div className="text-xs opacity-70 mb-1 border-l-2 pl-2">
                            <p className="font-medium">
                              {message.replyTo.sender._id === user._id ? 'You' : message.replyTo.sender.name}
                            </p>
                            <p className="truncate">{message.replyTo.content}</p>
                          </div>
                        )}
                        {editingMessage === message._id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={message.content}
                              onChange={(e) => handleEditMessage(message._id, e.target.value)}
                              className="flex-1 bg-transparent border-b focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => setEditingMessage(null)}
                              className="text-xs hover:text-gray-300"
                            >
                              <FontAwesomeIcon icon={faTimes} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm">{message.content}</p>
                            {message.attachments?.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {message.attachments.map((attachment, index) => (
                                  <div key={index} className="flex items-center gap-2">
                                    <FontAwesomeIcon
                                      icon={
                                        attachment.type.startsWith('image/')
                                          ? faImage
                                          : attachment.type === 'application/pdf'
                                          ? faFile
                                          : faLink
                                      }
                                    />
                                    <a
                                      href={attachment.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs underline"
                                    >
                                      {attachment.name}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-1">
                              <p className="text-xs opacity-70">
                                {new Date(message.createdAt).toLocaleTimeString()}
                              </p>
                              {message.sender._id === user._id && (
                                <div className="flex items-center gap-1">
                                  {message.read && (
                                    <span className="text-xs">
                                      <FontAwesomeIcon icon={faCheck} />
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setShowMessageMenu(showMessageMenu === message._id ? null : message._id)}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <FontAwesomeIcon icon={faEllipsisV} className="text-xs" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      {showMessageMenu === message._id && (
                        <div className={`absolute mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10 ${
                          message.sender._id === user._id ? 'right-0' : 'left-0'
                        }`}>
                          <button
                            onClick={() => {
                              setReplyTo(message);
                              setShowMessageMenu(null);
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <FontAwesomeIcon icon={faReply} className="mr-2" />
                            Reply
                          </button>
                          {message.sender._id === user._id && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessage(message._id);
                                  setShowMessageMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FontAwesomeIcon icon={faEdit} className="mr-2" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMessage(message._id)}
                                className="w-full px-4 py-2 text-left text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <FontAwesomeIcon icon={faTrash} className="mr-2" />
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Typing Indicator */}
              {typingUsers.size > 0 && (
                <div className="px-4 py-2 text-sm text-gray-500">
                  {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </div>
              )}

              {/* Message Input */}
              <form onSubmit={sendMessage} className="p-4 border-t dark:border-gray-700">
                {replyTo && (
                  <div className="flex items-center justify-between mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <FontAwesomeIcon icon={faReply} className="text-xs" />
                      <span className="text-sm">
                        Replying to {replyTo.sender._id === user._id ? 'yourself' : replyTo.sender.name}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyTo(null)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <FontAwesomeIcon icon={faPaperclip} />
                    </button>
                    {showAttachMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                        <label className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e.target.files)}
                            multiple
                            accept="image/*,.pdf,.doc,.docx"
                            className="hidden"
                          />
                          <FontAwesomeIcon icon={faImage} className="mr-2" />
                          Image
                        </label>
                        <label className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleFileUpload(e.target.files)}
                            multiple
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                          />
                          <FontAwesomeIcon icon={faFile} className="mr-2" />
                          Document
                        </label>
                      </div>
                    )}
                  </div>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      setIsTyping(true);
                    }}
                    onBlur={() => setIsTyping(false)}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    <FontAwesomeIcon icon={faPaperPlane} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 space-y-4">
              <p className="text-lg">No conversation selected</p>
              <p className="text-sm">
                Visit the{' '}
                <button
                  onClick={() => upDatePage('Explore')}
                  className="text-orange-500 hover:text-orange-600 font-medium"
                >
                  Explore page
                </button>{' '}
                to find and chat with {user?.role === 'mentor' ? 'mentees' : 'mentors'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;