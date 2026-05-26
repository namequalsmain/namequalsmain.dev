import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { profileApi } from '@/api/profile';
import { ProjectRow } from '@/components/ProjectRow';
import { Loading, ErrorBox } from '@/components/Loading';
import type { Profile } from '@/api/types';

export function Home() {
  const profileQ = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });
  const projectsQ = useQuery({
    queryKey: ['projects', 'public'],
    queryFn: projectsApi.listPublic,
  });

  return (
    <main className="mx-auto max-w-3xl px-8">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-32">
        {profileQ.isLoading && <Loading />}
        {profileQ.isError && <ErrorBox message="Couldn't load profile." />}
        {profileQ.data && (
          <>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-faint float-in">
              Hello —
            </p>
            <h1 className="mt-2 font-serif text-6xl md:text-8xl leading-[0.95] tracking-tightest float-in">
              {profileQ.data.name || 'namequalsmain'}
            </h1>
            {profileQ.data.headline && (
              <p className="mt-6 text-xl text-ink-muted max-w-xl float-in-delay">
                {profileQ.data.headline}
              </p>
            )}
            <ContactLinks profile={profileQ.data} />
          </>
        )}
      </section>

      <div className="rule" />

      {/* ── About (bio) ──────────────────────────────────────────────────── */}
      {profileQ.data?.bio && (
        <section id="about" className="py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-6">
            01 — About
          </p>
          <p className="font-serif text-2xl md:text-3xl text-ink leading-snug whitespace-pre-line max-w-2xl">
            {profileQ.data.bio}
          </p>
        </section>
      )}

      {profileQ.data?.bio && <div className="rule" />}

      {/* ── Projects ─────────────────────────────────────────────────────── */}
      <section id="work" className="py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-6">
          {profileQ.data?.bio ? '02' : '01'} — Selected work
        </p>
        {projectsQ.isLoading && <Loading />}
        {projectsQ.isError && <ErrorBox message="Couldn't load projects." />}
        {projectsQ.data && projectsQ.data.length === 0 && (
          <p className="font-serif italic text-ink-muted">No projects yet.</p>
        )}
        {projectsQ.data && projectsQ.data.length > 0 && (
          <div className="mt-8">
            {projectsQ.data.map((p, i) => (
              <ProjectRow key={p.id} project={p} index={i} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}


function ContactLinks({ profile }: { profile: Profile }) {
  const links: { label: string; href: string }[] = [];
  if (profile.email) links.push({ label: 'Email', href: `mailto:${profile.email}` });
  if (profile.telegram)
    links.push({ label: 'Telegram', href: `https://t.me/${profile.telegram.replace('@', '')}` });
  if (profile.github_url) links.push({ label: 'GitHub', href: profile.github_url });
  if (profile.linkedin_url) links.push({ label: 'LinkedIn', href: profile.linkedin_url });

  if (links.length === 0) return null;

  return (
    <div id="contact" className="mt-10 flex flex-wrap gap-x-6 gap-y-2 float-in-delay-2">
      {links.map(({ label, href }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="link font-mono text-sm uppercase tracking-wider"
        >
          {label} ↗
        </a>
      ))}
    </div>
  );
}
