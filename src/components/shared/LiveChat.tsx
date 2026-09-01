"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ChatMessage {
  role: "bot" | "user";
  text: string;
}

const BOT_REPLIES: Record<string, string> = {
  "hello": "Hello! Welcome to TRIPLE H PLANDRAFT & ENGINEERING. How can I help you today?",
  "hi": "Hi there! How can we assist you with your construction or engineering needs?",
  "cost": "You can use our online Cost Estimator tool for a quick budget calculation. Visit /cost-estimator",
  "price": "You can use our online Cost Estimator tool for a quick budget calculation. Visit /cost-estimator",
  "service": "We offer: 2D Plans, 3D Exterior/Interior, Structural Design, BOQ Estimation, Plan Passing, and Site Supervision.",
  "contact": "You can reach us at +880 1778-506500 or email info@tripleh.com.bd",
  "phone": "Call us: +880 1778-506500 or +880 1631-186218",
  "track": "To track your plan status, visit /track-plan and enter your File ID or phone number.",
  "appointment": "Book a free consultation at /book-appointment",
  "team": "We have a team of experienced engineers and architects. Visit /team to learn more.",
  "bye": "Thank you for reaching out! Feel free to message us anytime. Have a great day!",
};

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase();
  for (const [key, reply] of Object.entries(BOT_REPLIES)) {
    if (lower.includes(key)) return reply;
  }
  return "Thank you for your message. Our team will get back to you shortly. For immediate assistance, please call +880 1778-506500.";
}

export default function LiveChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "bot", text: "👋 Welcome to TRIPLE H PLANDRAFT & ENGINEERING! How can we help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));

    const reply = getBotReply(userMsg);
    setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    setLoading(false);
  };

  return (
    <>
      {/* Chat bubble button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-24 right-5 z-50 w-14 h-14 rounded-full bg-accent text-primary-foreground shadow-xl hover:bg-accent/90 transition-all duration-300 flex items-center justify-center hover:scale-110"
        aria-label="Live Chat"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-40 right-5 z-50 w-[360px] max-w-[calc(100vw-40px)] bg-background border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-accent text-primary-foreground px-5 py-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center font-bold text-lg">
              H
            </div>
            <div>
              <p className="font-bold text-sm">TRIPLE H PLANDRAFT & ENGINEERING</p>
              <p className="text-xs text-primary-foreground/80">Typically replies in a few minutes</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[350px] min-h-[250px]">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-accent text-primary-foreground rounded-br-md"
                      : "bg-secondary text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-secondary text-foreground px-4 py-2.5 rounded-2xl rounded-bl-md text-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleSend(); }}
              placeholder="Type your message..."
              className="flex-1 h-10 text-sm"
            />
            <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleSend} disabled={loading || !input.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
