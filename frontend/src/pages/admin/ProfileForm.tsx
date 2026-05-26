import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';
import { Loading, ErrorBox } from '@/components/Loading';
import type { Profile } from '@/api/types';

const EMPTY: Profile = {
  name: '', headline: '', bio: '',
  email: null, telegram: null, github_url: null, linkedin_url: null,
};

export function AdminProfileForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Profile>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const profileQ = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });
  useEffect(() => { if (profileQ.data) setForm(profileQ.data); }, [profileQ.data]);

  const saveM = useMutation({
    mutationFn: () =>
      profileApi.update({
        ...form,
        email: form.email || null,
        telegram: form.telegram || null,
        github_url: form.github_url || null,
        linkedin_url: form.linkedin_url || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['profile'] });
      navigate('/admin');
    },
    onError: (err: any) => setError(err.response?.data?.detail || 'Save failed.'),
  });

  if (profileQ.isLoading) return <main className="mx-auto max-w-2xl px-8 py-16"><Loading /></main>;
  if (profileQ.isError) return <main className="mx-auto max-w-2xl px-8 py-16"><ErrorBox message="Couldn't load profile." /></main>;

  const text = (k: keyof Profile) => ({
    value: (form[k] ?? '') as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  return (
    <main className="mx-auto max-w-2xl px-8 py-16">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-2">Editing</p>
      <h1 className="font-serif text-5xl tracking-tightest mb-12">Profile</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); saveM.mutate(); }}
        className="flex flex-col gap-8"
      >
        <div>
          <label className="label">Name</label>
          <input className="input" {...text('name')} />
        </div>
        <div>
          <label className="label">Headline</label>
          <input className="input" {...text('headline')} maxLength={255}
                 placeholder="Python developer in Israel" />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-[140px] font-sans" {...text('bio')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" {...text('email')} />
        </div>
        <div>
          <label className="label">Telegram</label>
          <input className="input" {...text('telegram')} placeholder="username (without @)" />
        </div>
        <div>
          <label className="label">GitHub URL</label>
          <input className="input" {...text('github_url')} placeholder="https://github.com/..." />
        </div>
        <div>
          <label className="label">LinkedIn URL</label>
          <input className="input" {...text('linkedin_url')} />
        </div>

        {error && (
          <p className="font-mono text-xs text-accent border-l-2 border-accent pl-3">{error}</p>
        )}

        <div className="flex gap-3 pt-4 border-t border-ink/15">
          <button type="submit" className="btn-primary" disabled={saveM.isPending}>
            {saveM.isPending ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn-ghost" onClick={() => navigate('/admin')}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
