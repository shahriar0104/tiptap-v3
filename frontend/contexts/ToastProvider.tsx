"use client";

import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import { createPortal } from "react-dom";
import { MdCheckCircle, MdInfo } from "react-icons/md";
import { FiAlertCircle, FiAlertTriangle, FiX } from "react-icons/fi";
import { AnimatePresence, motion, useReducedMotion, Transition } from "framer-motion";

export type ToastType = "success" | "error" | "info" | "warning";
export type Toast = {
  id: string;
  message: string;
  title?: string;
  type?: ToastType;
  duration?: number; // ms
};

type ToastContextValue = {
  toast: (t: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  successAlert: (message: string, opts?: Omit<Toast, "id" | "message" | "type">) => string;
  errorAlert: (message: string, opts?: Omit<Toast, "id" | "message" | "type">) => string;
  infoAlert: (message: string, opts?: Omit<Toast, "id" | "message" | "type">) => string;
  warningAlert: (message: string, opts?: Omit<Toast, "id" | "message" | "type">) => string;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
};

function Icon({ type }: { type?: ToastType }) {
  if (type === "success") return <MdCheckCircle className="h-5 w-5" aria-hidden />;
  if (type === "error") return <FiAlertCircle className="h-5 w-5" aria-hidden />;
  if (type === "warning") return <FiAlertTriangle className="h-5 w-5" aria-hidden />;
  return <MdInfo className="h-5 w-5" aria-hidden />;
}

function classesFor(type?: ToastType) {
  switch (type) {
    case "success":
      return {
        wrap: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/25 dark:border-green-800 dark:text-green-100",
        icon: "text-green-600 dark:text-green-400",
        close: "hover:bg-green-100 dark:hover:bg-green-900/40"
      };
    case "error":
      return {
        wrap: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/25 dark:border-red-800 dark:text-red-100",
        icon: "text-red-600 dark:text-red-400",
        close: "hover:bg-red-100 dark:hover:bg-red-900/40"
      };
    case "warning":
      return {
        wrap: "bg-yellow-50 border-yellow-200 text-yellow-900 dark:bg-yellow-900/25 dark:border-yellow-800 dark:text-yellow-100",
        icon: "text-yellow-600 dark:text-yellow-400",
        close: "hover:bg-yellow-100 dark:hover:bg-yellow-900/40"
      };
    default:
      return {
        wrap: "bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-900/25 dark:border-blue-800 dark:text-blue-100",
        icon: "text-blue-600 dark:text-blue-400",
        close: "hover:bg-blue-100 dark:hover:bg-blue-900/40"
      };
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Record<string, number>>({});
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      window.clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const make = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    const toast: Toast = {
      id,
      type: t.type ?? "info",
      duration: t.duration ?? 10000,
      ...t,
    };
    setToasts((prev) => [toast, ...prev]);
    if (toast.duration && toast.duration > 0) {
      timers.current[id] = window.setTimeout(() => dismiss(id), toast.duration) as unknown as number;
    }
    return id;
  }, [dismiss]);

  const api = useMemo<ToastContextValue>(() => ({
    toast: make,
    dismiss,
    successAlert: (message, opts) => make({ message, type: "success", ...opts }),
    errorAlert: (message, opts) => make({ message, type: "error", ...opts }),
    infoAlert: (message, opts) => make({ message, type: "info", ...opts }),
    warningAlert: (message, opts) => make({ message, type: "warning", ...opts }),
  }), [make, dismiss]);

  // slide in from right, slide out to right
  const variants = {
    initial: { x: prefersReducedMotion ? 0 : 40, opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 },
    animate: { x: 0, opacity: 1, scale: 1 },
    exit: { x: prefersReducedMotion ? 0 : 40, opacity: 0, scale: prefersReducedMotion ? 1 : 0.98 },
  } as const;

  // const transition = { type: "spring", stiffness: 500, damping: 40, mass: 0.8, opacity: { duration: 0.2 } };

  const spring = {
    type: "spring",
    stiffness: 500,
    damping: 40,
    mass: 0.8,
  } satisfies Transition;

  const toastTransition = {
    ...spring,
    opacity: { type: "tween", duration: 0.2 } as Transition,
  } satisfies Transition;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {mounted && createPortal(
        <div
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-2"
        >
          <AnimatePresence initial={false}>
            {toasts.map((t) => {
              const c = classesFor(t.type);
              return (
                <motion.div
                  key={t.id}
                  role="status"
                  layout
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={variants}
                  transition={toastTransition}
                  className={`pointer-events-auto rounded-2xl border p-4 shadow-xl ring-1 ring-black/5 ${c.wrap}`}
                >
                  <div className="flex items-start gap-3">
                    <span className={c.icon}>
                      <Icon type={t.type} />
                    </span>
                    <div className="min-w-0 flex-1">
                      {t.title && <div className="text-sm font-semibold leading-5">{t.title}</div>}
                      <div className="text-sm leading-5">{t.message}</div>
                    </div>
                    <button
                      aria-label="Dismiss notification"
                      onClick={() => dismiss(t.id)}
                      className={`rounded-lg p-1 text-inherit focus:outline-none focus:ring-2 focus:ring-blue-500 ${c.close}`}
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
}
