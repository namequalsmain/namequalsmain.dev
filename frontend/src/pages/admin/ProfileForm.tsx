import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '@/api/profile';
import { Loading, ErrorBox } from '@/components/Loading';
import type { Profile } from '@/api/types';

const EMPTY: Profile = {
  name: '',
  headline: '',
  bio: '',
  email: null,
  telegram: null,
  github_url: null,
  linkedin_url: null,
};

export function AdminProfileForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState<Profile>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  const profileQ = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });
  useEffect(() => {
    if (profileQ.data) setForm(profileQ.data);
  }, [profileQ.data]);

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

  if (profileQ.isLoading) return <Loading />;
  if (profileQ.isError) return <ErrorBox message="Couldn't load profile." />;

  const text = (k: keyof Profile) => ({
    value: (form[k] ?? '') as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value })),
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-2xl text-slate-100 mb-6">Edit profile</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveM.mutate();
        }}
        className="card flex flex-col gap-4"
      >
        <div>
          <label className="label">Name</label>
          <input className="input" {...text('name')} />
        </div>
        <div>
          <label className="label">Headline (one line)</label>
          <input className="input" {...text('headline')} maxLength={255} />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea className="input min-h-[120px]" {...text('bio')} />
        </div>
        <div>
          <label className="label">Email</label>
          <input type="email" className="input" {...text('email')} />
        </div>
        <div>
          <label className="label">Telegram (without @)</label>
          <input className="input" {...text('telegram')} placeholder="username" />
        </div>
        <div>
          <label className="label">GitHub URL</label>
          <input className="input" {...text('github_url')} placeholder="https://github.com/..." />
        </div>
        <div>
          <label className="label">LinkedIn URL</label>
          <input className="input" {...text('linkedin_url')} />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={saveM.isPending}>
            {saveM.isPending ? 'Saving...' : 'Save'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => navigate('/admin')}>
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
