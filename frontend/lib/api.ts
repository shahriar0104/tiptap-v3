"use client";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export const api = {
  async get<T = unknown>(path: string): Promise<T | null> {
    const res = await fetch(`${BASE}/api${path}`, {
      credentials: "include",
    });
    return res.ok ? ((await res.json()) as T) : null;
  },

  async post<T = unknown, B = unknown>(
    path: string,
    body?: B
  ): Promise<T | null> {
    const res = await fetch(`${BASE}/api${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    return res.ok ? ((await res.json()) as T) : null;
  },
};
