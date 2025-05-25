'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Globe, User, Bot, ArrowLeft, Copy, ChevronDown } from 'lucide-react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import oneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/one-dark';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  model?: string;
}

interface ChatInputProps {
  onSend: (content: string) => Promise<void>;
  isLoading: boolean;
  selectedModel: string;
  onModelSelect: (model: string) => void;
  disabled: boolean;
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

// Add TimeDisplay component
const TimeDisplay = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex items-center gap-2 text-[oklch(55.6%_0_0)] text-sm">
      <span>{formatTime(currentTime)}</span>
      <span>•</span>
      <span>{formatDate(currentTime)}</span>
    </div>
  );
};

// Add Navbar component
const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-[oklch(26.9%_0_0)]">
      <div className="flex items-center gap-3">
        <Bot className="h-6 w-6 text-[oklch(87%_0_0)]" />
        <span className="text-lg font-medium">ChatX</span>
      </div>
      <TimeDisplay />
    </nav>
  );
};

const ModelSelector = ({ selectedModel, onSelect, isLoading, disabled }: { 
  selectedModel: string; 
  onSelect: (model: string) => void;
  isLoading: boolean;
  disabled: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const models = [
    { id: 'groq', name: 'Llama 3.3 70B', description: 'Versatile large language model' },
    { id: 'gemini', name: 'Gemini Pro', description: 'Google\'s advanced AI model' }
  ];

  const selectedModelName = models.find(m => m.id === selectedModel)?.name || 'Select Model';

  if (disabled) {
    return (
      <div className="flex items-center gap-2 bg-[oklch(20.5%_0_0)] border border-[oklch(37.1%_0_0)] rounded-[0.625rem] pl-2 pr-3 py-1.5">
        <Globe className="h-[18px] w-[18px] text-[oklch(70.8%_0_0)]" />
        <span className="text-[13px] text-[oklch(70.8%_0_0)]">{selectedModelName}</span>
      </div>
    );
  }

  return (
    <div 
      ref={dropdownRef}
      className="flex items-center gap-2 bg-[oklch(20.5%_0_0)] border border-[oklch(37.1%_0_0)] rounded-[0.625rem] pl-2 pr-1 py-1.5 hover:border-[oklch(43.9%_0_0)] transition-all relative"
    >
      <Globe className="h-[18px] w-[18px] text-[oklch(70.8%_0_0)]" />
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center min-w-[130px] text-left"
        disabled={isLoading}
        type="button"
      >
        <span className="text-[13px] text-[oklch(70.8%_0_0)] hover:text-[oklch(87%_0_0)] transition-colors pr-6">
          {selectedModelName}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-[oklch(70.8%_0_0)] absolute right-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>
      {isLoading && (
        <div className="absolute -top-1 -right-1 flex items-center gap-1">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse-ring"></div>
        </div>
      )}
      <div 
        className={`absolute left-0 right-0 top-full mt-1 py-1 bg-[oklch(20.5%_0_0)] border border-[oklch(37.1%_0_0)] rounded-lg shadow-lg transition-all duration-200 z-50 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="px-3 py-1 text-[11px] text-[oklch(55.6%_0_0)] uppercase font-medium">
          Available Models
        </div>
        {models.map(model => (
          <button
            key={model.id}
            onClick={() => {
              onSelect(model.id);
              setIsOpen(false);
            }}
            className={`w-full px-3 py-2 text-left group hover:bg-[oklch(26.9%_0_0)] transition-colors ${
              selectedModel === model.id ? 'bg-[oklch(26.9%_0_0)]' : ''
            }`}
            type="button"
          >
            <div>
              <div className="text-[13px] text-[oklch(87%_0_0)] font-medium">
                {model.name}
              </div>
              <div className="text-[11px] text-[oklch(70.8%_0_0)] group-hover:text-[oklch(87%_0_0)] transition-colors">
                {model.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Update ChatInput to pass disabled state
const ChatInput = ({ onSend, isLoading, selectedModel, onModelSelect, disabled }: ChatInputProps & { disabled: boolean }) => {
  const [question, setQuestion] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && !isLoading) {
      await onSend(question.trim());
      setQuestion('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [question]);

  return (
    <form onSubmit={handleSubmit} className="w-full relative">
      <textarea
        ref={textareaRef}
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
        <ModelSelector 
          selectedModel={selectedModel} 
          onSelect={onModelSelect}
          isLoading={isLoading}
          disabled={disabled}
        />
        
        <button 
          type="submit"
          disabled={isLoading || !question.trim()}
          className={`p-2 rounded-[0.625rem] bg-[oklch(26.9%_0_0)] hover:bg-[oklch(37.1%_0_0)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[oklch(26.9%_0_0)] ${
            isLoading ? 'animate-pulse-soft' : ''
          }`}
          aria-label="Send message"
        >
          <ArrowUp className={`h-5 w-5 text-[oklch(87%_0_0)] transition-transform ${
            isLoading ? 'rotate-180' : ''
          }`} />
        </button>
      </div>
    </form>
  );
};

// Add reasoning states
const reasoningStates = [
  "Reading your message",
  "Processing context",
  "Analyzing information",
  "Formulating response",
  "Reviewing answer"
];

// Enhanced TypingIndicator with reasoning states
const TypingIndicator = () => {
  const [reasoningIndex, setReasoningIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reasoningInterval = setInterval(() => {
      setReasoningIndex((prev) => (prev + 1) % reasoningStates.length);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 50);

    return () => {
      clearInterval(reasoningInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="flex flex-col gap-3 bg-[oklch(20.5%_0_0)] rounded-2xl p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-[oklch(26.9%_0_0)]">
          <Bot className="h-5 w-5 text-[oklch(87%_0_0)]" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[oklch(70.8%_0_0)] text-sm">
              {reasoningStates[reasoningIndex]}
            </span>
            <div className="flex space-x-1">
              <div className="h-2 w-2 rounded-full bg-[oklch(70.8%_0_0)] animate-bounce [animation-delay:-0.3s]"></div>
              <div className="h-2 w-2 rounded-full bg-[oklch(70.8%_0_0)] animate-bounce [animation-delay:-0.15s]"></div>
              <div className="h-2 w-2 rounded-full bg-[oklch(70.8%_0_0)] animate-bounce"></div>
            </div>
          </div>
          <div className="w-full h-1 bg-[oklch(26.9%_0_0)] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[oklch(70.8%_0.2_280)] to-[oklch(70.8%_0.2_320)] animate-progress-indeterminate"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Add Suggestions component
const Suggestions = ({ onSelect }: { onSelect: (text: string) => void }) => {
  const suggestions = [
    "Tell me about quantum computing",
    "Write a poem about space",
    "Explain blockchain technology",
    "Design a recipe for pasta"
  ];

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {suggestions.map((suggestion, index) => (
        <React.Fragment key={suggestion}>
          <button
            onClick={() => onSelect(suggestion)}
            className="text-[oklch(55.6%_0_0)] hover:text-[oklch(87%_0_0)] transition-colors"
          >
            {suggestion}
          </button>
          {index < suggestions.length - 1 && (
            <span className="text-[oklch(55.6%_0_0)]">•</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>('groq');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Scroll to bottom when loading state changes to false (message sent)
    if (!isLoading) {
      scrollToBottom();
    }
  }, [isLoading]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
    };

    try {
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ content, role }) => ({
            content,
            role
          })),
          model: selectedModel
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();
      
      if (!data.content) {
        throw new Error('Invalid response format from API');
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.content.replace(/\*/g, ''),
        role: 'assistant',
        model: data.model
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        role: 'assistant',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

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
  };

  const handleSuggestionClick = (text: string) => {
    if (!isLoading) {
      handleSendMessage(text);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[oklch(14.5%_0_0)] text-[oklch(98.5%_0_0)]">
      <Navbar />
      <div className="flex-1 overflow-hidden">
        <div className="w-full max-w-3xl mx-auto flex flex-col h-full p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
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
            <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
              <div className="space-y-4 text-center mb-8">
                <h1 className="text-4xl font-medium">Fix your problems with AI</h1>
                <p className="text-[oklch(70.8%_0_0)] text-lg">Chat with AI models until the credit runs out</p>
              </div>
              
              <div className="w-full max-w-xl">
                <ChatInput 
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  disabled={false}
                />
                
                <div className="mt-4 overflow-hidden">
                  <Suggestions onSelect={handleSuggestionClick} />
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 min-h-0">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 animate-fade-in ${
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
                {isLoading && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex-shrink-0">
                <ChatInput 
                  onSend={handleSendMessage}
                  isLoading={isLoading}
                  selectedModel={selectedModel}
                  onModelSelect={setSelectedModel}
                  disabled={true}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
