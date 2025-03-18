import * as React from "react";
import { createContext, useContext } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

type ToastContextType = {
  toast: (props: ToastProps) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback((props: ToastProps) => {
    setToasts((prev) => [...prev, props]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 5000);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50">
        {toasts.map((t, i) => (
          <div 
            key={i} 
            className={`p-4 rounded-md shadow-md ${
              t.variant === "destructive" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-800"
            }`}
          >
            {t.title && <h3 className="font-medium">{t.title}</h3>}
            {t.description && <p className="text-sm">{t.description}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  
  return context;
}

export const toast = (props: ToastProps) => {
  console.warn("Toast used outside of component context. This may not work as expected.");
  // This is a fallback for when toast is used outside of a component
  // It's better to use the hook within components
  const toastEl = document.createElement("div");
  toastEl.className = `fixed bottom-4 right-4 p-4 rounded-md shadow-md z-50 ${
    props.variant === "destructive" ? "bg-red-500 text-white" : "bg-white dark:bg-gray-800"
  }`;
  
  if (props.title) {
    const title = document.createElement("h3");
    title.className = "font-medium";
    title.textContent = props.title;
    toastEl.appendChild(title);
  }
  
  if (props.description) {
    const desc = document.createElement("p");
    desc.className = "text-sm";
    desc.textContent = props.description;
    toastEl.appendChild(desc);
  }
  
  document.body.appendChild(toastEl);
  
  setTimeout(() => {
    toastEl.remove();
  }, 5000);
};