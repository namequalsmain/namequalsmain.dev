import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home';
import { ProjectDetail } from '@/pages/ProjectDetail';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-8 py-32 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">404</p>
      <h1 className="mt-4 font-serif text-7xl leading-none tracking-tightest">Not here.</h1>
      <p className="mt-6 text-ink-muted">The page you wanted doesn't exist.</p>
    </main>
  );
}
