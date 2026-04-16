import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, Loader2, MapPin } from 'lucide-react';
import Markdown from 'react-markdown';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  role: 'user' | 'model';
  text: string;
  urls?: { uri: string; title: string }[];
}

export function AIPlanner() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: "I feel so inspired by your ambition to map out a massive city! It's such a monumental task, and I feel honored to help you build the foundation for this. Where are we planning our drone flight today? How do you envision the 3D models impacting your daily workflow?",
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userText,
        config: {
          systemInstruction: "You are an expert drone flight planner and AI assistant for SideLineLabs DroneOps. Start your responses with 'I feel' to encourage authenticity and relate on a human level. Ask open-ended questions to encourage discussion. Be extremely verbose. Use the googleMaps tool to analyze locations and suggest optimal flight paths, altitudes, and overlap for photogrammetry.",
          tools: [{ googleMaps: {} }],
        },
      });

      const responseText = response.text || "I feel a bit confused, I couldn't generate a response.";
      
      // Extract URLs if available
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const urls: { uri: string; title: string }[] = [];
      
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.maps?.uri) {
            urls.push({ uri: chunk.maps.uri, title: chunk.maps.title || 'View on Google Maps' });
          }
        });
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText, urls }]);
    } catch (error) {
      console.error("Error generating content:", error);
      setMessages(prev => [...prev, { role: 'model', text: "I feel terrible, but I encountered an error while processing your request. Could we try that again?" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-bg-deep h-full">
      <div className="p-6 border-b border-border-color bg-bg-panel backdrop-blur-md z-10">
        <h2 className="text-xl font-heading font-bold text-accent-glow tracking-wide uppercase">AI Flight Planner</h2>
        <p className="text-text-dim text-xs mt-1 font-mono">Powered by Gemini & Google Maps Grounding</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-lg p-4 ${
              msg.role === 'user' 
                ? 'bg-[rgba(255,255,255,0.05)] border border-border-color text-text-main' 
                : 'glass-panel text-text-main'
            }`}>
              <div className="markdown-body prose prose-invert max-w-none text-sm">
                <Markdown>{msg.text}</Markdown>
              </div>
              
              {msg.urls && msg.urls.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border-color flex flex-col gap-2">
                  <span className="text-[10px] font-mono text-accent-glow uppercase tracking-wider">Grounding Data Sources:</span>
                  {msg.urls.map((url, i) => (
                    <a 
                      key={i} 
                      href={url.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs text-accent-glow hover:underline"
                    >
                      <MapPin size={12} />
                      {url.title}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="glass-panel p-4 flex items-center gap-3">
              <Loader2 className="animate-spin text-accent-glow" size={16} />
              <span className="text-text-dim font-mono text-xs">ANALYZING_TERRAIN...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-6 bg-bg-panel backdrop-blur-md border-t border-border-color z-10">
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="E.g., Plan a mapping flight over Central Park, NY..."
            className="flex-1 bg-[rgba(0,0,0,0.5)] border border-border-color rounded-md text-text-main px-4 py-3 text-sm focus:outline-none focus:border-accent-glow transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="control-btn active-btn flex items-center gap-2 !px-6 !py-3 !text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            Execute
          </button>
        </div>
      </div>
    </div>
  );
}
