import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto max-w-3xl px-8 py-6 flex items-center justify-between">
        <Link
          to="/"
          className="font-mono text-xs uppercase tracking-widest text-ink hover:text-accent transition-colors"
        >
          namequalsmain.dev
        </Link>
        <nav className="flex gap-8 text-xs font-mono uppercase tracking-widest text-ink-muted">
          <a href="#work" className="hover:text-ink transition-colors">Work</a>
          <a href="#about" className="hover:text-ink transition-colors">About</a>
          <a href="#contact" className="hover:text-ink transition-colors">Contact</a>
        </nav>
      </div>
    </header>
  );
}
