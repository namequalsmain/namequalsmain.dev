export function Loading({ label = 'Loading...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
      {label}
    </div>
  );
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="card border-red-900 bg-red-950 text-red-300 text-sm">
      {message}
    </div>
  );
}
