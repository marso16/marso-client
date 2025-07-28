import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { toast } from "react-hot-toast";

export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}

const activeToasts = new Set();

const TOAST_DURATION = 4000;

export const safeToast = {
  success: (message, id = message) => {
    if (!activeToasts.has(id)) {
      activeToasts.add(id);
      toast.success(message, { id });
      setTimeout(() => activeToasts.delete(id), TOAST_DURATION);
    }
  },
  error: (message, id = message) => {
    if (!activeToasts.has(id)) {
      activeToasts.add(id);
      toast.error(message, { id });
      setTimeout(() => activeToasts.delete(id), TOAST_DURATION);
    }
  },

  loading: (message, id = message) => {
    if (!activeToasts.has(id)) {
      activeToasts.add(id);
      toast.loading(message, { id });
      setTimeout(() => activeToasts.delete(id), TOAST_DURATION);
    }
  },
  dismiss: (id) => {
    toast.dismiss(id);
    activeToasts.delete(id);
  },
};
