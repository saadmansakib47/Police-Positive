"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ChatboxProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const defaultPrompts = [
  "Can you explain the difference between GD/FIR?",
  "When should I file a GD or FIR?",
  "How do I report a crime using this app?",
  "How to track my complaint?",
  "How does anonymous reporting work?",
  "What information is needed for a proper complaint?"
];

export default function Chatbox({ open, setOpen }: ChatboxProps) {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages or typing indicator changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // -----------------------
  // Send message to backend
  // -----------------------
  const sendMessage = async (msg?: string) => {
    const textToSend = msg || input.trim();
    if (!textToSend) return;

    // Add user message
    const userMessage = { sender: "You", text: textToSend };
    setMessages((prev) => [...prev, userMessage]);

    if (!msg) setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend })
      });

      const data = await res.json();
      const botReply = data.response || "Sorry, I didn’t understand that.";

      // Add AI reply
      setMessages((prev) => [...prev, { sender: "AI", text: botReply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "AI", text: "Server error. Try again later." }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 w-96 z-50"
        >
          <Card className="shadow-2xl rounded-2xl flex flex-col h-96">
            {/* Header */}
            <div className="flex justify-between items-center p-3 border-b">
              <h2 className="font-bold text-lg">AI Assistant</h2>
              <button onClick={() => setOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Prompts + Messages */}
            <CardContent className="flex-1 flex flex-col p-2 gap-2 overflow-hidden">
              {/* Default Prompt Bubbles */}
              <div className="flex gap-2 overflow-x-auto py-1">
                {defaultPrompts.map((p, i) => (
                  <button
                    key={i}
                    className="flex-shrink-0 bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full hover:bg-purple-200 transition"
                    onClick={() => sendMessage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto flex flex-col gap-2 mt-2">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg max-w-[80%] break-words ${
                      m.sender === "You"
                        ? "bg-green-100 self-end"
                        : "bg-gray-100 self-start"
                    }`}
                  >
                    <strong>{m.sender}: </strong>
                    {m.text}
                  </div>
                ))}
                {isTyping && (
                  <div className="p-2 rounded-lg max-w-[60%] bg-gray-200 self-start italic text-gray-600">
                    AI is typing...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  className="flex-1 border rounded-lg px-3 py-2 text-sm"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                />
                <Button onClick={() => sendMessage()}>Send</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
