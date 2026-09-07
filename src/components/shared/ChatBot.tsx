"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User, Phone, RotateCcw, Sparkles } from "lucide-react";
import { SITE_CONFIG } from "@/lib/constants";

interface Message {
  role: "user" | "bot";
  content: string;
  time: string;
  followUps?: string[];
}

const SUGGESTED_QUESTIONS = [
  "নির্মাণ খরচ কত?",
  "2D Plan সম্পর্কে বলুন",
  "রাজউক প্ল্যান পাসিং",
  "Appointment বুক করব",
  "আপনি কে?",
  "যোগাযোগ করুন",
];

const WELCOME_MESSAGE: Message = {
  role: "bot",
  content: `আস্সালামু আলাইকুম! 👋 **Triple H Engineering**-এ স্বাগতম!\n\nআমি আপনার AI-powered Engineering Assistant। আমি বুঝতে পারি আপনার প্রশ্নের অর্থ এবং সেরে উত্তর দিই!\n\n🏗️ আমি এই বিষয়ে সাহায্য করতে পারি:\n- 💰 নির্মাণ খরচ ও বাজেট\n- 📐 2D/3D Design ও নকশা\n- 📋 রাজউক প্ল্যান পাসিং\n- 🏗️ সাইট সুপারভিশন\n- 📞 যোগাযোগ ও অ্যাপয়েন্টমেন্ট\n\nআপনার প্রশ্ন লিখুন অথবা নিচে থেকে বাছাই করুন!`,
  time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
  followUps: ["নির্মাণ খরচ কত?", "2D Plan সম্পর্কে বলুন", "Appointment বুক করব", "আপনি কে?"],
};

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, messages]);

  // Typing simulation delay
  const simulateTyping = useCallback((text: string): number => {
    const words = text.split(/\s+/).length;
    const banglaChars = (text.match(/[\u0980-\u09FF]/g) || []).length;
    const baseDelay = Math.min(words * 40, 1500);
    const banglaExtra = banglaChars * 5;
    return Math.min(baseDelay + banglaExtra, 2200);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text.trim(),
          history: messages.slice(-8),
        }),
      });
      const data = await res.json();

      // Simulate typing
      setIsTyping(true);
      const typingDelay = simulateTyping(data.response || '');
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      setIsTyping(false);

      const botMsg: Message = {
        role: "bot",
        content: data.response || "দুঃখিত, একটু পরে চেষ্টা করুন।",
        time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
        followUps: data.followUps || [],
      };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "bot",
        content: "দুঃখিত, কানেকশনে সমস্যা হচ্ছে। অনুগ্রহ করে আবার চেষ্টা করুন। 📞 01778-506500",
        time: new Date().toLocaleTimeString("bn-BD", { hour: "2-digit", minute: "2-digit" }),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
  };

  // Parse markdown-like content
  const renderContent = (content: string, setIsOpen: (v: boolean) => void) => {
    return content.split("\n").map((line, li) => {
      if (!line.trim()) return <br key={li} />;
      const parts = line.split(/(\*\*[^*]+\*\*|\[.*?\]\(.*?\))/g);
      const rendered = parts.map((part, pi) => {
        if (/^\*\*(.+)\*\*$/.test(part)) {
          return <strong key={pi}>{part.slice(2, -2)}</strong>;
        }
        const linkMatch = part.match(/^\[(.+)\]\((.+)\)$/);
        if (linkMatch) {
          return (
            <a key={pi} href={linkMatch[2]} className="text-accent underline hover:no-underline font-medium" onClick={() => setIsOpen(false)}>
              {linkMatch[1]}
            </a>
          );
        }
        // Phone numbers - clickable on mobile only
        if (isMobile) {
          const phoneParts = part.split(/(\b01[3-9]\d{8}\b|\+?880[ -]?1[3-9]\d{8})/g);
          return <span key={pi}>{phoneParts.map((pp, ppi) => {
            const digits = pp.replace(/\D/g, '');
            if (digits.length >= 11 && digits.startsWith('01')) {
              return <a key={ppi} href={`tel:${digits}`} className="text-accent font-semibold underline">{pp}</a>;
            }
            return pp;
          })}</span>;
        }
        return <span key={pi}>{part}</span>;
      });
      if (line.startsWith("- ") || line.match(/^[✅⚠️📐📊📋🏗️✨🏠🏛️📸📅📍📞📧💬👷🎨💡🎯🔍📝🔧]/)) {
        return <div key={li} className="flex gap-1.5">{rendered}</div>;
      }
      return <div key={li}>{rendered}</div>;
    });
  };

  return (
    <>
      {/* Chat Window - positioned above button */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed z-[200] w-[360px] max-w-[calc(100vw-2rem)] bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{
              bottom: isMobile ? "90px" : "88px",
              right: "24px",
              height: isMobile ? "65vh" : "520px",
            }}
          >
            {/* Header */}
            <div className="bg-primary px-4 py-3 flex items-center gap-3 shrink-0">
              <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0 relative">
                <Bot className="w-5 h-5 text-primary" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-primary-foreground text-sm leading-tight flex items-center gap-1.5">
                  Triple H Assistant
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                </p>
                <p className="text-xs text-primary-foreground/70 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                  AI-Powered · সবসময় অনলাইন
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleReset}
                  className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors text-primary-foreground/70 hover:text-primary-foreground"
                  title="নতুন শুরু করুন"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-primary-foreground/10 rounded-lg transition-colors text-primary-foreground/70 hover:text-primary-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "bot" ? "bg-primary/10" : "bg-accent/10"
                  }`}>
                    {msg.role === "bot"
                      ? <Bot className="w-4 h-4 text-primary" />
                      : <User className="w-4 h-4 text-accent" />
                    }
                  </div>
                  <div className={`max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                    <div className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-accent text-primary rounded-tr-sm"
                        : "bg-secondary text-foreground rounded-tl-sm"
                    }`}>
                      {msg.role === "bot" ? (
                        <div className="space-y-1">
                          {renderContent(msg.content, setIsOpen)}
                        </div>
                      ) : (
                        <span>{msg.content}</span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground px-1">{msg.time}</span>
                  </div>
                </motion.div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2"
                >
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="bg-secondary px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            className="w-1.5 h-1.5 bg-primary/50 rounded-full"
                            animate={{ y: [0, -4, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">টাইপ করছে...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Follow-up Buttons */}
              {!loading && !isTyping && messages.length > 0 && (() => {
                const lastBotMsg = [...messages].reverse().find(m => m.role === 'bot');
                if (!lastBotMsg || !lastBotMsg.followUps || lastBotMsg.followUps.length === 0) return null;
                // Only show if no user message after this bot message
                const lastBotIdx = messages.lastIndexOf(lastBotMsg);
                const hasUserAfter = messages.slice(lastBotIdx + 1).some(m => m.role === 'user');
                if (hasUserAfter) return null;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-wrap gap-1.5 pl-9"
                  >
                    {lastBotMsg.followUps.map((q) => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="text-xs px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent rounded-full border border-accent/30 transition-all font-medium"
                      >
                        {q}
                      </button>
                    ))}
                  </motion.div>
                );
              })()}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions (initial) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground rounded-full border border-border transition-colors font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* WhatsApp CTA */}
            <div className="px-4 pb-2">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 w-full justify-center text-xs py-2 bg-[#25D366]/10 text-[#25D366] rounded-xl border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-colors font-semibold"
              >
                <Phone className="w-3.5 h-3.5" />
                সরাসরি WhatsApp-এ কথা বলুন
              </a>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-border p-3 flex gap-2 shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="আপনার প্রশ্ন লিখুন..."
                className="flex-1 bg-secondary rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-muted-foreground"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 bg-accent hover:bg-accent/90 text-primary rounded-xl flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[200] w-14 h-14 bg-accent hover:bg-accent/90 text-primary rounded-full shadow-xl flex items-center justify-center relative transition-colors"
        aria-label="Open chat assistant"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread badge */}
        {hasUnread && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            1
          </motion.span>
        )}

        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-accent animate-ping opacity-20" />
        )}
      </motion.button>
    </>
  );
}
