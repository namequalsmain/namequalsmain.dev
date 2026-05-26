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
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl text-slate-100">Admin</h1>
        <div className="flex gap-3">
          <Link to="/admin/profile" className="btn-secondary">
            Edit profile
          </Link>
          <Link to="/admin/projects/new" className="btn-primary">
            New project
          </Link>
          <button onClick={logout} className="btn-secondary">
            Sign out
          </button>
        </div>
      </header>

      {projectsQ.isLoading && <Loading />}
      {projectsQ.isError && <ErrorBox message="Couldn't load projects." />}

      {projectsQ.data && (
        <div className="flex flex-col gap-3">
          {projectsQ.data.length === 0 && (
            <p className="text-slate-500 italic">
              No projects yet. Click "New project" to add the first one.
            </p>
          )}
          {projectsQ.data.map((p) => (
            <div
              key={p.id}
              className="card flex items-center gap-4 hover:border-slate-700 transition-colors"
            >
              {p.cover_image && (
                <img
                  src={uploadUrl(p.cover_image)!}
                  alt=""
                  className="w-20 h-14 object-cover rounded border border-slate-800"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-slate-100 font-medium">{p.title}</span>
                  {!p.is_published && (
                    <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                      draft
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500 truncate">{p.summary}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link to={`/admin/projects/${p.id}/edit`} className="btn-secondary text-sm">
                  Edit
                </Link>
                <button
                  className="btn-danger text-sm"
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
