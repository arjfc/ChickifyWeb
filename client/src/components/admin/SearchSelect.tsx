import React, { useEffect, useMemo, useRef, useState } from "react";

export type SearchSelectOption = {
  value: string;
  label: string;
  meta?: string; // optional subtitle (e.g., contact no.)
};

type Props = {
  label?: string;
  value: string;
  onChange: (item: SearchSelectOption) => void;
  options: SearchSelectOption[];
  placeholder?: string;
};

export default function SearchSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Select...",
}: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [q, setQ] = useState<string>("");

  // ✅ fix "contains does not exist on type never"
  const wrapRef = useRef<HTMLDivElement | null>(null);

  const selected = useMemo<SearchSelectOption | null>(() => {
    return options.find((o) => o.value === value) ?? null;
  }, [options, value]);

  const filtered = useMemo<SearchSelectOption[]>(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;

    return options.filter((o) => {
      const hay = `${o.label ?? ""} ${o.meta ?? ""}`.toLowerCase();
      return hay.includes(s);
    });
  }, [options, q]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const el = wrapRef.current;
      if (!el) return;

      // e.target can be null; cast to Node safely
      const target = e.target as Node | null;
      if (target && !el.contains(target)) setOpen(false);
    }

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="relative" ref={wrapRef}>
      {label ? (
        <div className="mb-1 text-sm font-medium text-gray-700">{label}</div>
      ) : null}

      {/* trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-left text-sm outline-none focus:border-yellow-400"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div
              className={`truncate ${
                selected ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {selected ? selected.label : placeholder}
            </div>
            {selected?.meta ? (
              <div className="truncate text-xs text-gray-500">
                {selected.meta}
              </div>
            ) : null}
          </div>
          <span className="text-gray-400">▾</span>
        </div>
      </button>

      {/* dropdown */}
      {open ? (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-200 bg-white shadow-lg">
          <div className="p-2">
            <input
              autoFocus
              value={q}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setQ(e.target.value)
              }
              placeholder="Search..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-yellow-400"
            />
          </div>

          <div className="max-h-56 overflow-auto p-2 pt-0">
            {filtered.length === 0 ? (
              <div className="rounded-xl px-3 py-2 text-sm text-gray-500">
                No matches.
              </div>
            ) : (
              filtered.map((o) => (
                <button
                  type="button"
                  key={o.value}
                  onClick={() => {
                    onChange(o);
                    setOpen(false);
                    setQ("");
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                    o.value === value ? "bg-yellow-50" : ""
                  }`}
                >
                  <div className="font-semibold text-gray-900">{o.label}</div>
                  {o.meta ? (
                    <div className="text-xs text-gray-500">{o.meta}</div>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
