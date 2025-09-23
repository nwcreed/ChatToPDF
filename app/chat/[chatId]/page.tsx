"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

// === Markdown renderer ===
const MarkdownText = ({ content }: { content: string }) => {
  const renderMarkdown = (text: string) => {
    text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    text = text.replace(/__(.*?)__/g, "<strong>$1</strong>");
    text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
    text = text.replace(/_(.*?)_/g, "<em>$1</em>");
    text = text.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2"><code class="font-mono text-sm">$1</code></pre>');
    text = text.replace(/\n/g, "<br>");
    return text;
  };

  return (
    <div
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Chatbot() {
  const { chatId } = useParams<{ chatId: string }>(); // ✅ récupère l'ID depuis l'URL
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || !chatId) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`/api/chat/${chatId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          fileKey: "file-123", // 👉 tu mettras la vraie clé de fichier ici
        }),
      });

      if (!response.body) return;

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        assistantText += chunk;

        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === "assistant") {
            return [...prev.slice(0, -1), { role: "assistant", content: assistantText }];
          } else {
            return [...prev, { role: "assistant", content: assistantText }];
          }
        });
      }
    } catch (error) {
      console.error("Erreur :", error);
    }

    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/30">
        <h2 className="text-lg font-medium text-gray-900">Assistant IA</h2>
      </div>

      {/* Messages */}
      <div className="h-[500px] overflow-y-auto px-6 py-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Commencez une conversation...</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className="space-y-2">
            {msg.role === "user" ? (
              <div className="flex justify-end">
                <div className="bg-black text-white px-4 py-3 rounded-2xl rounded-br-md max-w-[75%] shadow-sm">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-xs font-medium text-gray-500 mb-2">Assistant</div>
                <div className="text-gray-800 leading-relaxed max-w-[90%]">
                  <MarkdownText content={msg.content} />
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="space-y-1">
            <div className="text-xs font-medium text-gray-500 mb-2">Assistant</div>
            <div className="flex items-center space-x-2 text-gray-400">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
              <span className="text-sm">Réflexion en cours...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/20">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tapez votre message..."
              disabled={loading}
              className="pr-12 py-3 rounded-xl border-gray-200 focus:border-gray-300 focus:ring-1 focus:ring-gray-300 resize-none"
            />
          </div>
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-black hover:bg-gray-800 rounded-xl px-4 py-3 shadow-sm transition-all duration-200"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
