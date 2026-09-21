"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { ApiResponse } from "@/lib/fetch";

// A small stale-while-revalidate cache for reads made from client components.
//
// Why this exists: every read in this app is a Server Action called from a
// useEffect. Next dispatches Server Actions strictly one at a time per client
// (see node_modules/next/dist/docs/01-app/02-guides/server-actions.md, "Sequential
// dispatch on the client"), and nothing was cached or de-duplicated - so opening
// a page queued the tenant lookup, the session, the restrictions check, the
// students list, the notifications and the page's own data one behind another,
// twelve identical homepage-section fetches on the home page, and every visit to
// a page started again from a blank spinner. On a phone with a slow round trip
// that is the "blank screen" and the "have to refresh to see it" people reported.
//
// What it does:
//  - returns the last known data instantly on a revisit and refetches in the
//    background (stale-while-revalidate), so pages paint immediately;
//  - collapses concurrent identical reads into one request;
//  - refetches when something is invalidated (mutations, or the server's
//    `data:invalidate` socket event - see RealtimeSync) and when the tab
//    regains focus / the network comes back;
//  - never renders data on the server: the store is module-level, and on the
//    server that would be shared between every visitor.

const DEFAULT_TTL_MS = 30_000;
const STORAGE_PREFIX = "stc:cache:";
const MAX_RETRIES = 2;

interface Entry {
  data: unknown;
  at: number;
  tags: string[];
}

// Thrown by a fetcher for an error that retrying can't fix (a rejected session,
// a 403) - the hook surfaces it immediately instead of retrying with backoff.
export class NoRetryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoRetryError";
  }
}

export interface CacheOptions {
  // How long fetched data counts as fresh (no refetch on mount/focus).
  ttl?: number;
  // Tags an invalidation can target, e.g. "wallet", "notifications".
  tags?: string[];
  // Also keep the last value in sessionStorage so a full reload paints from it
  // instantly. Only for data already visible to the signed-in user and cleared on
  // logout/user change - see bindCacheToUser. Off by default.
  persist?: boolean;
}

const isBrowser = typeof window !== "undefined";
const store = new Map<string, Entry>();
const inflight = new Map<string, Promise<unknown>>();
// Bumped every time a fetch starts, so a slow response that was overtaken by a
// newer fetch (or an invalidation) can't overwrite the fresher data.
const generations = new Map<string, number>();
const listeners = new Map<string, Set<() => void>>();
// Fired when a key is marked stale, so mounted hooks refetch right away.
const invalidationListeners = new Map<string, Set<() => void>>();
let boundUserId: string | null | undefined;

function emit(map: Map<string, Set<() => void>>, key: string) {
  map.get(key)?.forEach((fn) => fn());
}

function addListener(map: Map<string, Set<() => void>>, key: string, fn: () => void) {
  let set = map.get(key);
  if (!set) map.set(key, (set = new Set()));
  set.add(fn);
  return () => {
    set!.delete(fn);
  };
}

function readStorage(key: string): Entry | undefined {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw ? (JSON.parse(raw) as Entry) : undefined;
  } catch {
    return undefined;
  }
}

function writeStorage(key: string, entry: Entry) {
  try {
    window.sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // Storage full / disabled (private mode) - the in-memory copy still works.
  }
}

// Memory first; falls back to sessionStorage once per key (and only in the
// browser), promoting what it finds - as stale, so it is still revalidated.
function getEntry(key: string, persist?: boolean): Entry | undefined {
  if (!isBrowser) return undefined;
  const hit = store.get(key);
  if (hit || !persist) return hit;
  const stored = readStorage(key);
  if (stored) store.set(key, { ...stored, at: 0 });
  return store.get(key);
}

export function setCached<T>(key: string, data: T, options: CacheOptions = {}) {
  if (!isBrowser) return;
  const entry: Entry = { data, at: Date.now(), tags: options.tags ?? store.get(key)?.tags ?? [] };
  store.set(key, entry);
  if (options.persist) writeStorage(key, entry);
  emit(listeners, key);
}

export function peekCached<T>(key: string): T | undefined {
  return store.get(key)?.data as T | undefined;
}

// Loads `key` through `fetcher`, re-using fresh data and any request already in
// flight. Throws if the fetch fails (stale data, if any, is left in place).
export async function fetchCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: CacheOptions & { force?: boolean } = {}
): Promise<T> {
  const ttl = options.ttl ?? DEFAULT_TTL_MS;
  const existing = getEntry(key, options.persist);
  if (!options.force && existing && Date.now() - existing.at < ttl) return existing.data as T;

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const generation = (generations.get(key) ?? 0) + 1;
  generations.set(key, generation);
  const request = fetcher()
    .then((data) => {
      if (generations.get(key) === generation) setCached(key, data, options);
      return data;
    })
    .finally(() => {
      if (inflight.get(key) === request) inflight.delete(key);
    });
  inflight.set(key, request);
  return request;
}

