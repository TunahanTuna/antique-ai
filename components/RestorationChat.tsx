import React, { useState, useEffect, useRef } from 'react';
import { Chat } from "@google/genai";
import { AntiqueAnalysis } from '../types';
import { createRestorationChat } from '../services/geminiService';
import { Send, User, Sparkles, Loader2, HelpCircle } from 'lucide-react';

interface RestorationChatProps {
  analysis: AntiqueAnalysis;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const RestorationChat: React.FC<RestorationChatProps> = ({ analysis }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Merhaba! Ben restorasyon asistanınız. "${analysis.title}" hakkında bakım, temizlik veya onarım sorularınızı cevaplayabilirim.` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const newChat = createRestorationChat(analysis);
      setChat(newChat);
      // Default initial suggestions
      setSuggestions([
        "Bu eseri nasıl temizlemeliyim?",
        "Saklama koşulları ne olmalı?",
        "Zamanla değeri artar mı?"
      ]);
    } catch (e) {
      console.error("Chat başlatılamadı:", e);
    }
  }, [analysis]);

  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      // Check if scroll is necessary
      if (scrollHeight > clientHeight) {
         chatContainerRef.current.scrollTo({
          top: scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  }, [messages, suggestions]);

  const processResponse = (fullText: string) => {
    const regex = /\|\|\|SUGGESTIONS_START\|\|\|([\s\S]*?)\|\|\|SUGGESTIONS_END\|\|\|/;
    const match = fullText.match(regex);
    let displayText = fullText;
    let newSuggestions: string[] = [];

    if (match) {
      displayText = fullText.replace(match[0], '').trim();
      try {
        newSuggestions = JSON.parse(match[1]);
      } catch (e) {
        console.error("Failed to parse suggestions", e);
      }
    }
    return { displayText, newSuggestions };
  };

  const handleSend = async (textOverride?: string) => {
    const messageText = textOverride || input;
    if (!messageText.trim() || !chat || isLoading) return;

    setInput('');
    setSuggestions([]); // Clear suggestions while thinking
    setMessages(prev => [...prev, { role: 'user', text: messageText }]);
    setIsLoading(true);

    try {
      const result = await chat.sendMessage({ message: messageText });
      const rawText = result.text || '';
      
      const { displayText, newSuggestions } = processResponse(rawText);
      
      setMessages(prev => [...prev, { role: 'model', text: displayText }]);
      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Mesaj gönderilemedi:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Üzgünüm, şu an cevap veremiyorum. Lütfen tekrar deneyin." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-antique-100 overflow-hidden flex flex-col h-[550px] transition-all duration-100 ease-out">
      {/* Header */}
      <div className="bg-antique-900 text-white p-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-antique-700 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-antique-200" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg leading-tight">Restorasyon Asistanı</h3>
          <p className="text-xs text-antique-300">Yapay zeka destekli uzman tavsiyesi</p>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-antique-50/30 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-antique-100 border border-antique-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-antique-600" />
              </div>
            )}
            
            <div 
              className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-antique-800 text-white rounded-tr-none' 
                  : 'bg-white border border-antique-200 text-antique-800 rounded-tl-none shadow-sm'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-antique-200 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-antique-700" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
           <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-antique-100 border border-antique-200 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-antique-600" />
              </div>
              <div className="bg-white border border-antique-200 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center">
                <Loader2 className="w-4 h-4 animate-spin text-antique-400" />
              </div>
           </div>
        )}
      </div>

      {/* Input & Suggestions Area */}
      <div className="bg-white border-t border-antique-100">
        {/* Suggestions Chips */}
        {suggestions.length > 0 && !isLoading && (
          <div className="px-4 pt-3 pb-1 overflow-x-auto whitespace-nowrap scrollbar-hide flex gap-2">
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(suggestion)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-antique-50 hover:bg-antique-100 border border-antique-200 rounded-full text-xs font-medium text-antique-700 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <HelpCircle className="w-3 h-3 text-antique-400" />
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="p-4 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Bir soru sorun..."
            className="w-full pl-4 pr-12 py-3 bg-antique-50 border border-antique-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-antique-400 focus:border-transparent text-antique-900 placeholder-antique-400 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-6 top-6 p-1.5 bg-antique-900 text-white rounded-lg hover:bg-antique-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};