import { useState } from 'react';
import type { Toast } from '../components/Toasts';

export const useToasts = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  
  const remove = (id: string) => setToasts(t => t.filter(x => x.id !== id));
  
  const push = (t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(cur => [...cur, { id, ...t }]);
    setTimeout(() => remove(id), 3500);
  };
  
  return { toasts, push, remove };
};