// Marks everything carrying one of these tags stale and refetches whatever is
// currently on screen. Unmounted entries just stay stale: the next visit still
// paints their old data instantly and revalidates behind it.
export function invalidateTags(tags: string[]) {
  const wanted = new Set(tags);
  store.forEach((entry, key) => {
    if (entry.tags.some((t) => wanted.has(t))) {
      entry.at = 0;
      inflight.delete(key);
      emit(invalidationListeners, key);
    }
  });
}

export function invalidateKeys(keys: string[]) {
  for (const key of keys) {
    const entry = store.get(key);
    if (entry) entry.at = 0;
    inflight.delete(key);
    emit(invalidationListeners, key);
  }
}

export function invalidateAll() {
  store.forEach((entry, key) => {
    entry.at = 0;
    inflight.delete(key);
    emit(invalidationListeners, key);
  });
}

export function clearClientCache() {
  store.clear();
  inflight.clear();
  if (!isBrowser) return;
  try {
    const doomed: string[] = [];
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const k = window.sessionStorage.key(i);
      if (k?.startsWith(STORAGE_PREFIX)) doomed.push(k);
    }
    doomed.forEach((k) => window.sessionStorage.removeItem(k));
  } catch {
    // ignore
  }
  store.forEach((_, key) => emit(listeners, key));
}

// Called by the session owner (UserProvider) whenever the signed-in identity
// changes. Anything cached belongs to the previous person and must not be shown
// to the next one.
export function bindCacheToUser(userId: string | null) {
  if (boundUserId !== undefined && boundUserId !== userId) clearClientCache();
  boundUserId = userId;
}

// Server Actions in this codebase resolve to [response, errorMessage]. This turns
// that into "data or throw", which is what fetchCached / useCachedQuery expect.
export async function unwrap<T>(action: Promise<[ApiResponse<T> | null, string | null]>): Promise<T | undefined> {
  const [res, error] = await action;
  if (error) throw new Error(error);
  return res?.data;
}

export interface CachedQuery<T> {
  data: T | undefined;
  error: Error | null;
  // True until the first data (cached or fetched) is available - what a page
  // should gate its skeleton on. Stays false while a revisit revalidates behind
  // already-visible data.
  isLoading: boolean;
  isValidating: boolean;
  refresh: () => Promise<void>;
}

export function useCachedQuery<T>(
  key: string | null,
  fetcher: () => Promise<T>,
  options: CacheOptions & { enabled?: boolean } = {}
): CachedQuery<T> {
  const { ttl = DEFAULT_TTL_MS, tags, persist, enabled = true } = options;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const tagsKey = (tags ?? []).join("|");

  const subscribe = (onChange: () => void) => (key ? addListener(listeners, key, onChange) : () => {});
  // getServerSnapshot returns undefined so the server render and the first client
  // render agree; useSyncExternalStore then re-renders with the real cache.
  const data = useSyncExternalStore(
    subscribe,
    () => (key ? (getEntry(key, persist)?.data as T | undefined) : undefined),
    () => undefined
  );

  const [error, setError] = useState<Error | null>(null);
  const [isValidating, setValidating] = useState(false);

  const runRef = useRef<(force?: boolean) => Promise<void>>(async () => {});

  useEffect(() => {
    if (!key || !enabled) return;
    let cancelled = false;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;

    const run = async (force = false, attempt = 0): Promise<void> => {
      setValidating(true);
      try {
        await fetchCached(key, () => fetcherRef.current(), { ttl, tags: tags ?? [], persist, force });
        if (!cancelled) {
          setError(null);
          setValidating(false);
        }
      } catch (error) {
        if (cancelled) return;
        // Transient (a flaky mobile connection, a cold-starting API): keep any
        // stale data on screen and try again shortly instead of giving up.
        if (attempt < MAX_RETRIES && !(error instanceof NoRetryError)) {
          retryTimer = setTimeout(() => run(true, attempt + 1), 1500 * (attempt + 1));
        } else {
          setError(error instanceof Error ? error : new Error(String(error)));
          setValidating(false);
        }
      }
    };
    runRef.current = (force = true) => run(force);

    run();
    const offInvalidate = addListener(invalidationListeners, key, () => run(true));
    const onWake = () => {
      if (document.visibilityState === "visible") run();
    };
    const onOnline = () => run(true);
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onOnline);
    return () => {
      cancelled = true;
      if (retryTimer) clearTimeout(retryTimer);
      offInvalidate();
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onOnline);
    };
    // fetcher is read through a ref so callers can pass inline functions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, ttl, tagsKey, persist]);

  const refresh = useCallback(() => runRef.current(true), []);

  return {
    data,
    error,
    isLoading: enabled && data === undefined && error === null,
    isValidating,
    refresh,
  };
}
