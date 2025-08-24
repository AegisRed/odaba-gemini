import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ApiError } from "@google/genai";
import {
  PencilLine,
  Save,
  X,
  KeyRound,
  LayoutTemplate,
  Loader2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Import components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Composer } from './components/Composer';
import { Toasts } from './components/Toasts';
import { TourOverlay } from './components/Tour';

// Import UI components
import { Button, IconButton, Input, Textarea, CopyButton, cn } from './components/ui';

// Import hooks
import { useToasts } from './hooks/useToasts';
import { useTour } from './hooks/useTour';
import { useGeminiClient, toGeminiContents } from './hooks/useGeminiClient';
import { useChats } from './hooks/useChats';

// Import utilities
import { now, uid, fmtTime, retryWithBackoff, safeLocalStorage, validateInput } from './utils';

/**
 * ODABA Gemini Chat — Single-file React app
 * -------------------------------------------------
 * ✔ Modern GPT-like UI for demo purposes
 * ✔ Ready for Gemini API — just paste API key (or use VITE_GEMINI_API_KEY)
 * ✔ Local chat storage (rename, delete, multi-chat), toasts, command bar, keyboard shortcuts
 * ✔ System prompt for academic persona, model/temperature controls, streaming output
 * ✔ Export chat to Markdown/JSON
 * ✔ Dark/Light theme, subtle animations, responsive layout
 *
 * Build notes:
 * - Requires: React 18, TailwindCSS, lucide-react, framer-motion, @google/genai
 * - Optional: put your key into localStorage via in-app dialog, or .env as VITE_GEMINI_API_KEY
 */

// -------------------------------
// Constants
// -------------------------------
const DEFAULT_SYSTEM_PROMPT = `You are an academic assistant. Help students and teachers:
- Explain concisely and clearly, but friendly;
- Write formulas in KaTeX/LaTeX blocks, keep it short;
- Suggest sources and standards if needed;
- Avoid hallucinations: if unsure, say so and suggest where to verify.`;

const LS_THEME = "odaba_theme";
const LS_SYS = "odaba_system_prompt";

