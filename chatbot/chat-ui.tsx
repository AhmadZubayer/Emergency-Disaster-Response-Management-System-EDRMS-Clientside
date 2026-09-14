'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import MuiDrawer from '@/components/mui-drawer';
import {
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
} from '@/components/ui/message-scroller';
import ChatbotIcon from './chatbot-icon';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const QUICK_SUGGESTIONS = [
  { label: 'Active Donations', prompt: 'Is there any donation campaigns available right now?' },
  { label: 'Request Rescue', prompt: 'How can I submit an urgent rescue request?' },
  { label: 'Missing Persons', prompt: 'How do I search or report a missing person?' },
  { label: 'Emergency Helplines', prompt: 'What are the emergency contact numbers in Bangladesh?' },
  { label: 'কোন ডোনেশন কি আছে?', prompt: 'কোন ডোনেশন কি আছে বা সাহায্য কিভাবে পাবো?' },
];

let messageCounter = 0;
const getNextId = (prefix: string) => {
  messageCounter += 1;
  return `${prefix}-${messageCounter}`;
};

const getNowTime = () => {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const INITIAL_GREETING: ChatMessage = {
  id: 'greeting',
  role: 'assistant',
  content: `Hello. I am your EDRMS AI Assistant.

I can help you with:
- Finding active Donation Campaigns and applying for relief aid
- Submitting urgent Rescue Requests and viewing crisis statuses
- Reporting or searching for Missing Persons
- Real-time disaster alerts, volunteer, and shelter information

Ask me anything in English, Bangla, or Banglish.`,
  timestamp: 'Just now',
};

const emptySubscribe = () => () => {};

export default function ChatbotUI() {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_GREETING]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleCustomOpen = () => setIsOpen(true);
    window.addEventListener('open-edrms-chatbot', handleCustomOpen);
    return () => window.removeEventListener('open-edrms-chatbot', handleCustomOpen);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isMounted) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputValue).trim();
    if (!messageContent || isLoading) return;

    setError(null);
    const userMessage: ChatMessage = {
      id: getNextId('user'),
      role: 'user',
      content: messageContent,
      timestamp: getNowTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history for API (exclude greeting)
      const history = messages
        .filter((m) => m.id !== 'greeting')
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.content,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageContent,
          history: history,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to receive response from assistant.');
      }

      const assistantMessage: ChatMessage = {
        id: getNextId('assistant'),
        role: 'assistant',
        content: data.reply || 'No response received.',
        timestamp: getNowTime(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      const errMsg = err instanceof Error ? err.message : 'Something went wrong. Please check your connection.';
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };


  // Safe Markdown link and formatting renderer (No icons or emojis)
  const renderFormattedText = (text: string) => {
    // Strip any emojis if present in text
    const textWithoutEmojis = text.replace(
      /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F900}-\u{1F9FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu,
      ''
    );

    const parts: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(textWithoutEmojis)) !== null) {
      if (match.index > lastIndex) {
        parts.push(textWithoutEmojis.substring(lastIndex, match.index));
      }
      const linkText = match[1];
      const linkUrl = match[2];

      const isInternal = linkUrl.startsWith('/');
      if (isInternal) {
        parts.push(
          <Link
            key={`link-${match.index}`}
            href={linkUrl}
            onClick={() => setIsOpen(false)}
            className="inline font-semibold text-emerald-600 underline underline-offset-2 hover:text-emerald-800 transition-colors mx-0.5"
          >
            {linkText}
          </Link>
        );
      } else {
        parts.push(
          <a
            key={`link-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline font-semibold text-cyan-600 underline underline-offset-2 hover:text-cyan-800 transition-colors mx-0.5"
          >
            {linkText}
          </a>
        );
      }
      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < textWithoutEmojis.length) {
      parts.push(textWithoutEmojis.substring(lastIndex));
    }

    return (
      <div className="space-y-1.5 whitespace-pre-wrap leading-relaxed text-sm">
        {parts.map((part, pIdx) => {
          if (typeof part === 'string') {
            const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
            return (
              <span key={`p-${pIdx}`}>
                {boldParts.map((sub, bIdx) => {
                  if (sub.startsWith('**') && sub.endsWith('**') && sub.length >= 4) {
                    return (
                      <strong key={`b-${bIdx}`} className="font-semibold text-slate-900">
                        {sub.slice(2, -2)}
                      </strong>
                    );
                  }
                  return sub;
                })}
              </span>
            );
          }
          return <React.Fragment key={`frag-${pIdx}`}>{part}</React.Fragment>;
        })}
      </div>
    );
  };

  return (
    <>
      {/* MUI Swipeable Drawer */}
      <MuiDrawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="EDRMS Assistant"
        width={480}
        anchor="right"
      >
        <div className="flex flex-col h-full bg-slate-50">
          {/* Quick Suggestion Chips (Without emojis) */}
          <div className="px-4 py-2 bg-slate-100/80 border-b border-gray-200/80 overflow-x-auto no-scrollbar flex items-center gap-1.5 shrink-0">
            {QUICK_SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="whitespace-nowrap text-xs font-medium px-3 py-1 rounded-full bg-white border border-gray-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 transition-all shrink-0 cursor-pointer disabled:opacity-50"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Message Scroller */}
          <div className="flex-1 min-h-0 relative">
            <MessageScrollerProvider>
              <MessageScroller className="size-full">
                <MessageScrollerViewport className="p-4">
                  <MessageScrollerContent className="gap-3">
                    {messages.map((msg, index) => {
                      const isUser = msg.role === 'user';
                      const isLast = index === messages.length - 1;
                      return (
                        <MessageScrollerItem
                          key={msg.id}
                          scrollAnchor={isLast}
                          className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-2xl px-4 py-2.5 shadow-xs ${
                              isUser
                                ? 'rounded-tr-none text-slate-900 border border-slate-200/90'
                                : 'rounded-tl-none text-slate-800 border border-gray-200'
                            }`}
                            style={
                              isUser
                                ? { backgroundColor: '#f1f5f9', color: '#0f172a' }
                                : { backgroundColor: '#ffffff', color: '#1e293b' }
                            }
                          >
                            {isUser ? (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap font-normal text-slate-900">
                                {msg.content}
                              </p>
                            ) : (
                              <>
                                <div className="text-[11px] font-bold uppercase tracking-wider mb-1 text-slate-500 opacity-70">
                                  EDRMS Assistant
                                </div>
                                {renderFormattedText(msg.content)}
                                <span className="block text-[10px] mt-1.5 text-right text-slate-400">
                                  {msg.timestamp}
                                </span>
                              </>
                            )}
                          </div>
                        </MessageScrollerItem>
                      );
                    })}

                    {/* Loading Indicator */}
                    {isLoading && (
                      <MessageScrollerItem scrollAnchor className="flex justify-start">
                        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-xs flex items-center gap-2.5">
                          <ChatbotIcon size={16} />
                          <span className="text-xs text-slate-600 font-medium">Assistant is typing...</span>
                        </div>
                      </MessageScrollerItem>
                    )}

                    {/* Error Message */}
                    {error && (
                      <MessageScrollerItem className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                        <p className="font-semibold">Unable to process request</p>
                        <p className="mt-0.5">{error}</p>
                      </MessageScrollerItem>
                    )}
                  </MessageScrollerContent>
                </MessageScrollerViewport>
                <MessageScrollerButton />
              </MessageScroller>
            </MessageScrollerProvider>
          </div>

          {/* Input Footer */}
          <div className="p-3.5 bg-white border-t border-gray-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask in English or বাংলা (e.g. kono donation ache?)..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-sm bg-slate-100 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center shrink-0 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
            <p className="text-[10px] text-center text-slate-400 mt-2">
              EDRMS AI can make mistakes. For emergency rescues, always call <strong className="text-slate-600">999</strong> directly.
            </p>
          </div>

        </div>
      </MuiDrawer>
    </>
  );
}
