export function Footer() {
  return (
    <footer className="border-t border-slate-800 mt-24">
      <div className="mx-auto max-w-5xl px-6 py-8 text-sm text-slate-500 flex justify-between">
        <span>© {new Date().getFullYear()} namequalsmain</span>
        <span>Built with FastAPI + React</span>
      </div>
    </footer>
  );
}
