import { Link, useParams } from 'react-router-dom';
import { projectBySlug } from '@/content/projects';
import { ErrorBox } from '@/components/Loading';

export function ProjectDetail() {
  const { slug = '' } = useParams();
  const project = projectBySlug(slug);

  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
      >
        ← Back
      </Link>

      {!project && <ErrorBox message="Project not found." />}

      {project && (
        <article className="mt-12 flex flex-col gap-10">
          <header>
            <h1 className="font-serif text-6xl md:text-7xl leading-[0.95] tracking-tightest">
              {project.title}
            </h1>
            {project.summary && (
              <p className="mt-4 text-xl text-ink-muted max-w-2xl leading-relaxed">
                {project.summary}
              </p>
            )}
          </header>

          {project.cover_image && (
            <img
              src={project.cover_image}
              alt={project.title}
              className="w-full border border-ink/15"
            />
          )}

          {/* Meta strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 py-4 border-y border-ink/15">
            {project.tech_stack.length > 0 && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
                  Stack
                </p>
                <p className="font-mono text-sm text-ink">
                  {project.tech_stack.join(' · ')}
                </p>
              </div>
            )}
            {project.github_url && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
                  Source
                </p>
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link font-mono text-sm"
                >
                  GitHub ↗
                </a>
              </div>
            )}
            {project.demo_url && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
                  Live
                </p>
                <a
                  href={project.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link font-mono text-sm"
                >
                  Open demo ↗
                </a>
              </div>
            )}
          </div>

          {project.description && (
            <div className="font-serif text-xl text-ink leading-relaxed whitespace-pre-line max-w-2xl">
              {project.description}
            </div>
          )}

          {project.gallery.length > 0 && (
            <section className="mt-4">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-4">
                Screenshots
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.gallery.map((src, i) => (
                  <a
                    key={src}
                    href={src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group border border-ink/15 bg-paper-dark
                               overflow-hidden hover:border-ink transition-colors"
                  >
                    <img
                      src={src}
                      alt={`${project.title} screenshot ${i + 1}`}
                      className="w-full h-full object-contain
                                 group-hover:scale-[1.01] transition-transform"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>
      )}
    </main>
  );
}
