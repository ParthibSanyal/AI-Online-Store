import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, MessageCircle, User } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';

export default function AdminChat() {
  const { user } = useAuthStore();
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchChats();
    const socket = io(import.meta.env.VITE_API_URL || '', { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('joinAdmin');
    socket.on('newMessage', ({ chatId, message }) => {
      if (activeChat?._id === chatId) {
        setMessages(prev => [...prev, message]);
      }
      fetchChats();
    });
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get('/chat/all');
      setChats(data.chats);
    } catch {}
  };

  const openChat = async (chat) => {
    try {
      const { data } = await api.get(`/chat/${chat._id}`);
      setActiveChat(data.chat);
      setMessages(data.chat.messages);
    } catch {}
  };

  const handleSend = async () => {
    if (!input.trim() || !activeChat) return;
    try {
      await api.post('/chat/send', { message: input, chatId: activeChat._id });
      setMessages(prev => [...prev, { sender: user, senderRole: 'admin', message: input, createdAt: new Date() }]);
      setInput('');
    } catch {}
  };

  return (
    <div className="flex h-[calc(100vh-80px)] gap-4">
      {/* Chat List */}
      <div className="w-72 card overflow-y-auto">
        <div className="p-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" /> Live Chats ({chats.length})
          </h2>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800">
          {chats.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No active chats</div>
          )}
          {chats.map(chat => (
            <button
              key={chat._id}
              onClick={() => openChat(chat)}
              className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${activeChat?._id === chat._id ? 'bg-green-50 dark:bg-green-900/20' : ''}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {chat.user?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{chat.user?.name}</p>
                  <p className="text-xs text-gray-400 truncate">{chat.lastMessage || 'No messages yet'}</p>
                </div>
                {chat.unreadByAdmin > 0 && (
                  <span className="w-5 h-5 bg-green-500 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0">
                    {chat.unreadByAdmin}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 card overflow-hidden flex flex-col">
        {activeChat ? (
          <>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                {activeChat.user?.name?.[0]}
              </div>
              <div>
                <p className="font-semibold">{activeChat.user?.name}</p>
                <p className="text-xs text-gray-400">{activeChat.user?.email}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderRole === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${msg.senderRole === 'admin' ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 shadow-sm rounded-tl-sm'}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type reply..."
                className="input flex-1"
              />
              <button onClick={handleSend} disabled={!input.trim()} className="bg-green-500 hover:bg-green-600 text-white px-4 rounded-xl disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Select a chat to start responding</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}