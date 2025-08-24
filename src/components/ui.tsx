import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

// Utility function for class names
export const cn = (...cls: Array<string | false | null | undefined>) => cls.filter(Boolean).join(" ");

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & {variant?: "primary"|"ghost"|"outline"|"soft"; size?: "sm"|"md"|"lg"; icon?: React.ReactNode}> = ({
  className,
  children,
  variant = "primary",
  size = "md",
  icon,
  ...props
}) => (
  <button
    className={cn(
      "inline-flex items-center gap-2 rounded-2xl font-medium transition active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed",
      variant === "primary" && "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
      variant === "soft" && "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-200 dark:hover:bg-emerald-900/50",
      variant === "ghost" && "hover:bg-zinc-100 dark:hover:bg-zinc-900",
      variant === "outline" && "border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900",
      size === "sm" && "px-3 py-1.5 text-sm",
      size === "md" && "px-4 py-2",
      size === "lg" && "px-5 py-3 text-base",
      className
    )}
    {...props}
  >
    {icon}
    {children}
  </button>
);

export const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({className, children, ...props}) => (
  <button className={cn("p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition", className)} {...props}>{children}</button>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({className, ...props}) => (
  <input className={cn("w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/50", className)} {...props} />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({className, ...props}) => (
  <textarea className={cn("w-full rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/50 resize-none", className)} {...props} />
);

export const Slider: React.FC<{value:number; onChange:(v:number)=>void; min?:number; max?:number; step?:number}> = ({value,onChange,min=0,max=1,step=0.1}) => (
  <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(parseFloat(e.target.value))}
         className="w-full accent-emerald-600"/>
);

export const Badge: React.FC<{children: React.ReactNode; color?: "green"|"zinc"|"blue"}> = ({children, color="green"}) => (
  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
    color==="green" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200",
    color==="zinc" && "bg-zinc-100 text-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-300",
    color==="blue" && "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
  )}>{children}</span>
);

// Copy button component
export const CopyButton: React.FC<{text: string; className?: string}> = ({text, className}) => {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <IconButton 
      onClick={copyToClipboard}
      className={cn("opacity-0 group-hover:opacity-100 transition-opacity", className)}
      title="Copy message"
    >
      {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
    </IconButton>
  );
};
