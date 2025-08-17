"use client";

import { useEffect, useSyncExternalStore } from "react";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

let items: BreadcrumbItem[] = [];
const listeners = new Set<() => void>();

function shallowEqual(a: BreadcrumbItem[], b: BreadcrumbItem[]) {
  if (a === b) return true;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i].label !== b[i].label || a[i].href !== b[i].href) return false;
  }
  return true;
}

function emit() {
  for (const l of listeners) l();
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  return items;
}

export function setBreadcrumbs(next: BreadcrumbItem[]) {
  if (!Array.isArray(next)) next = [];
  if (shallowEqual(items, next)) return;
  items = next;
  emit();
}

// Hook for components to read the current breadcrumb items
export function useBreadcrumbItems() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Helper hook for pages to set breadcrumbs declaratively
export function useBreadcrumbs(next: BreadcrumbItem[] | undefined) {
  useEffect(() => {
    setBreadcrumbs(next && next.length ? next : []);
    // We intentionally stringify to only re-run when contents change
  }, [JSON.stringify(next)]);
}
