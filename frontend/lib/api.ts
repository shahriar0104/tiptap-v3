"use client";
const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export const api = {
  async get(path: string) {
    const res = await fetch(`${BASE}${path}`, { credentials: "include" });
    return res.ok ? await res.json() : null;
  },
  async post(path: string, body?: any) {
    const res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });
    return res.ok ? await res.json() : null;
  },
};