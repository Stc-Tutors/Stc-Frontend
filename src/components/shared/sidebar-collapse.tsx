"use client";

import { useEffect, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

const KEY = "stc-sidebar-collapsed";

// Desktop sidebar open/closed, remembered per browser. (On phones the drawer is opened by the hamburger instead.)
export function useSidebarCollapsed(): [boolean, () => void] {
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    try {
      // Read after mount (not in the initial state) so server and first client render agree.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(localStorage.getItem(KEY) === "1");
    } catch {
      /* ignore */
    }
  }, []);
  const toggle = () =>
    setCollapsed((c) => {
      try {
        localStorage.setItem(KEY, c ? "0" : "1");
      } catch {
        /* ignore */
      }
      return !c;
    });
  return [collapsed, toggle];
}

export function DesktopSidebarToggle({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const Icon = collapsed ? PanelLeftOpen : PanelLeftClose;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
      title={collapsed ? "Open sidebar" : "Close sidebar"}
      className="hidden md:block p-2 rounded-md hover:bg-blue-100 transition shrink-0 mr-2"
    >
      <Icon className="w-5 h-5 text-gray-700" />
    </button>
  );
}
