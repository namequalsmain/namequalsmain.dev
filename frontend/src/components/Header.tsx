import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="border-b border-slate-800">
      <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          className="font-mono text-lg font-bold text-slate-100 hover:text-accent transition-colors"
        >
          namequalsmain.dev
        </Link>
        <nav className="flex gap-6 text-sm text-slate-400">
          <a href="#projects" className="hover:text-slate-100 transition-colors">
            Projects
          </a>
          <a href="#contact" className="hover:text-slate-100 transition-colors">
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
