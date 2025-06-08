'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Terminal, Keyboard } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateNewChat: () => void;
  onShowShortcuts: () => void;
  onDeleteAllChats: () => void;
}

export function CommandMenu({
  open,
  onOpenChange,
  onCreateNewChat,
  onShowShortcuts,
  onDeleteAllChats
}: CommandMenuProps) {
  const [input, setInput] = useState('');
  const { sessions, loadSession } = useChatStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [onOpenChange, open]);

  const commands = [
    { id: 'new-chat', name: 'New Chat', icon: Plus, action: onCreateNewChat },
    { id: 'shortcuts', name: 'Keyboard Shortcuts', icon: Keyboard, action: onShowShortcuts },
    { id: 'delete-all', name: 'Delete All Chats', icon: Trash2, action: onDeleteAllChats },
    ...sessions.map(session => ({
      id: session.id,
      name: `Switch to: ${session.name}`,
      icon: Terminal,
      action: () => loadSession(session.id)
    }))
  ];

  const filteredCommands = commands.filter(command =>
    command.name.toLowerCase().includes(input.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-card shadow-lg duration-200 sm:rounded-sm">
        <div className="flex items-center border-b px-3">
          <span className="text-sm text-muted-foreground">$</span>
          <input
            className="flex h-10 w-full rounded-none bg-transparent py-3 px-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type a command or search..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {filteredCommands.map(command => (
            <button
              key={command.id}
              onClick={() => {
                command.action();
                onOpenChange(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <command.icon className="h-4 w-4" />
              {command.name}
            </button>
          ))}
          {filteredCommands.length === 0 && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 