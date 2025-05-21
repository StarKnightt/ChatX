import { Trash2, Sparkles } from 'lucide-react';
import clsx from 'clsx';

interface ChatHeaderProps {
  onClear: () => void;
}

export function ChatHeader({ onClear }: ChatHeaderProps) {
  return (
    <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white/80 p-4 backdrop-blur-sm dark:border-gray-700 dark:bg-gray-800/80">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">ChatX</span>
          <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 px-3 py-1 text-xs font-medium text-blue-600 dark:from-blue-500/20 dark:to-purple-500/20 dark:text-blue-400">
            <Sparkles className="h-3 w-3" />
            <span>Gemini AI</span>
          </div>
        </div>
      </div>
      
      <button
        onClick={onClear}
        className={clsx(
          "group rounded-lg p-2 text-gray-500 transition-colors",
          "hover:bg-gray-100 hover:text-gray-900",
          "dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        )}
        title="Clear chat"
      >
        <Trash2 className="h-5 w-5" />
      </button>
    </div>
  );
} 