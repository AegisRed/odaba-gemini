import React from 'react';
import { Menu, LayoutTemplate, Sparkles, KeyRound, SunMedium, Moon } from 'lucide-react';
import { Button, IconButton, Badge, Slider } from './ui';

interface HeaderProps {
  theme: string;
  activeChat: any;
  onThemeToggle: () => void;
  onSidebarToggle: () => void;
  onSystemModalOpen: () => void;
  onKeyModalOpen: () => void;
  onTourStart: () => void;
  onModelChange: (model: string) => void;
  onTemperatureChange: (temp: number) => void;
  onMaxOutputTokensChange: (tokens: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  activeChat,
  onThemeToggle,
  onSidebarToggle,
  onSystemModalOpen,
  onKeyModalOpen,
  onTourStart,
  onModelChange,
  onTemperatureChange,
  onMaxOutputTokensChange,
}) => {
  const MODEL_OPTIONS = [
    { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
    { id: "gemini-2.0-flash-001", label: "Gemini 2.0 Flash" },
    { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
  ];

  const MODEL_MAX_OUT: Record<string, number> = {
    "gemini-2.5-flash": 8192,
    "gemini-2.0-flash-001": 8192,
    "gemini-1.5-pro": 8192,
  };

  const clampOut = (model: string, v: number) => {
    const cap = MODEL_MAX_OUT[model] ?? 8192;
    return Math.max(128, Math.min(cap, Math.floor(v)));
  };

  return (
    <div className="h-16 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded-xl bg-emerald-600 text-white grid place-items-center font-bold shadow-sm">O</div>
        <div>
          <div className="font-semibold leading-tight">Demo Gemini Chat</div>
          <div className="text-xs text-zinc-500">beta</div>
        </div>
        <Badge color="zinc">beta</Badge>
      </div>
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <Button variant="ghost" size="sm" icon={<Menu className="size-4"/>} onClick={onSidebarToggle} className="md:hidden">Menu</Button>
        
        <div className="hidden md:flex items-center gap-2">
          <select 
            id="model-dd" 
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 text-sm"
            value={activeChat?.model || "gemini-2.5-flash"} 
            onChange={e=>{
              const model = e.target.value;
              const nextOut = clampOut(model, activeChat?.maxOutputTokens ?? 1024);
              onModelChange(model);
              onMaxOutputTokensChange(nextOut);
            }}
          >
            {MODEL_OPTIONS.map(m=> <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
          
          <div className="w-56 hidden lg:block" data-tour="temperature">
            <div className="text-[10px] uppercase tracking-wide text-zinc-500 mb-1">
              Temperature: {activeChat?.temperature.toFixed(2)}
            </div>
            <Slider 
              value={activeChat?.temperature ?? 0.7} 
              onChange={onTemperatureChange} 
              min={0} 
              max={1} 
              step={0.05}
            />
          </div>
          
          <div className="w-64 hidden lg:block" data-tour="output">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] uppercase tracking-wide text-zinc-500">
                Output: ≤ {activeChat?.maxOutputTokens}
              </div>
            </div>
            <input
              type="range"
              min={128}
              max={MODEL_MAX_OUT[activeChat?.model || "gemini-2.5-flash"] ?? 8192}
              step={64}
              value={activeChat?.maxOutputTokens ?? 1024}
              onChange={(e)=>{
                const v = Number(e.target.value);
                onMaxOutputTokensChange(clampOut(activeChat?.model || "gemini-2.5-flash", v));
              }}
              className="w-full accent-emerald-600"
            />
          </div>
          
          <Button variant="soft" size="sm" icon={<LayoutTemplate className="size-4"/>} onClick={onSystemModalOpen} data-tour="system-btn">System</Button>
          <Button variant="soft" size="sm" icon={<Sparkles className="size-4" />} onClick={onTourStart}>
            Guide
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" icon={<KeyRound className="size-4"/>} onClick={onKeyModalOpen} data-tour="key-btn">Key</Button>
        <IconButton onClick={onThemeToggle} aria-label="toggle theme" data-tour="theme-toggle">
          {theme==='dark' ? <SunMedium className="size-5"/> : <Moon className="size-5"/>}
        </IconButton>
      </div>
    </div>
  );
};
