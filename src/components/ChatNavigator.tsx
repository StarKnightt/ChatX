'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { ChevronRight, Trash2, Edit2, Check, X, Plus } from 'lucide-react';
import { useChatStore } from '@/store/chatStore';

export function ChatNavigator() {
  const {
    sessions,
    currentSessionId,
    createNewSession,
    loadSession,
    deleteSession,
    renameSession,
    getCurrentSession
  } = useChatStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newChatName, setNewChatName] = useState('');
  const editInputRef = useRef<HTMLInputElement>(null);
  const newChatInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingId]);

  const currentSession = getCurrentSession();
  const hasMessages = currentSession?.messages?.length ?? 0 > 0;

  const handleCommand = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (isCreatingNew && newChatName.trim()) {
        createNewSession();
        setIsCreatingNew(false);
        setNewChatName('');
      }
    } else if (e.key === 'Escape') {
      setIsCreatingNew(false);
      setNewChatName('');
    }
  };

  const handleEditCommand = (e: KeyboardEvent<HTMLInputElement>, sessionId: string) => {
    if (e.key === 'Enter') {
      if (editingName.trim()) {
        renameSession(sessionId, editingName.trim());
        setEditingId(null);
        setEditingName('');
      }
    } else if (e.key === 'Escape') {
      setEditingId(null);
      setEditingName('');
    }
  };

  const startEditing = (session: { id: string; name: string }) => {
    setEditingId(session.id);
    setEditingName(session.name);
  };

  const handleRename = (sessionId: string) => {
    if (editingName.trim()) {
      renameSession(sessionId, editingName.trim());
      setEditingId(null);
      setEditingName('');
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Chats</h2>
        <button
          onClick={() => {
            if (!hasMessages) {
              createNewSession();
            } else {
              setIsCreatingNew(true);
              setTimeout(() => newChatInputRef.current?.focus(), 0);
            }
          }}
          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          title="New Chat"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isCreatingNew && (
          <div className="flex items-center gap-2 p-2 bg-muted/50">
            <ChevronRight className="h-4 w-4 text-primary" />
            <input
              ref={newChatInputRef}
              type="text"
              value={newChatName}
              onChange={(e) => setNewChatName(e.target.value)}
              onKeyDown={handleCommand}
              placeholder="New Chat Name"
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
            <button
              onClick={() => {
                if (newChatName.trim()) {
                  createNewSession();
                  setIsCreatingNew(false);
                  setNewChatName('');
                }
              }}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setIsCreatingNew(false);
                setNewChatName('');
              }}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="space-y-1 p-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`group flex items-center gap-2 p-2 cursor-pointer transition-colors ${
                session.id === currentSessionId
                  ? 'bg-muted text-foreground'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
              onClick={() => loadSession(session.id)}
            >
              {editingId === session.id ? (
                <div className="flex-1 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-primary" />
                  <input
                    ref={editInputRef}
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => handleEditCommand(e, session.id)}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRename(session.id);
                    }}
                    className="p-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingId(null);
                      setEditingName('');
                    }}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate text-sm">{session.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(session.lastUpdated)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(session);
                      }}
                      className="p-1 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 