"use client";

import { useEffect, useRef, useState } from "react";
import {
  COLOR_KEYS,
  createInitialState,
  createMandalart,
  normalizeActionText,
  type Mandalart,
  type MandalartAppState,
} from "../lib/mandalart";

export type StorageStatus = "saved" | "saving" | "error";

const now = () => new Date().toISOString();

function cloneMandalart(source: Mandalart): Mandalart {
  const copy = createMandalart(`${source.title} 복사본`);
  return {
    ...copy,
    centerGoal: source.centerGoal,
    coreGoals: source.coreGoals.map((core, index) => ({
      id: crypto.randomUUID(),
      title: core.title,
      colorKey: COLOR_KEYS[index],
      actions: core.actions.map((action) => ({ ...action, id: crypto.randomUUID() })),
    })),
  };
}

export function useMandalarts() {
  const [state, setState] = useState<MandalartAppState>(() => createInitialState());
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("saving");
  const loaded = useRef(false);
  const skipNextSave = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/mandalarts")
      .then((response) => {
        if (!response.ok) throw new Error("failed to load mandalarts");
        return response.json() as Promise<{ state: MandalartAppState }>;
      })
      .then(({ state: savedState }) => {
        if (cancelled) return;
        skipNextSave.current = true;
        setState(savedState);
        loaded.current = true;
        setStorageStatus("saved");
      })
      .catch(() => {
        if (cancelled) return;
        loaded.current = true;
        setStorageStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    setStorageStatus("saving");
    const timer = window.setTimeout(() => {
      fetch("/api/mandalarts", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ state }),
      })
        .then((response) => {
          if (!response.ok) throw new Error("failed to save mandalarts");
          setStorageStatus("saved");
        })
        .catch(() => setStorageStatus("error"));
    }, 250);
    return () => window.clearTimeout(timer);
  }, [state]);

  const updateSelected = (transform: (mandalart: Mandalart) => Mandalart) => {
    setState((current) => ({
      ...current,
      mandalarts: current.mandalarts.map((mandalart) =>
        mandalart.id === current.selectedMandalartId
          ? { ...transform(mandalart), updatedAt: now() }
          : mandalart,
      ),
    }));
  };

  return {
    state,
    storageStatus,
    create(title: string) {
      const mandalart = createMandalart(title);
      setState((current) => ({ ...current, selectedMandalartId: mandalart.id, mandalarts: [...current.mandalarts, mandalart] }));
    },
    rename(id: string, title: string) {
      setState((current) => ({ ...current, mandalarts: current.mandalarts.map((item) => item.id === id ? { ...item, title: title.trim() || "이름 없는 만다라트", updatedAt: now() } : item) }));
    },
    duplicate(id: string) {
      setState((current) => {
        const source = current.mandalarts.find((item) => item.id === id);
        if (!source) return current;
        const copy = cloneMandalart(source);
        return { ...current, selectedMandalartId: copy.id, mandalarts: [...current.mandalarts, copy] };
      });
    },
    remove(id: string) {
      setState((current) => {
        const mandalarts = current.mandalarts.filter((item) => item.id !== id);
        const selectedMandalartId = current.selectedMandalartId === id ? mandalarts[0]?.id ?? null : current.selectedMandalartId;
        return { ...current, mandalarts, selectedMandalartId };
      });
    },
    select(id: string) {
      setState((current) => current.mandalarts.some((item) => item.id === id) ? { ...current, selectedMandalartId: id } : current);
    },
    updateCenter(text: string) {
      updateSelected((mandalart) => ({ ...mandalart, centerGoal: text }));
    },
    updateCore(coreId: string, text: string) {
      updateSelected((mandalart) => ({ ...mandalart, coreGoals: mandalart.coreGoals.map((core) => core.id === coreId ? { ...core, title: text } : core) }));
    },
    updateAction(coreId: string, actionId: string, text: string) {
      updateSelected((mandalart) => ({ ...mandalart, coreGoals: mandalart.coreGoals.map((core) => core.id === coreId ? { ...core, actions: core.actions.map((action) => action.id === actionId ? normalizeActionText(action, text) : action) } : core) }));
    },
    toggleAction(coreId: string, actionId: string) {
      updateSelected((mandalart) => ({ ...mandalart, coreGoals: mandalart.coreGoals.map((core) => core.id === coreId ? { ...core, actions: core.actions.map((action) => action.id === actionId && action.text.trim() ? { ...action, completed: !action.completed } : action) } : core) }));
    },
    replaceAll(next: MandalartAppState) {
      setState(next);
    },
  };
}
