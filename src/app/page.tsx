'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowUp, Globe, User, Bot, ArrowLeft, Copy } from 'lucide-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/one-dark';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
}

// Helper function to detect code blocks
const processMessageContent = (content: string) => {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Add text before code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'plaintext',
      content: match[2].trim()
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.slice(lastIndex)
    });
  }

  return parts;
};

const copyToClipboard = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

export default function Home() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestion(e.target.value);
    adjustTextareaHeight();
  };

  const handleSendMessage = async () => {
    if (question.trim() && !isLoading) {
      const userMessage: Message = {
        id: Date.now().toString(),
        content: question.trim(),
        role: 'user',
      };

      setMessages(prev => [...prev, userMessage]);
      setQuestion('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(({ content, role }) => ({
              content,
              role
            }))
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.content.replace(/\*/g, ''), // Remove asterisks
          role: 'assistant',
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: 'Sorry, I encountered an error. Please try again.',
          role: 'assistant',
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [question]);

  const handleCopyMessage = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setQuestion('');
  };

  return (
    <div className="flex h-screen bg-[oklch(14.5%_0_0)] text-[oklch(98.5%_0_0)]">
      <div className="w-full max-w-3xl mx-auto flex flex-col h-full p-4">
        <div className="flex items-center justify-between mb-4">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-2 text-[oklch(70.8%_0_0)] hover:text-[oklch(87%_0_0)] transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>
          )}
        </div>

        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="space-y-4 text-center mb-8">
              <h1 className="text-4xl font-medium">Fix your problems with AI</h1>
              <p className="text-[oklch(70.8%_0_0)] text-lg">Chat with AI models until the credit runs out</p>
            </div>
            
            <div className="w-full max-w-xl">
              <div className="w-full relative">
                <textarea
                  ref={textareaRef}
                  data-slot="textarea"
                  value={question}
                  onChange={handleInput}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a question..."
                  rows={1}
                  disabled={isLoading}
                  className="border-input placeholder:text-[oklch(55.6%_0_0)] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content w-full rounded-[0.625rem] border border-[oklch(37.1%_0_0)] bg-[oklch(20.5%_0_0)] px-4 py-4 text-base leading-relaxed text-[oklch(97%_0_0)] shadow-xs transition-all outline-none touch-manipulation disabled:opacity-50 focus:border-[oklch(55.6%_0_0)] hover:border-[oklch(43.9%_0_0)]"
                  style={{
                    userSelect: 'text',
                    resize: 'none',
                    minHeight: '40px',
                    maxHeight: '200px',
                    paddingRight: '48px',
                    paddingBottom: '64px'
                  }}
                />
                
                <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-[oklch(20.5%_0_0)] border border-[oklch(37.1%_0_0)] rounded-[0.625rem] pl-2 pr-3 py-1.5 hover:border-[oklch(43.9%_0_0)] transition-colors">
                      <Globe className="h-[18px] w-[18px] text-[oklch(70.8%_0_0)]" />
                      <select 
                        className="bg-transparent text-[13px] text-[oklch(70.8%_0_0)] focus:outline-none cursor-pointer appearance-none"
                        defaultValue="llama"
                      >
                        <option value="llama">Llama 3.3 70B</option>
                      </select>
                    </div>
                    <div className="flex items-center bg-[oklch(20.5%_0_0)] border border-[oklch(37.1%_0_0)] rounded-[0.625rem] px-3 py-1.5 hover:border-[oklch(43.9%_0_0)] transition-colors">
                      <span className="text-[13px] text-[oklch(70.8%_0_0)]">Extreme</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !question.trim()}
                    className="p-1.5 rounded-[0.625rem] bg-[oklch(26.9%_0_0)] hover:bg-[oklch(37.1%_0_0)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[oklch(26.9%_0_0)]"
                    aria-label="Send message"
                  >
                    <ArrowUp className="h-[18px] w-[18px] text-[oklch(87%_0_0)]" />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 overflow-hidden">
                <div 
                  ref={marqueeRef}
                  className="whitespace-nowrap animate-marquee text-[oklch(55.6%_0_0)] text-sm"
                >
                  Try "Tell me about quantum computing" • "Write a poem about space" • "Explain blockchain technology" • "Design a recipe for pasta"
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'assistant' ? 'bg-[oklch(20.5%_0_0)] rounded-2xl p-4' : ''
                }`}
              >
                <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg ${
                  message.role === 'assistant' 
                    ? 'bg-[oklch(26.9%_0_0)]' 
                    : 'bg-[oklch(26.9%_0_0)]'
                }`}>
                  {message.role === 'assistant' ? (
                    <Bot className="h-5 w-5 text-[oklch(87%_0_0)]" />
                  ) : (
                    <User className="h-5 w-5 text-[oklch(87%_0_0)]" />
                  )}
                </div>
                <div className="flex-1 space-y-2 overflow-hidden group">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex-1 overflow-x-auto">
                      {processMessageContent(message.content).map((part, index) => (
                        part.type === 'code' ? (
                          <div key={index} className="my-2 rounded-lg overflow-hidden relative group/code">
                            <div className="bg-[oklch(26.9%_0_0)] px-4 py-2 text-sm text-[oklch(70.8%_0_0)] border-b border-[oklch(37.1%_0_0)] flex justify-between items-center">
                              <span>{part.language}</span>
                              <button
                                onClick={() => copyToClipboard(part.content)}
                                className="opacity-0 group-hover/code:opacity-100 transition-opacity p-1 hover:bg-[oklch(31%_0_0)] rounded"
                                title="Copy code"
                              >
                                <Copy className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="overflow-x-auto">
                              <SyntaxHighlighter
                                language={part.language}
                                style={oneDark}
                                customStyle={{
                                  margin: 0,
                                  background: 'oklch(26.9% 0 0)',
                                  padding: '1rem',
                                }}
                              >
                                {part.content}
                              </SyntaxHighlighter>
                            </div>
                          </div>
                        ) : (
                          <p key={index} className="text-base leading-relaxed whitespace-pre-wrap overflow-x-auto">{part.content}</p>
                        )
                      ))}
                    </div>
                    <button
                      onClick={() => handleCopyMessage(message.content, message.id)}
                      className={`self-end shrink-0 p-1 rounded hover:bg-[oklch(26.9%_0_0)] transition-colors ${
                        copiedId === message.id ? 'text-green-500' : 'text-[oklch(70.8%_0_0)] opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label="Copy full message"
                      title="Copy full message"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
        
        {messages.length > 0 && (
          <div className="w-full relative">
            <textarea
              ref={textareaRef}
              data-slot="textarea"
              value={question}
              onChange={handleInput}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question..."
              rows={1}
              disabled={isLoading}
              className="border-input placeholder:text-[oklch(55.6%_0_0)] focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content w-full rounded-[0.625rem] border border-[oklch(37.1%_0_0)] bg-[oklch(20.5%_0_0)] px-4 py-4 text-base leading-relaxed text-[oklch(97%_0_0)] shadow-xs transition-all outline-none touch-manipulation disabled:opacity-50 focus:border-[oklch(55.6%_0_0)] hover:border-[oklch(43.9%_0_0)]"
              style={{
                userSelect: 'text',
                resize: 'none',
                minHeight: '40px',
                maxHeight: '200px',
                paddingRight: '48px',
                paddingBottom: '64px'
              }}
            />
            
            <div className="absolute left-3 right-3 bottom-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 bg-[oklch(20.5%_0_0)] border border-[oklch(37.1%_0_0)] rounded-[0.625rem] pl-2 pr-3 py-1.5 hover:border-[oklch(43.9%_0_0)] transition-colors">
                  <Globe className="h-[18px] w-[18px] text-[oklch(70.8%_0_0)]" />
                  <select 
                    className="bg-transparent text-[13px] text-[oklch(70.8%_0_0)] focus:outline-none cursor-pointer appearance-none"
                    defaultValue="llama"
                  >
                    <option value="llama">Llama 3.3 70B</option>
                  </select>
                </div>
                <div className="flex items-center bg-[oklch(20.5%_0_0)] border border-[oklch(37.1%_0_0)] rounded-[0.625rem] px-3 py-1.5 hover:border-[oklch(43.9%_0_0)] transition-colors">
                  <span className="text-[13px] text-[oklch(70.8%_0_0)]">Extreme</span>
                </div>
              </div>
              
              <button 
                onClick={() => handleSendMessage()}
                disabled={isLoading || !question.trim()}
                className="p-1.5 rounded-[0.625rem] bg-[oklch(26.9%_0_0)] hover:bg-[oklch(37.1%_0_0)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[oklch(26.9%_0_0)]"
                aria-label="Send message"
              >
                <ArrowUp className="h-[18px] w-[18px] text-[oklch(87%_0_0)]" />
              </button>
            </div>
          </div>
        )}

        {messages.length === 0 && (
          <div className="flex items-center gap-2 mt-8 text-[oklch(55.6%_0_0)] text-sm">
            <span>02:38 PM</span>
            <span>•</span>
            <span>Tue, May 20</span>
          </div>
        )}
      </div>
    </div>
  );
}
