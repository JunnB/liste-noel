"use client";

import { useState, useEffect } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
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
  }[type];

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg ${bgColor} shadow-lg animate-slide-in`}
      role="alert"
    >
      {message}
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "info") => {
    setToast({ message, type });
  };

  return {
    toast,
    showToast,
    closeToast: () => setToast(null),
  };
}
