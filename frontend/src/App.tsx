import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Home } from '@/pages/Home';
import { ProjectDetail } from '@/pages/ProjectDetail';
import { AdminLogin } from '@/pages/admin/Login';
import { AdminDashboard } from '@/pages/admin/Dashboard';
import { AdminProjectForm } from '@/pages/admin/ProjectForm';
import { AdminProfileForm } from '@/pages/admin/ProfileForm';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1">
          <Routes>
            {/* Public */}
            <Route path="/" element={<Home />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects/new"
              element={
                <ProtectedRoute>
                  <AdminProjectForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/projects/:id/edit"
              element={
                <ProtectedRoute>
                  <AdminProjectForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <ProtectedRoute>
                  <AdminProfileForm />
                </ProtectedRoute>
              }
            />

            {/* 404 */}
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
