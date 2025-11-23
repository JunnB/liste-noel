/**
 * Utilitaire pour afficher des notifications toast
 * Wrapper autour du composant Toast pour une utilisation simplifiée
 */

type ToastType = "success" | "error" | "info" | "warning";

interface ToastOptions {
  message: string;
  type: ToastType;
  duration?: number;
}

// Event personnalisé pour les toasts
const TOAST_EVENT = "app:toast";

/**
 * Affiche un toast
 */
function showToast(options: ToastOptions) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent(TOAST_EVENT, { detail: options });
    window.dispatchEvent(event);
  }
}

/**
 * Affiche un toast de succès
 */
export function success(message: string, duration?: number) {
  showToast({ message, type: "success", duration });
}

/**
 * Affiche un toast d'erreur
 */
export function error(message: string, duration?: number) {
  showToast({ message, type: "error", duration });
}

/**
 * Affiche un toast d'information
 */
export function info(message: string, duration?: number) {
  showToast({ message, type: "info", duration });
}

/**
 * Affiche un toast d'avertissement
 */
export function warning(message: string, duration?: number) {
  showToast({ message, type: "warning", duration });
}

/**
 * Export par défaut avec toutes les fonctions
 */
const toast = {
  success,
  error,
  info,
  warning,
};

export default toast;

/**
 * Hook pour écouter les événements toast (à utiliser dans le composant Toast)
 */
export function useToastListener(callback: (options: ToastOptions) => void) {
  if (typeof window !== "undefined") {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<ToastOptions>;
      callback(customEvent.detail);
    };

    window.addEventListener(TOAST_EVENT, handler);

    return () => {
      window.removeEventListener(TOAST_EVENT, handler);
    };
  }

  return () => {};
}


