"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CommunityInstallDescriptor } from "@/lib/battuta-community";
import { readCatalogResponse, type CommunityPresentation } from "@/lib/battuta-community-catalog";

export function useBattutaCommunityCatalog(filters: string, enabled = true) {
  const [releases, setReleases] = useState<CommunityInstallDescriptor[]>([]);
  const [presentations, setPresentations] = useState<Record<string, CommunityPresentation>>({});
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [filterKey, setFilterKey] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const load = useCallback(async (after: string | null) => {
    pending.current?.abort();
    const controller = new AbortController(); pending.current = controller;
    const request = ++generation.current;
    setLoading(true); setFailed(false);
    if (!after) { setFilterKey(filters); setReleases([]); setPresentations({}); setCursor(null); setLoaded(false); }
    try {
      const query = new URLSearchParams(filters);
      if (after) query.set("after", after);
      const response = await fetch(`/api/battuta/community/v1/packs?${query}`, {
        cache: "no-store", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(20000)]),
      });
      const page = await readCatalogResponse(response);
      if (controller.signal.aborted || request !== generation.current) return;
      if (after && page.nextCursor && page.nextCursor <= after) throw Error("catalog_cursor_did_not_advance");
      setReleases(previous => {
        const merged = new Map((after ? previous : []).map(item => [item.packId, item]));
        for (const item of page.releases) merged.set(item.packId, item);
        return [...merged.values()];
      });
      setPresentations(previous => ({ ...(after ? previous : {}), ...page.presentations }));
      setCursor(page.nextCursor); setLoaded(true);
    } catch { if (!controller.signal.aborted && request === generation.current) setFailed(true); }
    finally { if (!controller.signal.aborted && request === generation.current) setLoading(false); }
  }, [filters]);
  useEffect(() => {
    pending.current?.abort(); ++generation.current;
    if (!enabled) return;
    const timer = setTimeout(() => { void load(null); }, 250);
    return () => { clearTimeout(timer); pending.current?.abort(); };
  }, [enabled, load]);
  const current = enabled && filterKey === filters;
  return { releases: current ? releases : [], presentations: current ? presentations : {},
    cursor: current ? cursor : null, loading: enabled && (!current || loading),
    failed: current && failed, loaded: current && loaded,
    retry: () => { if (enabled) void load(current ? cursor : null); },
    refresh: () => { if (enabled) void load(null); },
    loadMore: () => { if (current && cursor && !loading) void load(cursor); } };
}
