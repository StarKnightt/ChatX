'use client';

/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { Bot, ChevronDown, Trash2, ChevronLeft, Keyboard, Menu, Command, Globe } from 'lucide-react';
import { ChatNavigator } from '@/components/ChatNavigator';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { useChatStore } from '@/store/chatStore';
import { CommandMenu } from '@/components/CommandMenu';

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
    { id: 'gemini', name: 'Gemini 1.5 flash', description: 'Google\'s advanced AI model' }
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

// Update the reasoningStates array
const reasoningStates = [
  "Initializing connection...",
  "Processing input...",
  "Computing response...",
  "Generating output...",
  "Formatting response..."
];

// Update the TypingIndicator component
const TypingIndicator = () => {
  const [reasoningIndex, setReasoningIndex] = useState(0);
  const [dots, setDots] = useState('');

  useEffect(() => {
    const reasoningInterval = setInterval(() => {
      setReasoningIndex((prev) => (prev + 1) % reasoningStates.length);
    }, 2000);

    const dotsInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => {
      clearInterval(reasoningInterval);
      clearInterval(dotsInterval);
    };
  }, []);

  return (
    <div className="flex items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center text-primary">
        <Bot className="h-5 w-5" />
      </div>
      <div className="flex-1 font-mono">
        <div className="terminal-prompt text-muted-foreground">
          {reasoningStates[reasoningIndex]}{dots}
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
  const {
    messages,
    isLoading,
    setLoading,
    addMessage,
    currentSessionId,
    createNewSession,
    sessions,
    deleteSession,
    deleteAllSessions
  } = useChatStore();
  
  const [mounted, setMounted] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('groq');
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCommandMenu, setShowCommandMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Create new chat on load if no current session
  useEffect(() => {
    if (mounted && !currentSessionId) {
      createNewSession();
    }
  }, [currentSessionId, createNewSession, mounted]);

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      if (newWidth > 160 && newWidth < 480) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage = {
      content,
      role: 'user' as const,
    };

    try {
      addMessage(userMessage);
      setLoading(true);

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

      const assistantMessage = {
        content: data.content.replace(/\*/g, ''),
        role: 'assistant' as const,
      };

      addMessage(assistantMessage);
    } catch (error) {
      console.error('Error:', error);
      addMessage({
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        role: 'assistant' as const,
      });
    } finally {
      setLoading(false);
    }
  };

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ctrl/Cmd + / to toggle sidebar
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsSidebarCollapsed(!isSidebarCollapsed);
      }
      // Ctrl/Cmd + K for command menu
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandMenu(true);
      }
      // Esc to collapse sidebar
      if (e.key === 'Escape' && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSidebarCollapsed]);

  const ShortcutsDialog = () => (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 ${showShortcuts ? 'flex' : 'hidden'}`}>
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-2">
          <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <span>Command Menu</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Toggle Sidebar</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">Ctrl + /</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Close Sidebar</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">Esc</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Send Message</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded">Enter</kbd>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowShortcuts(false)}
            className="px-3 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );

  // Delete all chats confirmation dialog
  const DeleteConfirmDialog = () => (
    <div className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-50 ${showDeleteConfirm ? 'flex' : 'hidden'}`}>
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex flex-col space-y-2">
          <h2 className="text-lg font-semibold text-destructive">Delete All Chats</h2>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete all chats? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowDeleteConfirm(false)}
            className="px-3 py-2 text-sm hover:bg-muted rounded-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              deleteAllSessions();
              setShowDeleteConfirm(false);
            }}
            className="px-3 py-2 text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-sm"
          >
            Delete All
          </button>
        </div>
      </div>
    </div>
  );

  const handleNewChat = () => {
    createNewSession();
  };

  if (!mounted) {
    return (
      <div className="flex h-full">
        <div className="w-80 border-r border-border">
          <div className="animate-pulse bg-card h-full" />
        </div>
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
          <div className="terminal-header flex items-center justify-between px-3 py-1 bg-muted/10 border-b border-border/20">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/70"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-primary/70"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-accent/70"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>dev@chatx:~</span>
              <span className="text-primary">$</span>
            </div>
            <div className="w-8"></div>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="animate-pulse bg-muted/5 h-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <DeleteConfirmDialog />
      <ShortcutsDialog />
      <CommandMenu 
        open={showCommandMenu}
        onOpenChange={setShowCommandMenu}
        onCreateNewChat={handleNewChat}
        onShowShortcuts={() => setShowShortcuts(true)}
        onDeleteAllChats={() => setShowDeleteConfirm(true)}
      />
      <div className="flex h-full">
        {/* Collapsible Chat Navigator */}
        <div 
          ref={sidebarRef}
          style={{ width: isSidebarCollapsed ? '0px' : `${sidebarWidth}px` }}
          className="relative flex-shrink-0 transition-all duration-500 ease-in-out overflow-hidden border-r border-border"
        >
          <div className="h-full">
            <ChatNavigator />
          </div>
          
          {/* Resize Handle */}
          <div
            className="absolute top-0 right-0 w-1 h-full cursor-col-resize bg-border hover:bg-primary/50 transition-colors"
            onMouseDown={() => setIsResizing(true)}
          />
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
          {/* Terminal Title Bar */}
          <div className="terminal-header flex items-center justify-between px-3 py-1 bg-muted/10 border-b border-border/20">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title={isSidebarCollapsed ? "Open Sidebar (Ctrl + /)" : "Close Sidebar (Ctrl + /)"}
              >
                {isSidebarCollapsed ? (
                  <Menu className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </button>
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/70"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-primary/70"></div>
                <div className="h-2.5 w-2.5 rounded-full bg-accent/70"></div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>dev@chatx:~</span>
              <span className="text-primary">$</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCommandMenu(true)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Command Menu (Ctrl + K)"
              >
                <Command className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                title="Delete All Chats"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowShortcuts(true)}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Keyboard Shortcuts"
              >
                <Keyboard className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center p-4">
                  <div className="space-y-6 text-center">
                    <pre className="hidden md:block text-primary text-sm font-mono leading-none">
{`
 ██████╗██╗  ██╗ █████╗ ████████╗██╗  ██╗
██╔════╝██║  ██║██╔══██╗╚══██╔══╝╚██╗██╔╝
██║     ███████║███████║   ██║    ╚███╔╝ 
██║     ██╔══██║██╔══██║   ██║    ██╔██╗ 
╚██████╗██║  ██║██║  ██║   ██║   ██╔╝ ██╗
 ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
`}
                    </pre>
                    <div className="space-y-2">
                      <p className="text-primary/80 text-sm">Welcome to ChatX CLI!</p>
                      <p className="text-muted-foreground text-xs">chat until credit runs out</p>
                    </div>
                  </div>
                  <div className="w-full max-w-2xl px-4 mt-8">
                    <ChatInput 
                      onSend={handleSendMessage}
                      isLoading={isLoading}
                      selectedModel={selectedModel}
                      onModelSelect={setSelectedModel}
                      disabled={false}
                      hasMessages={false}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <div className="min-h-full p-4 space-y-4">
                    {messages.map((message) => (
                      <ChatMessage key={message.id} message={message} />
                    ))}
                    {isLoading && <TypingIndicator />}
                  </div>
                  <div ref={messagesEndRef} />
                </div>
                <div className="flex-shrink-0">
                  <ChatInput 
                    onSend={handleSendMessage}
                    isLoading={isLoading}
                    selectedModel={selectedModel}
                    onModelSelect={setSelectedModel}
                    disabled={false}
                    hasMessages={true}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Terminal Status Bar */}
          <div className="px-3 py-1.5 border-t border-border/20 bg-muted/10">
            <div className="flex items-center justify-between text-xs text-muted-foreground/60">
              <div className="flex items-center gap-2">
                <span>{selectedModel === 'groq' ? 'llama-3.3-70b' : 'gemini-pro'}</span>
                <span>•</span>
                <span>{messages.length} messages</span>
              </div>
              <div className="flex items-center gap-2">
                <span>utf-8</span>
                <span>•</span>
                <span>terminal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
