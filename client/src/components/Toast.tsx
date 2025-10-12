import { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    info: <AlertCircle className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    info: "bg-blue-50 border-blue-200",
  };

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800",
  };

  return (
    <div
      className={`fixed top-24 right-6 z-50 transition-all duration-500
      ${
        isVisible
          ? "opacity-100 translate-x-0 scale-100"
          : "opacity-0 translate-x-4 scale-95"
      }`}
      style={{ transitionProperty: "opacity, transform" }}
    >
      <div
        className={`flex items-center space-x-3 px-4 py-3 border ${bgColors[type]} shadow-2xl min-w-80`}
      >
        {icons[type]}
        <p className={`flex-1 font-medium ${textColors[type]}`}>{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="hover:bg-black hover:bg-opacity-5 p-1 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleShowToast = (
      event: CustomEvent<{ message: string; type: ToastType }>
    ) => {
      const newToast = {
        id: Date.now(),
        message: event.detail.message,
        type: event.detail.type,
      };
      setToasts((prev) => [...prev, newToast]);
    };

    window.addEventListener("showToast" as any, handleShowToast);
    return () =>
      window.removeEventListener("showToast" as any, handleShowToast);
  }, []);

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${6 + index * 5}rem` }}
          className="fixed right-6 z-50"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  );
}

export function showToast(message: string, type: ToastType = "info") {
  const event = new CustomEvent("showToast", { detail: { message, type } });
  window.dispatchEvent(event);
}
