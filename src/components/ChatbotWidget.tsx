import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatbotWidget = () => {
  const { language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [trainingData, setTrainingData] = useState<any[]>([]);

  useEffect(() => {
    // Load chatbot training data
    supabase
      .from('chatbot_training')
      .select('*')
      .eq('active', true)
      .order('priority', { ascending: false })
      .then(({ data }) => {
        if (data) setTrainingData(data);
      });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const findAnswer = (query: string): string | null => {
    const q = query.toLowerCase();
    for (const item of trainingData) {
      if (item.language !== language && item.language !== 'both') continue;
      const matchesKeyword = item.keywords?.some((kw: string) => q.includes(kw.toLowerCase()));
      const matchesQuestion = item.question.toLowerCase().split(' ').some((w: string) => q.includes(w));
      if (matchesKeyword || matchesQuestion) return item.answer;
    }
    // Fallback: search all languages
    for (const item of trainingData) {
      const matchesKeyword = item.keywords?.some((kw: string) => q.includes(kw.toLowerCase()));
      if (matchesKeyword) return item.answer;
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Try local training data first
    const localAnswer = findAnswer(userMsg.content);
    
    setTimeout(() => {
      const answer = localAnswer || (language === 'en' 
        ? "Thank you for your question! I'm a simple assistant trained on limited data. For more details, please visit the Contact page or reach out directly."
        : "Cảm ơn câu hỏi của bạn! Tôi là trợ lý đơn giản với dữ liệu hạn chế. Để biết thêm chi tiết, vui lòng truy cập trang Liên hệ hoặc liên hệ trực tiếp.");
      
      setMessages(prev => [...prev, { role: 'assistant', content: answer }]);
      setLoading(false);
    }, 600);
  };

  const greeting = language === 'en' 
    ? "👋 Hi! I'm the portfolio assistant. Ask me anything about skills, experience, or projects!"
    : "👋 Xin chào! Tôi là trợ lý portfolio. Hỏi tôi về kỹ năng, kinh nghiệm hoặc dự án!";

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => {
          setOpen(true);
          if (messages.length === 0) {
            setMessages([{ role: 'assistant', content: greeting }]);
          }
        }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-secondary text-secondary-foreground shadow-gold flex items-center justify-center hover:scale-110 transition-all duration-300 ${open ? 'scale-0' : 'scale-100'}`}
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </button>

      {/* Chat Panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-semibold text-sm">
                {language === 'en' ? 'Portfolio Assistant' : 'Trợ lý Portfolio'}
              </span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-70 transition-opacity">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center shrink-0">
                    <Bot size={14} className="text-secondary" />
                  </div>
                )}
                <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-md' 
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  {msg.content}
                </div>
                {msg.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                    <User size={14} className="text-primary" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 items-center">
                <div className="w-7 h-7 rounded-full bg-secondary/20 flex items-center justify-center">
                  <Bot size={14} className="text-secondary" />
                </div>
                <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={language === 'en' ? 'Type a message...' : 'Nhập tin nhắn...'}
                className="flex-1 text-sm rounded-full"
                disabled={loading}
              />
              <Button type="submit" size="icon" className="rounded-full shrink-0" disabled={loading || !input.trim()}>
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
