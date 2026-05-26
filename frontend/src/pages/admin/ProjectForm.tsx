import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { uploadApi } from '@/api/auth';
import { uploadUrl } from '@/api/client';
import { Loading, ErrorBox } from '@/components/Loading';
import type { ProjectInput } from '@/api/types';

/** Create-or-edit form. With :id → edit. Without → create. */
export function AdminProjectForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { id } = useParams();
  const editing = id !== undefined;
  const projectId = editing ? Number(id) : null;

  const [form, setForm] = useState<ProjectInput & { cover_image: string | null }>({
    slug: '', title: '', summary: '', description: '',
    tech_stack: [], github_url: '', demo_url: '',
    cover_image: null, sort_order: 0, is_published: true,
  });
  const [techInput, setTechInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const existingQ = useQuery({
    queryKey: ['admin-project', projectId],
    queryFn: () => projectsApi.listAll().then((all) => all.find((p) => p.id === projectId) || null),
    enabled: editing,
  });

  useEffect(() => {
    if (existingQ.data) {
      const p = existingQ.data;
      setForm({
        slug: p.slug, title: p.title, summary: p.summary, description: p.description,
        tech_stack: p.tech_stack,
        github_url: p.github_url ?? '', demo_url: p.demo_url ?? '',
        cover_image: p.cover_image, sort_order: p.sort_order, is_published: p.is_published,
      });
    }
  }, [existingQ.data]);

  const saveM = useMutation({
    mutationFn: async () => {
      const payload: ProjectInput = {
        ...form,
        github_url: form.github_url || null,
        demo_url: form.demo_url || null,
        cover_image: form.cover_image || null,
      };
      return editing && projectId
        ? projectsApi.update(projectId, payload)
        : projectsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
      navigate('/admin');
    },
    onError: (err: any) => setError(err.response?.data?.detail || 'Save failed.'),
  });

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { filename } = await uploadApi.uploadImage(file);
      setForm((f) => ({ ...f, cover_image: filename }));
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  function addTech() {
    const t = techInput.trim();
    if (!t || (form.tech_stack ?? []).includes(t)) return;
    setForm((f) => ({ ...f, tech_stack: [...(f.tech_stack ?? []), t] }));
    setTechInput('');
  }

  function removeTech(t: string) {
    setForm((f) => ({ ...f, tech_stack: (f.tech_stack ?? []).filter((x) => x !== t) }));
  }

  if (editing && existingQ.isLoading) return <main className="mx-auto max-w-3xl px-8 py-16"><Loading /></main>;
  if (editing && existingQ.isError) return <main className="mx-auto max-w-3xl px-8 py-16"><ErrorBox message="Couldn't load project." /></main>;

  return (
    <main className="mx-auto max-w-2xl px-8 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-2">
        {editing ? 'Editing' : 'Create'}
      </p>
      <h1 className="font-serif text-5xl tracking-tightest mb-12">
        {editing ? form.title || 'Untitled' : 'New project'}
      </h1>

      <form
        onSubmit={(e) => { e.preventDefault(); saveM.mutate(); }}
        className="flex flex-col gap-8"
      >
        <div>
          <label className="label" htmlFor="slug">Slug</label>
          <input
            id="slug"
            className="input font-mono"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="my-cool-bot"
            pattern="[a-z0-9-]+"
            required
          />
          <p className="text-xs text-ink-faint mt-1 font-mono">lowercase, digits, hyphens</p>
        </div>

        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" className="input"
                 value={form.title}
                 onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                 required />
        </div>

        <div>
          <label className="label" htmlFor="summary">Summary</label>
          <input id="summary" className="input"
                 value={form.summary}
                 onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                 maxLength={255} />
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="input min-h-[160px] font-sans"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        </div>

        <div>
          <label className="label">Tech stack</label>
          <div className="flex gap-3 items-end">
            <input
              className="input font-mono flex-1"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTech(); } }}
              placeholder="python"
            />
            <button type="button" className="btn-ghost" onClick={addTech}>Add</button>
          </div>
          {(form.tech_stack ?? []).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {(form.tech_stack ?? []).map((t) => (
                <button key={t} type="button" onClick={() => removeTech(t)}
                        className="font-mono text-xs text-ink-muted border border-ink/30 px-2 py-1 hover:text-accent hover:border-accent transition-colors">
                  {t} ×
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="label" htmlFor="github_url">GitHub URL</label>
          <input id="github_url" className="input"
                 value={form.github_url ?? ''}
                 onChange={(e) => setForm((f) => ({ ...f, github_url: e.target.value }))}
                 placeholder="https://github.com/..." />
        </div>

        <div>
          <label className="label" htmlFor="demo_url">Demo URL</label>
          <input id="demo_url" className="input"
                 value={form.demo_url ?? ''}
                 onChange={(e) => setForm((f) => ({ ...f, demo_url: e.target.value }))}
                 placeholder="https://yourdemo.app" />
        </div>

        <div>
          <label className="label">Cover image</label>
          {form.cover_image && (
            <img src={uploadUrl(form.cover_image)!} alt="cover"
                 className="mb-3 max-h-48 border border-ink/15" />
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-ink-muted font-mono
                       file:mr-3 file:py-2 file:px-4 file:border file:border-ink
                       file:bg-transparent file:text-ink file:text-xs file:uppercase
                       file:tracking-wider file:font-mono file:cursor-pointer
                       hover:file:bg-ink hover:file:text-paper transition-colors"
          />
          {uploading && <p className="text-xs text-ink-faint mt-1 font-mono">Uploading...</p>}
          {form.cover_image && (
            <button type="button"
                    className="text-xs text-accent hover:text-accent-dark mt-2 font-mono uppercase tracking-wider"
                    onClick={() => setForm((f) => ({ ...f, cover_image: null }))}>
              Remove image
            </button>
          )}
        </div>

        <div className="flex gap-8 items-end">
          <div className="flex-1">
            <label className="label" htmlFor="sort_order">Sort order</label>
            <input id="sort_order" type="number" className="input"
                   value={form.sort_order ?? 0}
                   onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))} />
            <p className="text-xs text-ink-faint mt-1 font-mono">lower = earlier</p>
          </div>
          <label className="flex items-center gap-3 pb-3 cursor-pointer">
            <input type="checkbox"
                   checked={form.is_published ?? true}
                   onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                   className="w-4 h-4 accent-ink" />
            <span className="font-mono text-sm uppercase tracking-wider text-ink">Published</span>
          </label>
        </div>

        {error && (
          <p className="font-mono text-xs text-accent border-l-2 border-accent pl-3">{error}</p>
        )}

        <div className="flex gap-3 pt-4 border-t border-ink/15">
          <button type="submit" className="btn-primary" disabled={saveM.isPending}>
            {saveM.isPending ? 'Saving...' : editing ? 'Save changes' : 'Create'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/admin')}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
