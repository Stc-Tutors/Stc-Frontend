"use client";

// Last line of defence: an error thrown by the ROOT layout itself (or a provider in
// it) can't be caught by any route-level error.tsx, and without this the visitor
// gets Next's bare "This page couldn't load". It replaces the whole document, so it
// must render its own <html>/<body> and can't rely on the app's providers, styles
// or components.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  console.error("[GlobalError]", error);
  const stale = /ChunkLoadError|Loading chunk|Failed to fetch dynamically imported module|Failed to find Server Action/i.test(
    `${error.name} ${error.message}`
  );

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f9fafb", color: "#111827" }}>
        <main
          role="alert"
          style={{ minHeight: "100dvh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}
        >
          <div style={{ maxWidth: 420 }}>
            <h1 style={{ fontSize: 20, margin: "0 0 8px" }}>
              {stale ? "A new version is available" : "Something went wrong"}
            </h1>
            <p style={{ fontSize: 14, color: "#4b5563", margin: "0 0 20px" }}>
              {stale ? "Reload the page to get the latest version." : "We hit an unexpected problem. You can try again."}
            </p>
            <button
              type="button"
              onClick={() => (stale ? window.location.reload() : reset())}
              style={{ background: "#2563eb", color: "#fff", border: 0, borderRadius: 6, padding: "10px 18px", fontSize: 14, cursor: "pointer" }}
            >
              {stale ? "Reload" : "Try again"}
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
