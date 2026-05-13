import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Minimize2 } from 'lucide-react';
import { io } from 'socket.io-client';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';

export default function LiveChat() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [chatId, setChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user || user.role !== 'customer') return;

    const socket = io(import.meta.env.VITE_API_URL || '', { transports: ['websocket'] });
    socketRef.current = socket;
    socket.emit('join', user._id);

    socket.on('newMessage', ({ message }) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('typing', () => {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    });

    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadChat = async () => {
    try {
      const { data } = await api.get('/chat/my');
      setChatId(data.chat._id);
      setMessages(data.chat.messages);
    } catch {}
  };

  const handleOpen = () => {
    setOpen(true);
    loadChat();
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/chat/send', { message: input });
      setMessages(prev => [...prev, data.message]);
      setInput('');
    } catch {}
    finally { setLoading(false); }
  };

  if (!user || user.role !== 'customer') return null;

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-80 card overflow-hidden shadow-2xl"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <p className="text-white font-semibold text-sm">Live Support</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-8">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Send a message to start chatting with our support team!</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderRole !== 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm ${msg.senderRole !== 'admin' ? 'bg-green-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 shadow-sm rounded-tl-sm'}`}>
                    {msg.message}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 shadow-sm flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="input flex-1 text-sm py-2"
              />
              <button onClick={handleSend} disabled={!input.trim() || loading} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={handleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg text-white"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.button>
    </div>
  );
}