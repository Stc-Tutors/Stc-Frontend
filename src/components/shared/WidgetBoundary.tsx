"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";

// A render error inside one dashboard widget (a chart choking on an unexpected
// API shape, a calendar library throwing) used to unwind to the route's
// error.tsx and replace the WHOLE dashboard. Wrapping each widget in this keeps
// the failure local: the rest of the page stays usable, the broken card says so
// and offers a retry.
interface Props {
  // Shown in the fallback and the console, e.g. "the performance chart".
  name: string;
  children: ReactNode;
  className?: string;
}

interface State {
  error: Error | null;
}

export default class WidgetBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error(`[WidgetBoundary] ${this.props.name} crashed:`, error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        className={`flex flex-col items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-6 text-center ${this.props.className ?? ""}`}
      >
        <AlertTriangle className="size-6 text-amber-500" aria-hidden />
        <p className="text-sm font-medium text-gray-900">Couldn&apos;t load {this.props.name}.</p>
        <p className="text-xs text-gray-500">The rest of your page is unaffected.</p>
        <button
          type="button"
          onClick={() => this.setState({ error: null })}
          className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
        >
          <RotateCw className="size-3.5" aria-hidden /> Try again
        </button>
      </div>
    );
  }
}
