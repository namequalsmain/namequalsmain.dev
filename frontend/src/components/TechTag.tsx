export function TechTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs text-ink-muted before:content-['/'] before:mr-1.5 before:text-ink-faint">
      {children}
    </span>
  );
}
