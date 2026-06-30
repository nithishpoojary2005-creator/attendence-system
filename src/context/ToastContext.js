import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import {
  X,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Remove a toast
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Add a new toast
  const addToast = useCallback(
    (message, type = "success", duration = 3000) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now().toString() + Math.random().toString(36).substring(2, 11);

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          duration,
        },
      ]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    warning: <AlertTriangle className="text-amber-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <Info className="text-sky-500" size={20} />,
  };

  const bgColors = {
    success:
      "bg-white border-emerald-100 text-slate-800 dark:bg-slate-900 dark:border-emerald-900 dark:text-slate-100 shadow-lg",

    warning:
      "bg-white border-amber-100 text-slate-800 dark:bg-slate-900 dark:border-amber-900 dark:text-slate-100 shadow-lg",

    error:
      "bg-white border-rose-100 text-slate-800 dark:bg-slate-900 dark:border-rose-900 dark:text-slate-100 shadow-lg",

    info:
      "bg-white border-sky-100 text-slate-800 dark:bg-slate-900 dark:border-sky-900 dark:text-slate-100 shadow-lg",
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg transition-all duration-300 animate-slide-up ${bgColors[toast.type]}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {icons[toast.type]}
            </div>

            <div className="flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Close notification"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};