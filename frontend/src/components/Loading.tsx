export function Loading({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="py-12 font-mono text-xs uppercase tracking-widest text-ink-faint">
      {label}<span className="animate-pulse">...</span>
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="py-6 border-l-2 border-accent pl-4 font-mono text-sm text-accent">
      {message}
    </div>
  );
}
