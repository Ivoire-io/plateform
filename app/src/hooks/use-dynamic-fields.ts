import { useCallback, useEffect, useState } from "react";

export interface DynamicFieldOption {
  value: string;
  label: string;
  parent: string | null;
  category: string;
}

const cache: Record<string, { data: DynamicFieldOption[]; ts: number }> = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useDynamicFields(category: string) {
  const [options, setOptions] = useState<DynamicFieldOption[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch_ = useCallback(async () => {
    const cached = cache[category];
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setOptions(cached.data);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/dynamic-fields?category=${encodeURIComponent(category)}`);
      if (!res.ok) throw new Error();
      const data: DynamicFieldOption[] = await res.json();
      cache[category] = { data, ts: Date.now() };
      setOptions(data);
    } catch {
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetch_(); }, [fetch_]);

  // Grouped by parent
  const grouped: Record<string, DynamicFieldOption[]> = {};
  for (const opt of options) {
    const key = opt.parent ?? "";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(opt);
  }

  return { options, grouped, loading };
}
