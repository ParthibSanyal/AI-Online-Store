import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Minimize2, Sparkles } from 'lucide-react';
import api from '../../utils/api';

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm ShopBot 🛍️ — your AI shopping assistant. Ask me about products, recommendations, or anything you need help with!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/ai/chatbot', {
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again in a moment." }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 w-80 sm:w-96 card overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-600 to-secondary-600 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">ShopBot</p>
                  <p className="text-primary-200 text-xs">Powered by Groq AI</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-900">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[78%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-primary-600 text-white rounded-tr-sm'
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm rounded-tl-sm'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center mr-2 flex-shrink-0">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1">
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            {/* Input */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && send()}
                placeholder="Ask me anything..."
                className="input flex-1 text-sm py-2"
              />
              <button onClick={send} disabled={!input.trim() || loading} className="btn-primary px-3 py-2 flex-shrink-0 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-glow-lg text-white"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <Minimize2 className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
