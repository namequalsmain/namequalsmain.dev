export function Footer() {
  return (
    <footer className="border-t border-ink/10 mt-32">
      <div className="mx-auto max-w-3xl px-8 py-8 flex justify-between text-xs font-mono uppercase tracking-widest text-ink-faint">
        <span>© {new Date().getFullYear()} namequalsmain</span>
        <span>Built with FastAPI &amp; React</span>
      </div>
    </footer>
  );
}
