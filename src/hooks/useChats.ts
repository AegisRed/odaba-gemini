import { useState, useEffect } from 'react';
import { safeLocalStorage, now, uid } from '../utils';

const LS_CHATS = "odaba_chats_v1";

export interface Msg {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
}

export interface Chat {
  id: string;
  title: string;
  messages: Msg[];
  model: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
  createdAt: number;
  updatedAt: number;
}

const DEFAULT_MODEL = "gemini-2.5-flash";

const loadChats = (): Chat[] => {
  try { 
    const raw = safeLocalStorage.get(LS_CHATS); 
    return raw ? JSON.parse(raw) : []; 
  } catch { 
    return []; 
  }
};

const saveChats = (chats: Chat[]) => {
  safeLocalStorage.set(LS_CHATS, JSON.stringify(chats));
};

export const useChats = () => {
  const [chats, setChats] = useState<Chat[]>(loadChats);
  const [activeId, setActiveId] = useState<string>(() => chats[0]?.id || "");

  // Save chats to localStorage whenever they change
  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  const createNewChat = (baseChat?: Partial<Chat>) => {
    const id = uid();
    const newChat: Chat = {
      id,
      title: "New Chat",
      messages: [],
      model: baseChat?.model || DEFAULT_MODEL,
      temperature: baseChat?.temperature ?? 0.7,
      topP: baseChat?.topP ?? 0.9,
      maxOutputTokens: baseChat?.maxOutputTokens ?? 1024,
      createdAt: now(),
      updatedAt: now(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveId(id);
    return newChat;
  };

  const updateActiveChat = (patch: Partial<Chat>) => {
    if (!activeId) return;
    
    setChats(cs => cs.map(c => c.id === activeId ? { ...c, ...patch, updatedAt: now() } : c));
  };

  const deleteChat = (id: string) => {
    setChats(cs => {
      const next = cs.filter(c => c.id !== id);
      if (id === activeId && next[0]) setActiveId(next[0].id);
      return next;
    });
  };

  const addMessage = (chatId: string, message: Omit<Msg, 'id' | 'createdAt'>) => {
    const newMsg: Msg = {
      id: uid(),
      ...message,
      createdAt: now(),
    };
    
    setChats(cs => cs.map(c => c.id === chatId ? {
      ...c,
      messages: [...c.messages, newMsg],
      updatedAt: now()
    } : c));
    
    return newMsg;
  };

  const updateMessage = (chatId: string, messageId: string, content: string) => {
    setChats(cs => cs.map(c => c.id === chatId ? {
      ...c,
      messages: c.messages.map(m => m.id === messageId ? { ...m, content } : m),
      updatedAt: now()
    } : c));
  };

  const clearChat = (chatId: string) => {
    setChats(cs => cs.map(c => c.id === chatId ? {
      ...c,
      messages: [],
      updatedAt: now()
    } : c));
  };

  const activeChat = chats.find(c => c.id === activeId) || null;

  return {
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
    setChats,
  };
};
