

import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToChat, startChat } from '../services/geminiService';
import { LoadingSpinner } from './icons';
import { useI18n } from '../hooks/useI18n';

interface AiAssistantProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'ai';
  text: string;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { t, language } = useI18n();

  useEffect(() => {
    if (isOpen) {
      startChat(language);
      setMessages([{ sender: 'ai', text: t('aiWelcome') }]);
    }
  }, [isOpen, language, t]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToChat(input);
    
    if (response) {
      const aiMessage: Message = { sender: 'ai', text: response.text };
      setMessages(prev => [...prev, aiMessage]);
    } else {
      const errorMessage: Message = { sender: 'ai', text: t('aiError') };
      setMessages(prev => [...prev, errorMessage]);
    }
    setIsLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-24 right-6 w-full max-w-sm h-[60vh] flex flex-col z-40">
        <div className="bg-[var(--color-card)] rounded-lg shadow-xl flex flex-col h-full border border-[var(--color-border)]">
            <header className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                <h3 className="font-bold text-lg text-[var(--color-text-primary)] font-serif">{t('aiAssistant')}</h3>
                <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-2xl" aria-label={t('close')}>&times;</button>
            </header>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-[var(--color-primary)] text-white' : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-white'}`}>
                    {msg.text}
                    </div>
                </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-stone-200 dark:bg-slate-700 px-4 py-2 rounded-xl">
                            <LoadingSpinner/>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-[var(--color-border)]">
                <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                    placeholder={t('aiPlaceholder')}
                    className="flex-1 rounded-lg border-[var(--color-border)] bg-slate-100 dark:bg-slate-600 text-slate-800 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] px-4 py-2"
                    disabled={isLoading}
                />
                <button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-[var(--color-accent)] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[var(--color-accent-hover)] disabled:opacity-70 transition-colors">
                    {t('send')}
                </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AiAssistant;