"use client";

// Catches errors that escape the root layout. It renders its own <html>/<body>,
// so it uses inline styles (globals.css isn't guaranteed here).
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#e5e5e5",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem", maxWidth: 420 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 0.5rem" }}>
            Something went wrong
          </h2>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 1.25rem" }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: "#e5e5e5",
              color: "#0a0a0a",
              border: "none",
              padding: "0.6rem 1.25rem",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
