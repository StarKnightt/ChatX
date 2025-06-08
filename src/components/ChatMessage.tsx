import { Message } from '@/types/chat';
import { Bot, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="group space-y-2 px-4 py-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>[{formatTimestamp(message.timestamp)}]</span>
        {message.role === 'assistant' ? (
          <span className="flex items-center gap-1">
            <Bot className="h-3 w-3" />
            system@chat
          </span>
        ) : (
          <span className="flex items-center gap-1">
            <span className="text-primary">$</span>
            user@chat
          </span>
        )}
      </div>

      <div className="prose prose-invert max-w-none pl-4">
        <ReactMarkdown
          components={{
            code({ className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !className?.includes('language-');
              const codeString = String(children).replace(/\n$/, '');

              if (!isInline && match) {
                return (
                  <div className="group/code relative">
                    <div className="flex items-center justify-between bg-muted/10 px-4 py-1 text-xs text-muted-foreground/60">
                      <span>{match[1]}</span>
                      <button
                        onClick={() => copyToClipboard(codeString)}
                        className="opacity-0 group-hover/code:opacity-100 transition-opacity hover:text-primary cursor-pointer"
                      >
                        {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <SyntaxHighlighter
                      language={match[1]}
                      style={oneDark}
                      customStyle={{
                        margin: 0,
                        background: 'var(--muted)',
                        padding: '1rem',
                        fontSize: '0.875rem',
                        fontFamily: '"JetBrains Mono", monospace',
                        borderRadius: 0,
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                );
              }
              return (
                <code className="bg-muted/10 px-1.5 py-0.5 text-primary font-mono rounded-none" {...props}>
                  {children}
                </code>
              );
            },
            p: ({ children }) => (
              <p className="my-2 leading-relaxed">{children}</p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-4 space-y-1">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-4 space-y-1">{children}</ol>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-primary pl-4 italic">{children}</blockquote>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => copyToClipboard(message.content)}
          className={`text-xs ${
            copied ? 'text-primary' : 'text-muted-foreground/60 opacity-0 group-hover:opacity-100'
          } transition-colors hover:text-primary cursor-pointer`}
        >
          {copied ? (
            <span className="flex items-center gap-1">
              <Check className="h-3 w-3" />
              Copied to clipboard
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Copy className="h-3 w-3" />
              Copy output
            </span>
          )}
        </button>
      </div>
    </div>
  );
} 