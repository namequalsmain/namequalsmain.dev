export function TechTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md bg-slate-800 px-2 py-1 text-xs font-mono text-slate-300">
      {children}
    </span>
  );
}
