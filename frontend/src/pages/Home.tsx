import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { profileApi } from '@/api/profile';
import { ProjectCard } from '@/components/ProjectCard';
import { Loading, ErrorBox } from '@/components/Loading';

export function Home() {
  const profileQ = useQuery({ queryKey: ['profile'], queryFn: profileApi.get });
  const projectsQ = useQuery({ queryKey: ['projects', 'public'], queryFn: projectsApi.listPublic });

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="py-16">
        {profileQ.isLoading && <Loading />}
        {profileQ.isError && <ErrorBox message="Couldn't load profile." />}
        {profileQ.data && (
          <>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-100">
              {profileQ.data.name || 'namequalsmain'}
            </h1>
            <p className="mt-4 text-xl text-slate-400 max-w-2xl">
              {profileQ.data.headline || 'Developer building things with code.'}
            </p>
            {profileQ.data.bio && (
              <p className="mt-6 text-slate-300 max-w-2xl whitespace-pre-line">
                {profileQ.data.bio}
              </p>
            )}
            <ContactLinks profile={profileQ.data} />
          </>
        )}
      </section>

      {/* ── Projects ─────────────────────────────────────────────────────── */}
      <section id="projects" className="py-12">
        <h2 className="text-2xl text-slate-100 mb-6">Projects</h2>
        {projectsQ.isLoading && <Loading />}
        {projectsQ.isError && <ErrorBox message="Couldn't load projects." />}
        {projectsQ.data && projectsQ.data.length === 0 && (
          <p className="text-slate-500 italic">No projects yet.</p>
        )}
        {projectsQ.data && projectsQ.data.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2">
            {projectsQ.data.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function ContactLinks({ profile }: { profile: { email: string | null; telegram: string | null; github_url: string | null; linkedin_url: string | null } }) {
  const links: { label: string; href: string }[] = [];
  if (profile.email) links.push({ label: 'Email', href: `mailto:${profile.email}` });
  if (profile.telegram) links.push({ label: 'Telegram', href: `https://t.me/${profile.telegram.replace('@', '')}` });
  if (profile.github_url) links.push({ label: 'GitHub', href: profile.github_url });
  if (profile.linkedin_url) links.push({ label: 'LinkedIn', href: profile.linkedin_url });

  if (links.length === 0) return null;
  return (
    <div id="contact" className="mt-8 flex flex-wrap gap-4">
      {links.map(({ label, href }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          {label}
        </a>
      ))}
    </div>
  );
}
