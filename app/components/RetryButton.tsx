"use client";

export function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
    >
      Retry
    </button>
  );
}