// -------------------------------
// Main App
// -------------------------------
export default function App() {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  
  // Theme
  const [theme, setTheme] = useState<string>(() => safeLocalStorage.get(LS_THEME) || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  useEffect(() => { 
    document.documentElement.classList.toggle('dark', theme === 'dark'); 
    safeLocalStorage.set(LS_THEME, theme); 
  }, [theme]);

  // Hooks
  const { toasts, push, remove } = useToasts();
  const { 
    chats, 
    activeChat, 
    activeId, 
    setActiveId, 
    createNewChat, 
    updateActiveChat, 
    deleteChat, 
    addMessage, 
    updateMessage, 
    clearChat,
    setChats 
  } = useChats();
  
  const { client, apiKey } = useGeminiClient();
  const { tourOpen, tourIdx, tourSteps, startTour, closeTour, nextStep } = useTour(apiKey);

  // State
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>("");
  const [systemPrompt, setSystemPrompt] = useState<string>(() => safeLocalStorage.get(LS_SYS) || DEFAULT_SYSTEM_PROMPT);
  const [deepAnalyze, setDeepAnalyze] = useState(false);
  const [input, setInput] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [abortRequested, setAbortRequested] = useState<boolean>(false);
  const [q, setQ] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [renameChatId, setRenameChatId] = useState("");
  const [renameChatTitle, setRenameChatTitle] = useState("");
  const [tempSystemPrompt, setTempSystemPrompt] = useState("");
  const [titleGenerationInProgress, setTitleGenerationInProgress] = useState<Set<string>>(new Set());
  const [deleteConfirmations, setDeleteConfirmations] = useState<Set<string>>(new Set());

  // Ensure at least one chat
  useEffect(() => {
    if (!chats.length) {
      createNewChat();
      setShowKeyModal(!apiKey);
    } else if (!apiKey) {
      setShowKeyModal(true);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [activeChat?.messages.length, isSending]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const el = document.getElementById('model-dd');
        el?.focus();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        onNewChat();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        exportMarkdown();
      }
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setShowRenameModal(false);
        setShowSystemModal(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chats, activeId]);

  // Actions
  const onNewChat = () => {
    createNewChat(activeChat || undefined);
    push({type:'success', title:'New chat created'});
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const openRenameModal = (id: string, currentTitle: string) => {
    setRenameChatId(id);
    setRenameChatTitle(currentTitle);
    setShowRenameModal(true);
  };

  const confirmRename = () => {
    if (!renameChatTitle.trim()) return;
    setChats(cs => cs.map(c => c.id===renameChatId ? {...c, title: renameChatTitle.trim(), updatedAt: now()} : c));
    setShowRenameModal(false);
    setRenameChatId("");
    setRenameChatTitle("");
    push({type:'success', title:'Chat renamed'});
  };

  const openSystemModal = () => {
    setTempSystemPrompt(systemPrompt);
    setShowSystemModal(true);
  };

  const confirmSystemPrompt = () => {
    if (tempSystemPrompt.trim()) {
      setSystemPrompt(tempSystemPrompt.trim());
    }
    setShowSystemModal(false);
    setTempSystemPrompt("");
  };

  const handleDeleteClick = (chatId: string) => {
    if (deleteConfirmations.has(chatId)) {
      // Second click - actually delete the chat
      deleteChat(chatId);
      setDeleteConfirmations(prev => {
        const newSet = new Set(prev);
        newSet.delete(chatId);
        return newSet;
      });
      push({type:'info', title:'Chat deleted'});
    } else {
      // First click - show confirmation state
      setDeleteConfirmations(prev => new Set(prev).add(chatId));
      setTimeout(() => {
        setDeleteConfirmations(prev => {
          const newSet = new Set(prev);
          newSet.delete(chatId);
          return newSet;
        });
      }, 5000);
    }
  };

  const exportJSON = () => {
    if (!activeChat) return;
    const data = JSON.stringify(activeChat, null, 2);
    downloadFile(`demo-chat-${activeChat.id}.json`, data, 'application/json');
  };

  const exportMarkdown = () => {
    if (!activeChat) return;
    const md = `# ${activeChat.title}\n\n` + activeChat.messages.map(m=>`**${m.role==='user'?'User':'Assistant'}** (${fmtTime(m.createdAt)}):\n\n${m.content}\n`).join("\n\n---\n\n");
    downloadFile(`demo-chat-${activeChat.id}.md`, md, 'text/markdown');
  };

  const downloadFile = (name:string, content:string, type:string) => {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = name; a.click();
    URL.revokeObjectURL(url);
  };

  const sendMessage = async () => {
    if (!client) { 
      push({type:'error', title:'No API key', desc:'Click the key button above and paste your Gemini API key'}); 
      setShowKeyModal(true); 
      return; 
    }
    if (!activeChat) return;
    
    const text = input.trim();
    if (!text) return;

    // Validate input length
    if (!validateInput.maxLength(text, 4000)) {
      push({type:'error', title:'Input too long', desc:'Please keep your message under 4000 characters'});
      return;
    }

    setIsSending(true);
    setAbortRequested(false);

    // Add user message
    const userMsg = addMessage(activeChat.id, { role: 'user', content: text });
    setInput("");

    // Variables for tracking message creation
    let asstId = "";
    let messageCreated = false;

    try {
      const contents = toGeminiContents(activeChat.messages.concat(userMsg), "");
      contents.pop(); // Remove duplicated empty message
      contents.push({ role: 'user', parts: [{ text }] });

      const outCap = Math.max(128, Math.min(8192, Math.floor(activeChat.maxOutputTokens)));
      const systemPromptToUse = deepAnalyze ? 
        "You are a technical analyst. Always answer briefly, to the point, and reproducibly." : 
        systemPrompt;

      const stream = await retryWithBackoff(() => 
        client.models.generateContentStream({
          model: activeChat.model,
          contents,
          config: {
            systemInstruction: systemPromptToUse,
            temperature: activeChat.temperature,
            topP: activeChat.topP,
            maxOutputTokens: outCap,
          },
        })
      );

      // Create assistant message only after we start receiving content
      let full = "";

      for await (const chunk of stream as any) {
        if (abortRequested) break;
        const delta: string = (chunk?.text as string) || "";
        if (!delta) continue;
        
        full += delta;
        
        // Create assistant message only on first chunk
        if (!messageCreated) {
          asstId = uid();
          addMessage(activeChat.id, { role: 'assistant', content: full });
          messageCreated = true;
        } else {
          // Update existing message
          updateMessage(activeChat.id, asstId, full);
        }
      }

      // Generate title if needed
      if (messageCreated && (activeChat.title === "New Chat" || activeChat.title === "Новый чат")) {
        const updatedChat = chats.find(c => c.id === activeChat.id);
        if (updatedChat && updatedChat.messages.length === 2) {
          if (titleGenerationInProgress.has(activeChat.id)) {
            return;
          }
          
          setTitleGenerationInProgress(prev => new Set(prev).add(activeChat.id));
          
          setTimeout(async () => {
            try {
              const titlePrompt = `You are a title generator. Create a short, descriptive title for a chat conversation.

User's first message: "${text}"

Requirements:
- Maximum 50 characters
- Must be in English
- Must be descriptive and specific to the topic
- Must NOT be "New Chat" or similar generic text
- Should capture the main subject or question

Examples:
- For "How to calculate insulation thickness?" → "Insulation Thickness Calculation"
- For "What are fire safety standards?" → "Fire Safety Standards"
- For "Compare facade types" → "Facade Types Comparison"

Generate ONLY the title, nothing else:`;
              
              const titleResponse = await client.models.generateContent({
                model: activeChat.model,
                contents: [{ role: "user", parts: [{ text: titlePrompt }] }],
                config: { 
                  temperature: 0.7, 
                  maxOutputTokens: 50 
                }
              });
              
              const generatedTitle = titleResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "New Chat";
              const cleanTitle = generatedTitle.replace(/^["']|["']$/g, '').replace(/\n/g, ' ').substring(0, 50);
              
              if (cleanTitle && cleanTitle !== "New Chat" && cleanTitle.length > 3) {
                updateActiveChat({ title: cleanTitle });
              }
            } catch (err) {
              console.log('Failed to generate title:', err);
            } finally {
              setTitleGenerationInProgress(prev => {
                const newSet = new Set(prev);
                newSet.delete(activeChat.id);
                return newSet;
              });
            }
          }, 100);
        }
      }
    } catch (err: any) {
      console.error(err);
      let message = 'Unknown error occurred';
      
      if (err instanceof ApiError) {
        if (err.status === 400) {
          message = 'Invalid request - check your input';
        } else if (err.status === 401) {
          message = 'Invalid API key - please check your key';
        } else if (err.status === 429) {
          message = 'Rate limit exceeded - try again later';
        } else if (err.status >= 500) {
          message = 'Server error - try again later';
        } else {
          message = err.message || `Error ${err.status}`;
        }
      } else if (err?.message) {
        if (err.message.includes('fetch')) {
          message = 'Network error - check your internet connection';
        } else if (err.message.includes('timeout')) {
          message = 'Request timeout - try again';
        } else {
          message = err.message;
        }
      }
      
      // Create error message only if we haven't created a message yet
      if (!messageCreated) {
        addMessage(activeChat.id, { role: 'assistant', content: `⚠️ Request failed: ${message}` });
      } else {
        // Update existing message with error
        updateMessage(activeChat.id, asstId, `⚠️ Request failed: ${message}`);
      }
      
      push({type:'error', title:'Request failed', desc: message});
    } finally {
      setIsSending(false);
    }
  };

  const stopStream = () => {
    setAbortRequested(true);
  };

  const updateActive = (patch: Partial<any>) => {
    if (!activeChat) return;
    updateActiveChat(patch);
  };

  // UI bits
  const header = (
    <Header
      theme={theme}
      activeChat={activeChat}
      onThemeToggle={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
      onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
      onSystemModalOpen={openSystemModal}
      onKeyModalOpen={() => setShowKeyModal(true)}
      onTourStart={startTour}
      onModelChange={(model) => updateActive({ model })}
      onTemperatureChange={(temp) => updateActive({ temperature: temp })}
      onMaxOutputTokensChange={(tokens) => updateActive({ maxOutputTokens: tokens })}
    />
  );

  return (
    <div className="h-screen w-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100
                    grid grid-cols-[300px,1fr] md:grid-cols-[340px,1fr] lg:grid-cols-[380px,1fr]
                    min-h-0 overflow-hidden">
      {/* Watermark */}
      <div style={{
        position: 'fixed',
        right: 16,
        bottom: 12,
        pointerEvents: 'none',
        opacity: 0.25,
        color: '#0f0',
        fontSize: 16,
        fontWeight: 600,
        zIndex: 9999,
        textShadow: '0 1px 4px #0008',
        userSelect: 'none',
      }}>
        Demo version • For testing only
      </div>
      
      {/* Sidebar */}
      <Sidebar
        chats={chats}
        activeId={activeId}
        q={q}
        sidebarOpen={sidebarOpen}
        deleteConfirmations={deleteConfirmations}
        onNewChat={onNewChat}
        onActiveIdChange={setActiveId}
        onSidebarClose={() => setSidebarOpen(false)}
        onSearchChange={setQ}
        onRenameChat={openRenameModal}
        onDeleteChat={handleDeleteClick}
        onExportMarkdown={exportMarkdown}
        onImportChat={() => {
          const el = document.createElement('input');
          el.type = 'file';
          el.accept = 'application/json';
          el.onchange = async () => {
            const file = el.files?.[0];
            if (!file) return;
            const text = await file.text();
            try {
              const parsed = JSON.parse(text);
              setChats(cs => [parsed, ...cs]);
              setActiveId(parsed.id);
              push({type:'success', title:'Chat imported'});
            } catch {
              push({type:'error', title:'Failed to import JSON'});
            }
          };
          el.click();
        }}
      />

      {/* Main */}
      <main className="flex flex-col min-w-0 min-h-0">
        {header}
        
        {/* Conversation */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 md:px-6 py-6 space-y-6">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="max-w-3xl mx-auto text-center mt-24">
              <motion.h1 initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="text-3xl font-bold mb-2">Hello!</motion.h1>
              <p className="text-zinc-500">Ask a question about construction, architecture, materials, standards, or organizational/technological solutions — I will help quickly and concisely.</p>
              <div className="mt-6 grid sm:grid-cols-2 gap-3 max-w-xl mx-auto">
                {[
                  "Calculate insulation thickness for a wall (demo)",
                  "Compare wet facade and ventilated facade by cost and timing",
                  "What are the fire resistance standards for stairwells?",
                  "How to format a bibliography according to a standard?",
                ].map((s, i) => (
                  <button key={i} onClick={() => setInput(s)} className="text-left p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900">
                    <div className="text-sm">{s}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {activeChat.messages.map(m => (
                <div key={m.id} className={cn("flex gap-3 group", m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role !== "user" && <div className="size-8 rounded-lg bg-emerald-600 text-white grid place-items-center text-sm shrink-0">O</div>}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-3 max-w-full leading-relaxed prose prose-sm dark:prose-invert break-words relative",
                      m.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-sm prose-invert'
                        : 'bg-zinc-100 dark:bg-zinc-900'
                    )}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                    <CopyButton text={m.content} className="absolute top-2 right-2" />
                  </div>
                  {m.role === 'user' && <div className="size-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 grid place-items-center text-xs shrink-0">U</div>}
                </div>
              ))}
              
              {/* Typing indicator */}
              {isSending && !activeChat.messages.some(m => m.role === 'assistant' && m.content === activeChat.messages[activeChat.messages.length - 1]?.content) && (
                <div className="flex gap-3 justify-start">
                  <div className="size-8 rounded-lg bg-emerald-600 text-white grid place-items-center text-sm shrink-0">O</div>
                  <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                      <Loader2 className="size-4 animate-spin" />
                      <span className="text-sm">Assistant is typing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Composer */}
        <Composer
          input={input}
          isSending={isSending}
          activeChat={activeChat}
          deepAnalyze={deepAnalyze}
          onInputChange={setInput}
          onSendMessage={sendMessage}
          onStopStream={stopStream}
          onDeepAnalyzeToggle={setDeepAnalyze}
          onExportJSON={exportJSON}
          onClearChat={() => activeChat && clearChat(activeChat.id)}
        />
      </main>

      {/* Toasts */}
      <Toasts toasts={toasts} onRemove={remove} />

      {/* API Key modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center z-50">
            <motion.div initial={{scale:.95, opacity:0, y:10}} animate={{scale:1, opacity:1, y:0}} exit={{scale:.95, opacity:0, y:10}}
              className="w-[92vw] max-w-lg rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white"><KeyRound className="size-5"/></div>
                <div className="flex-1">
                  <div className="font-semibold">Paste your Gemini API key</div>
                  <div className="text-sm text-zinc-500">Service: <a className="underline" href="https://aistudio.google.com/" target="_blank" rel="noreferrer">Google AI Studio</a>. Stored locally in your browser.</div>
                </div>
                <IconButton onClick={() => setShowKeyModal(false)}><X className="size-5"/></IconButton>
              </div>
              <div className="mt-4">
                <Input placeholder="AI Studio API Key (e.g., AIza...)" value={tempKey} onChange={e => setTempKey(e.target.value)} />
                <div className="text-xs text-zinc-500 mt-2">Alternative: put the key in .env as <code>VITE_GEMINI_API_KEY</code>.</div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowKeyModal(false)}>Cancel</Button>
                <Button variant="primary" icon={<Save className="size-4"/>} onClick={() => {
                  if (!tempKey.startsWith('AI')) { push({type:'info', title:'Check key format'}); }
                  safeLocalStorage.set("odaba_gemini_key", tempKey.trim());
                  setTempKey("");
                  setShowKeyModal(false);
                  push({type:'success', title:'Key saved'});
                  setTimeout(() => window.location.reload(), 400);
                }}>Save</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rename Chat Modal */}
      <AnimatePresence>
        {showRenameModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center z-50">
            <motion.div initial={{scale:.95, opacity:0, y:10}} animate={{scale:1, opacity:1, y:0}} exit={{scale:.95, opacity:0, y:10}}
              className="w-[92vw] max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white"><PencilLine className="size-5"/></div>
                <div className="flex-1">
                  <div className="font-semibold">Rename Chat</div>
                  <div className="text-sm text-zinc-500">Give your chat a descriptive name</div>
                </div>
                <IconButton onClick={() => setShowRenameModal(false)}><X className="size-5"/></IconButton>
              </div>
              <div className="mt-4">
                <Input 
                  placeholder="Chat title" 
                  value={renameChatTitle} 
                  onChange={e => setRenameChatTitle(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') confirmRename();
                    if (e.key === 'Escape') setShowRenameModal(false);
                  }}
                  autoFocus
                />
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowRenameModal(false)}>Cancel</Button>
                <Button variant="primary" icon={<Save className="size-4"/>} onClick={confirmRename}>Save</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* System Prompt Modal */}
      <AnimatePresence>
        {showSystemModal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm grid place-items-center z-50">
            <motion.div initial={{scale:.95, opacity:0, y:10}} animate={{scale:1, opacity:1, y:0}} exit={{scale:.95, opacity:0, y:10}}
              className="w-[92vw] max-w-2xl rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-600 text-white"><LayoutTemplate className="size-5"/></div>
                <div className="flex-1">
                  <div className="font-semibold">System Instructions</div>
                  <div className="text-sm text-zinc-500">Customize how the AI assistant behaves and responds</div>
                </div>
                <IconButton onClick={() => setShowSystemModal(false)}><X className="size-5"/></IconButton>
              </div>
              <div className="mt-4">
                <Textarea 
                  placeholder="Enter system instructions..." 
                  value={tempSystemPrompt} 
                  onChange={e => setTempSystemPrompt(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
                <div className="text-xs text-zinc-500 mt-2">
                  These instructions will be sent to the AI model before each conversation to define its behavior and role.
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setShowSystemModal(false)}>Cancel</Button>
                <Button variant="primary" icon={<Save className="size-4"/>} onClick={confirmSystemPrompt}>Save</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Deep Analysis Panel */}
      {deepAnalyze && (
        <aside className="fixed right-0 top-20 w-[380px] max-w-[98vw] bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-5 z-50 max-h-[90vh] overflow-auto">
          <form onSubmit={(e) => {
            e.preventDefault();
            
            // Analysis logic here...
            push({type:'info', title:'Analysis started', desc:'Processing your request...'});
          }} style={{display:'grid', gap:8}}>
            <input name="q" placeholder="What to analyze?" required className="p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent" />
            <input name="site" placeholder="site:example.edu (optional)" className="p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent" />
            <textarea name="urls" placeholder="Source URLs (one per line)" className="p-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-transparent min-h-[60px]" />
            <label className="flex items-center gap-2"><input type="checkbox" name="buildCharts" defaultChecked /> Build table/charts</label>
            <button type="submit" className="p-2 rounded-md bg-emerald-600 text-white border-none">Search & Analyze</button>
          </form>
        </aside>
      )}

      {/* Guided Tour Overlay */}
      {tourOpen && (
        <TourOverlay
          steps={tourSteps}
          index={tourIdx}
          onIndex={nextStep}
          onClose={closeTour}
        />
      )}
    </div>
  );
}
