"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { readFacetsResponse, type CommunityCatalogFacets } from "@/lib/battuta-community-catalog";

export function useBattutaCommunityFacets(search: string, enabled: boolean) {
  const query = search.trim();
  const [page, setPage] = useState<CommunityCatalogFacets | null>(null);
  const [filterKey, setFilterKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const pending = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const load = useCallback(async () => {
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    const request = ++generation.current;
    setFilterKey(query); setLoading(true); setFailed(false); setPage(null);
    try {
      const suffix = query ? `?${new URLSearchParams({ q: query })}` : "";
      const response = await fetch(`/api/battuta/community/v1/packs/facets${suffix}`, {
        cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
      });
      const value = await readFacetsResponse(response);
      if (!controller.signal.aborted && request === generation.current) setPage(value);
    } catch { if (!controller.signal.aborted && request === generation.current) setFailed(true); }
    finally { if (!controller.signal.aborted && request === generation.current) setLoading(false); }
  }, [query]);
  useEffect(() => {
    pending.current?.abort(); ++generation.current;
    if (!enabled) return;
    const timer = setTimeout(() => { void load(); }, 250);
    return () => { clearTimeout(timer); pending.current?.abort(); };
  }, [enabled, load]);
  const current = enabled && filterKey === query;
  return { page: current ? page : null, loading: enabled && (!current || loading),
    failed: current && failed, retry: () => { if (enabled) void load(); } };
}
