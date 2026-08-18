"use client";

import { useMemo, useState } from "react";
import { ChevronsRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface TransferItem {
  id: string;
  primary: string;
  secondary?: string;
}

interface DualPaneTransferListProps {
  leftTitle: string;
  rightTitle: string;
  leftItems: TransferItem[];
  rightItems: TransferItem[];
  isLoading?: boolean;
  isTransferring?: boolean;
  transferLabel?: string;
  transferDisabledReason?: string;
  onTransfer: (ids: string[]) => void | Promise<void>;
  searchPlaceholder?: string;
}

// Generic dual-pane "transfer list" - left pane is searchable/multi-select,
// right pane is a read-only reflection of whatever the caller already
// assigned to the current target (tutor/admin).
export default function DualPaneTransferList({
  leftTitle,
  rightTitle,
  leftItems,
  rightItems,
  isLoading,
  isTransferring,
  transferLabel = "Assign",
  transferDisabledReason,
  onTransfer,
  searchPlaceholder = "Search...",
}: DualPaneTransferListProps) {
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredLeft = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return leftItems;
    return leftItems.filter((item) => `${item.primary} ${item.secondary ?? ""}`.toLowerCase().includes(term));
  }, [leftItems, search]);

  const selected = new Set(selectedIds);
  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };
  const selectAllShown = () => setSelectedIds(Array.from(new Set([...selectedIds, ...filteredLeft.map((i) => i.id)])));
  const clearSelection = () => setSelectedIds([]);

  const handleTransfer = async () => {
    if (selectedIds.length === 0) return;
    await onTransfer(selectedIds);
    setSelectedIds([]);
  };

  const canTransfer = selectedIds.length > 0 && !isTransferring && !transferDisabledReason;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-start">
      {/* Left pane */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-900">
            {leftTitle} <span className="text-gray-400 font-normal">({leftItems.length})</span>
          </h4>
          <div className="flex gap-2 text-xs">
            <button type="button" onClick={selectAllShown} className="text-blue-600 hover:underline">
              Select all shown
            </button>
            <button type="button" onClick={clearSelection} className="text-gray-500 hover:underline">
              Clear
            </button>
          </div>
        </div>
        <div className="p-2 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={searchPlaceholder} className="pl-7 h-8 text-sm" />
          </div>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {isLoading && <p className="p-4 text-xs text-gray-400">Loading...</p>}
          {!isLoading && filteredLeft.length === 0 && <p className="p-4 text-xs text-gray-400">Nothing to show.</p>}
          {!isLoading &&
            filteredLeft.map((item) => (
              <label key={item.id} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer">
                <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} />
                <div className="min-w-0">
                  <div className="text-gray-900 truncate">{item.primary}</div>
                  {item.secondary && <div className="text-xs text-gray-500 truncate">{item.secondary}</div>}
                </div>
              </label>
            ))}
        </div>
      </div>

      {/* Transfer control */}
      <div className="flex lg:flex-col items-center justify-center gap-2 lg:pt-16">
        <Button size="sm" onClick={handleTransfer} disabled={!canTransfer} title={transferDisabledReason}>
          <ChevronsRight className="size-4" />
          {isTransferring ? "Assigning..." : transferLabel}
        </Button>
        <span className="text-xs text-gray-400">{selectedIds.length} selected</span>
      </div>

      {/* Right pane */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
          <h4 className="text-sm font-semibold text-gray-900">
            {rightTitle} <span className="text-gray-400 font-normal">({rightItems.length})</span>
          </h4>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
          {rightItems.length === 0 && <p className="p-4 text-xs text-gray-400">Nothing assigned yet.</p>}
          {rightItems.map((item) => (
            <div key={item.id} className="px-3 py-2 text-sm">
              <div className="text-gray-900 truncate">{item.primary}</div>
              {item.secondary && <div className="text-xs text-gray-500 truncate">{item.secondary}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
