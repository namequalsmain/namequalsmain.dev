import { Link, useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { uploadUrl } from '@/api/client';
import { clearToken } from '@/lib/auth';
import { Loading, ErrorBox } from '@/components/Loading';

export function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const projectsQ = useQuery({
    queryKey: ['projects', 'admin'],
    queryFn: projectsApi.listAll,
  });

  const deleteM = useMutation({
    mutationFn: projectsApi.delete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });

  function logout() {
    clearToken();
    navigate('/admin/login');
  }

  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <header className="flex items-end justify-between mb-12 flex-wrap gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint">
            Restricted
          </p>
          <h1 className="font-serif text-5xl tracking-tightest mt-1">Admin</h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/admin/profile" className="btn-ghost">Edit profile</Link>
          <Link to="/admin/projects/new" className="btn-primary">+ New project</Link>
          <button onClick={logout} className="btn-ghost">Sign out</button>
        </div>
      </header>

      {projectsQ.isLoading && <Loading />}
      {projectsQ.isError && <ErrorBox message="Couldn't load projects." />}

      {projectsQ.data && (
        <div className="border-t border-ink/15">
          {projectsQ.data.length === 0 && (
            <p className="py-12 font-serif italic text-ink-muted">
              No projects yet — click "New project" above.
            </p>
          )}
          {projectsQ.data.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-4 py-5 border-b border-ink/15 hover:bg-paper-dark/40 -mx-4 px-4 transition-colors"
            >
              {p.cover_image && (
                <img
                  src={uploadUrl(p.cover_image)!}
                  alt=""
                  className="w-16 h-12 object-cover border border-ink/15 shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-serif text-xl text-ink">{p.title}</span>
                  {!p.is_published && (
                    <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 border border-ink/30 text-ink-muted">
                      draft
                    </span>
                  )}
                </div>
                {p.summary && (
                  <p className="text-sm text-ink-muted truncate">{p.summary}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/admin/projects/${p.id}/edit`} className="btn-ghost !py-1 !text-xs">
                  Edit
                </Link>
                <button
                  className="btn-danger !py-1 !text-xs"
                  onClick={() => {
                    if (confirm(`Delete "${p.title}"? This cannot be undone.`)) {
                      deleteM.mutate(p.id);
                    }
                  }}
                  disabled={deleteM.isPending}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
