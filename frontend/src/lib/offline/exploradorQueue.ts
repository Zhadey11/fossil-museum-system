"use client";

import { postCrearFosil } from "@/lib/api";

const KEY = "explorador_offline_queue_v1";

export type PendingFosil = {
  id: string;
  createdAt: string;
  payload: {
    nombre: string;
    canton_id: number;
    categoria_id: number;
    era_id: number;
    periodo_id: number;
    latitud?: number | null;
    longitud?: number | null;
    altitud_msnm?: number | null;
    descripcion_ubicacion?: string;
    fecha_hallazgo?: string;
  };
};

function readQueue(): PendingFosil[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeQueue(items: PendingFosil[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getPendingFosiles(): PendingFosil[] {
  return readQueue();
}

export function enqueueFosil(payload: PendingFosil["payload"]): PendingFosil {
  const row: PendingFosil = {
    id: `offline-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    createdAt: new Date().toISOString(),
    payload,
  };
  const q = readQueue();
  q.push(row);
  writeQueue(q);
  return row;
}

export async function syncPendingFosiles(): Promise<{ synced: number; failed: number }> {
  const queue = readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };
  const keep: PendingFosil[] = [];
  let synced = 0;
  for (const row of queue) {
    try {
      await postCrearFosil(row.payload);
      synced += 1;
    } catch {
      keep.push(row);
    }
  }
  writeQueue(keep);
  return { synced, failed: keep.length };
}
