import React, { useState, useEffect, useCallback } from 'react';
import { Send, Search, Moon, Sun } from 'lucide-react';

const ChatApp = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const convoId = 1;
  const currentUserId = 1; 

  // Fetch conversation data
  const fetchConversationData = useCallback(() => {
    fetch(`http://localhost:8082/testReact/convo?conversation=${convoId}`)
      .then((response) => response.json())
      .then((data) => {
        const conversationData = data[`conversation_${convoId}`];
        if (!conversationData) return;

        const { messages, users } = conversationData;
        
        // Convert messages object to array and sort by date
        const messagesArray = Object.values(messages).sort((a, b) => 
          new Date(a.date_envoi) - new Date(b.date_envoi)
        );

        // Get users information
        const usersArray = Object.entries(users).map(([id, user]) => ({
          id: parseInt(id),
          ...user
        }));

        // Set current and other user
        const currentUserData = usersArray.find(user => user.id === currentUserId);
        const otherUserData = usersArray.find(user => user.id !== currentUserId);
        
        setCurrentUser(currentUserData);
        setOtherUser(otherUserData);

        const conversation = {
          id: convoId,
          name: otherUserData.name, 
          lastMessage: messagesArray.length > 0 ? messagesArray[messagesArray.length - 1].contenu : '',
          time: messagesArray.length > 0 
            ? new Date(messagesArray[messagesArray.length - 1].date_envoi)
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
            : '',
          messages: messagesArray.map((msg) => ({
            id: msg.id,
            text: msg.contenu,
            sent: msg.fromuser === currentUserId,
            time: new Date(msg.date_envoi)
              .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          })),
          users: usersArray
        };

        setConversations([conversation]);
        if (!selectedChat) {
          setSelectedChat(conversation);
        } else {
          // Update existing conversation with latest messages
          setSelectedChat(prevChat => ({
            ...prevChat,
            messages: conversation.messages,
            lastMessage: conversation.lastMessage,
            time: conversation.time
          }));
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement:', error);
      });
  }, [convoId, currentUserId, selectedChat]);

  // Setup periodic polling
  useEffect(() => {
    // Initial data fetch
    fetchConversationData();

    // Periodic polling
    const intervalId = setInterval(fetchConversationData, 3000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchConversationData]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;

    // Prepare message payload matching the Java backend Message structure
    const newMessagePayload = {
      fromuser: currentUserId,
      touser: otherUser.id,
      contenu: message,
      date_envoi: new Date(), // Will be set by server
      lu: false,
      conversation: convoId
    };

    try {
      const response = await fetch("http://localhost:8082/testReact/sendMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newMessagePayload),
      });

      if (response.ok) {
        // Clear message input
        setMessage("");
        
        // Immediately fetch updated conversation data
        fetchConversationData();
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  if (!currentUser || !otherUser) {
    return (
      <div className={`flex h-screen items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <span className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen ${isDarkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-100'}`}>
      <button 
        onClick={toggleDarkMode} 
        className={`fixed top-4 right-4 z-50 p-2 rounded-full 
        ${isDarkMode 
          ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
          : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
      >
        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      {/* Left sidebar */}
      <div className={`w-1/3 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-r'}`}>
        {/* User Profile Section */}
        <div className={`p-4 ${isDarkMode ? 'border-gray-700' : 'border-b'}`}>
          <div className="flex items-center space-x-3 mb-4">
            {currentUser.photo_profil ? (
              <img
                src={currentUser.photo_profil}
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} flex items-center justify-center`}>
                <span className={`${isDarkMode ? 'text-gray-300' : 'text-blue-500'} font-semibold`}>
                  {currentUser.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="font-semibold">{currentUser.name}</div>
              <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{currentUser.email}</div>
            </div>
            <div className={`w-2 h-2 rounded-full ${currentUser.en_ligne ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          </div>
          <div className="relative">
            <Search className={`absolute left-3 top-3 ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              placeholder="Search conversations..."
              className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none 
              ${isDarkMode 
                ? 'bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-600' 
                : 'bg-white border text-gray-800 focus:border-blue-500'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-y-auto h-[calc(100vh-10rem)]">
          {filteredConversations.map((conv) => (
            <div
              key={conv.id}
              className={`p-4 border-b cursor-pointer 
              ${isDarkMode 
                ? 'hover:bg-gray-700 border-gray-700 ' + (selectedChat?.id === conv.id ? 'bg-gray-700' : '') 
                : 'hover:bg-gray-50 ' + (selectedChat?.id === conv.id ? 'bg-blue-50' : '')}`}
              onClick={() => setSelectedChat(conv)}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{conv.name}</h3>
                <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{conv.time}</span>
              </div>
              <p className={`text-sm truncate mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {conv.lastMessage}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Right chat area */}
      <div className={`flex-1 flex flex-col ${isDarkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className={`p-4 border-b flex items-center space-x-3 
              ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
              {otherUser.photo_profil ? (
                <img
                  src={otherUser.photo_profil}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className={`w-10 h-10 rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-blue-100'} flex items-center justify-center`}>
                  <span className={`${isDarkMode ? 'text-gray-300' : 'text-blue-500'} font-semibold`}>
                    {otherUser.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h2 className="font-semibold">{otherUser.name}</h2>
                {otherUser.en_ligne ? (
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>En ligne</span>
                  </div>
                ) : (
                  <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Dernière connexion: {new Date(otherUser.derniere_connexion).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Messages area */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {selectedChat.messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[70%] p-3 rounded-lg 
                    ${isDarkMode 
                      ? (msg.sent 
                        ? 'bg-blue-700 text-gray-100' 
                        : 'bg-gray-800 text-gray-200 border-gray-700') 
                      : (msg.sent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white border')}`}
                  >
                    <p>{msg.text}</p>
                    <p className={`text-xs mt-1 
                      ${isDarkMode 
                        ? (msg.sent ? 'text-blue-200' : 'text-gray-400') 
                        : (msg.sent ? 'text-blue-100' : 'text-gray-500')}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <form 
              onSubmit={handleSendMessage} 
              className={`p-4 border-t 
              ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              <div className="flex space-x-4">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className={`flex-1 p-2 rounded-lg focus:outline-none 
                  ${isDarkMode 
                    ? 'bg-gray-700 text-gray-100 border-gray-600 focus:border-blue-600' 
                    : 'border focus:border-blue-500'}`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  type="submit"
                  className={`p-2 rounded-lg focus:outline-none 
                  ${isDarkMode 
                    ? 'bg-blue-700 text-gray-100 hover:bg-blue-600' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className={`flex-1 flex items-center justify-center ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Select a conversation to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;