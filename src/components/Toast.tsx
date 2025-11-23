"use client";

import { useState, useEffect } from "react";
import { useToastListener } from "@/lib/utils/toaster";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const bgColor = {
    success: "bg-noel-olive text-white",
    error: "bg-noel-pink text-white",
    info: "bg-noel-red text-white",
    warning: "bg-yellow-500 text-white",
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg ${bgColor} shadow-lg animate-slide-in z-50`}
      role="alert"
    >
      {message}
    </div>
  );
}

/**
 * Composant Toast global qui écoute les événements toast
 * À placer dans le layout principal
 */
export function ToastContainer() {
  const [toasts, setToasts] = useState<Array<ToastProps & { id: number }>>([]);

  useEffect(() => {
    return useToastListener((options) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { ...options, id }]);
    });
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "info") => {
    setToast({ message, type });
  };

  return {
    toast,
    showToast,
    closeToast: () => setToast(null),
  };
}
