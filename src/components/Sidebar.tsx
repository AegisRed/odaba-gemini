import React from 'react';
import { Plus, PencilLine, Trash2, Check, Search, Download, Import, Sparkles } from 'lucide-react';
import { Button, IconButton, Input, cn } from './ui';

interface SidebarProps {
  chats: any[];
  activeId: string;
  q: string;
  sidebarOpen: boolean;
  deleteConfirmations: Set<string>;
  onNewChat: () => void;
  onActiveIdChange: (id: string) => void;
  onSidebarClose: () => void;
  onSearchChange: (value: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onDeleteChat: (id: string) => void;
  onExportMarkdown: () => void;
  onImportChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeId,
  q,
  sidebarOpen,
  deleteConfirmations,
  onNewChat,
  onActiveIdChange,
  onSidebarClose,
  onSearchChange,
  onRenameChat,
  onDeleteChat,
  onExportMarkdown,
  onImportChat,
}) => {
  const filtered = chats.filter(c => c.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onSidebarClose} />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "border-r border-zinc-200 dark:border-zinc-800 flex flex-col min-w-0 min-h-0 bg-white dark:bg-zinc-950 z-50",
        "fixed md:relative inset-y-0 left-0 w-[300px] transform transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-16 px-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-emerald-600"/>
            <div className="flex flex-col">
              <div className="font-semibold">Chats</div>
              <div className="text-xs text-zinc-500">Titles auto-generated • Click delete twice to confirm</div>
            </div>
          </div>
          <Button variant="primary" size="sm" icon={<Plus className="size-4"/>} onClick={onNewChat} data-tour="new-chat">New</Button>
        </div>
        <div className="px-3 pb-2">
          <div className="relative">
            <Input placeholder="Search chats" value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)} className="pl-9"/>
            <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400"/>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-2 space-y-1 pb-2">
          {filtered.map(c => (
            <div key={c.id} 
              className={cn("w-full text-left px-3 py-2 rounded-xl border transition grid grid-cols-[1fr,auto] items-center cursor-pointer",
                c.id===activeId ? "border-emerald-400/60 bg-emerald-50 dark:bg-emerald-900/20" : "border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900")}
              onClick={()=>{
                onActiveIdChange(c.id);
                onSidebarClose();
              }}
            >
              <div className="min-w-0">
                <div className="truncate font-medium text-decoration-none">{c.title}</div>
                <div className="text-xs text-zinc-500 truncate">{c.messages[c.messages.length-1]?.content || "Empty"}</div>
              </div>
              <div className="flex items-center gap-1">
                <IconButton onClick={(e: React.MouseEvent) => {e.stopPropagation(); onRenameChat(c.id, c.title);}}><PencilLine className="size-4"/></IconButton>
                <IconButton 
                  onClick={(e: React.MouseEvent) => {e.stopPropagation(); onDeleteChat(c.id);}}
                  className={cn(
                    "transition-all duration-200 text-decoration-none",
                    deleteConfirmations.has(c.id) 
                      ? "bg-red-500 hover:bg-red-600 text-white" 
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  )}
                >
                  {deleteConfirmations.has(c.id) ? (
                    <Check className="size-4" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                </IconButton>
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <Button variant="ghost" size="sm" icon={<Download className="size-4"/>} onClick={onExportMarkdown}>Export MD</Button>
          <Button variant="ghost" size="sm" icon={<Import className="size-4"/>} onClick={onImportChat}>Import</Button>
        </div>
      </aside>
    </>
  );
};
