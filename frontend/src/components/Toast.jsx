import { createContext, useCallback, useContext } from "react";
import { useNotification } from "./NotificationCenter";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const notification = useNotification();

  const show = useCallback(
    (message, variant = "success", detail = null) => {
      notification.notify({
        type: variant === "error" ? "error" : "success",
        title: variant === "error" ? "Operation Failed" : "Success",
        message,
        detail,
      });
    },
    [notification]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if rendered outside ToastProvider
    return {
      show: (msg) => console.log(msg),
    };
  }
  return ctx;
}
