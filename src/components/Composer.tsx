import React from 'react';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { Button, Textarea, Badge } from './ui';

interface ComposerProps {
  input: string;
  isSending: boolean;
  activeChat: any;
  deepAnalyze: boolean;
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onStopStream: () => void;
  onDeepAnalyzeToggle: (value: boolean) => void;
  onExportJSON: () => void;
  onClearChat: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  input,
  isSending,
  activeChat,
  deepAnalyze,
  onInputChange,
  onSendMessage,
  onStopStream,
  onDeepAnalyzeToggle,
  onExportJSON,
  onClearChat,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSending) onSendMessage();
    }
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-end gap-3">
          <Textarea
            rows={1}
            placeholder="Ask about construction, standards, calculations... (Shift+Enter — new line)"
            value={input}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            data-tour="composer"
            aria-label="Message input"
          />
          <div className="flex gap-2">
            {!isSending ? (
              <Button 
                variant="primary" 
                size="lg" 
                icon={<SendHorizontal className="size-4"/>} 
                onClick={onSendMessage} 
                data-tour="send-btn"
                aria-label="Send message"
              >
                Send
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="lg" 
                icon={<Loader2 className="size-4 animate-spin"/>} 
                onClick={onStopStream} 
                data-tour="send-btn"
                aria-label="Stop streaming"
              >
                Stop
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 text-xs text-zinc-500 gap-2">
          <div className="flex items-center gap-2">
            <Badge>Model: {activeChat?.model}</Badge>
            <Badge color="blue">Tokens: ≤ {activeChat?.maxOutputTokens}</Badge>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <label className="flex items-center gap-2" style={{margin:'8px 0 8px 24px'}}>
              <input 
                type="checkbox" 
                checked={deepAnalyze} 
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onDeepAnalyzeToggle(e.target.checked)}
                aria-label="Enable detailed analysis"
              />
              <span className="hidden sm:inline">Detailed analysis in response</span>
              <span className="sm:hidden">Analysis</span>
            </label>
            <button 
              className="hover:underline" 
              onClick={onExportJSON}
              aria-label="Export chat as JSON"
            >
              Export JSON
            </button>
            <span>•</span>
            <button 
              className="hover:underline" 
              onClick={onClearChat}
              aria-label="Clear chat history"
            >
              Clear chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
