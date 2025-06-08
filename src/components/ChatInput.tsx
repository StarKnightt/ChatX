import { KeyboardEvent, useState } from 'react';
import { ArrowUp, Globe, ChevronDown } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  selectedModel: string;
  onModelSelect: (model: string) => void;
  disabled?: boolean;
  hasMessages?: boolean;
}

const ModelSelector = ({ selectedModel, onSelect, isLoading, disabled, hasMessages }: { 
  selectedModel: string; 
  onSelect: (model: string) => void;
  isLoading: boolean;
  disabled: boolean;
  hasMessages: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const models = [
    { id: 'groq', name: 'Llama 3.3 70B', description: 'Versatile large language model' },
    { id: 'gemini', name: 'Gemini 1.5 flash', description: 'Google\'s advanced AI model' }
  ];

  const selectedModelName = models.find(m => m.id === selectedModel)?.name || 'Select Model';
  const isDisabled = disabled || isLoading || hasMessages;

  return (
    <div className="relative">
      <button
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
          isDisabled ? 'text-muted-foreground cursor-not-allowed' : 'text-muted-foreground hover:text-foreground'
        }`}
        disabled={isDisabled}
        title={hasMessages ? "Can't change model during chat" : undefined}
      >
        <Globe className="h-4 w-4 flex-shrink-0" />
        <span className="hidden md:inline truncate">{selectedModelName}</span>
        {!hasMessages && (
          <ChevronDown className={`h-4 w-4 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
        {isLoading && (
          <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary animate-pulse" />
        )}
      </button>

      {isOpen && !hasMessages && (
        <div className="absolute left-0 md:right-0 top-full mt-1 border border-border bg-card py-1 shadow-lg z-50 min-w-[200px]">
          {models.map(model => (
            <button
              key={model.id}
              onClick={() => {
                onSelect(model.id);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 text-left hover:bg-muted transition-colors ${
                selectedModel === model.id ? 'bg-muted' : ''
              }`}
            >
              <div className="text-sm text-foreground truncate">{model.name}</div>
              <div className="text-xs text-muted-foreground truncate">{model.description}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export function ChatInput({ onSend, isLoading, selectedModel, onModelSelect, disabled, hasMessages = false }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative border-t border-border">
      <div className="absolute left-0 top-0 bottom-0 flex items-center px-2 md:px-4">
        <ModelSelector 
          selectedModel={selectedModel}
          onSelect={onModelSelect}
          isLoading={isLoading}
          disabled={disabled || false}
          hasMessages={hasMessages || false}
        />
      </div>
      <div className="flex items-center pl-[48px] md:pl-[220px] pr-10 md:pr-12">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          disabled={disabled || isLoading}
          className="w-full bg-background text-foreground py-3 font-mono resize-none focus:outline-none disabled:opacity-50"
          style={{
            minHeight: '3rem',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!message.trim() || disabled || isLoading}
          className="absolute right-2 md:right-4 text-primary hover:text-accent disabled:text-muted-foreground disabled:hover:text-muted-foreground transition-colors"
        >
          <ArrowUp className={`h-4 w-4 transition-transform ${isLoading ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );
} 