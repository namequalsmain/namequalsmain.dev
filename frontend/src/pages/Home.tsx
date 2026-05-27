import { profile } from '@/content/profile';
import { publishedProjects } from '@/content/projects';
import { ProjectRow } from '@/components/ProjectRow';
import type { Profile } from '@/content/types';

export function Home() {
  const items = publishedProjects();

  return (
    <main className="mx-auto max-w-3xl px-8">
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-24 pb-32">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint float-in">
          Hello —
        </p>
        <h1 className="mt-2 font-serif text-6xl md:text-8xl leading-[0.95] tracking-tightest float-in">
          {profile.name}
        </h1>
        {profile.headline && (
          <p className="mt-6 text-xl text-ink-muted max-w-xl float-in-delay">
            {profile.headline}
          </p>
        )}
        <ContactLinks profile={profile} />
      </section>

      <div className="rule" />

      {/* ── About ────────────────────────────────────────────────────────── */}
      {profile.bio && (
        <section id="about" className="py-20">
          <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-6">
            01 — About
          </p>
          <p className="font-serif text-2xl md:text-3xl text-ink leading-snug whitespace-pre-line max-w-2xl">
            {profile.bio}
          </p>
        </section>
      )}

      {profile.bio && <div className="rule" />}

      {/* ── Selected work ────────────────────────────────────────────────── */}
      <section id="work" className="py-20">
        <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-6">
          {profile.bio ? '02' : '01'} — Selected work
        </p>
        {items.length === 0 && (
          <p className="font-serif italic text-ink-muted">No projects yet.</p>
        )}
        {items.length > 0 && (
          <div className="mt-8">
            {items.map((p, i) => (
              <ProjectRow key={p.slug} project={p} index={i} />
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
