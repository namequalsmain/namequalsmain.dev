import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { uploadUrl } from '@/api/client';
import { Loading, ErrorBox } from '@/components/Loading';

export function ProjectDetail() {
  const { slug = '' } = useParams();
  const q = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectsApi.getBySlug(slug),
    retry: false,
  });

  return (
    <main className="mx-auto max-w-3xl px-8 py-16">
      <Link
        to="/"
        className="font-mono text-xs uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
      >
        ← Back
      </Link>

      {q.isLoading && <Loading />}
      {q.isError && <ErrorBox message="Project not found." />}

      {q.data && (
        <article className="mt-12 flex flex-col gap-10">
          <header>
            <h1 className="font-serif text-6xl md:text-7xl leading-[0.95] tracking-tightest">
              {q.data.title}
            </h1>
            {q.data.summary && (
              <p className="mt-4 text-xl text-ink-muted max-w-2xl leading-relaxed">
                {q.data.summary}
              </p>
            )}
          </header>

          {q.data.cover_image && (
            <img
              src={uploadUrl(q.data.cover_image)!}
              alt={q.data.title}
              className="w-full border border-ink/15"
            />
          )}

          {/* Meta strip */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 py-4 border-y border-ink/15">
            {q.data.tech_stack.length > 0 && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
                  Stack
                </p>
                <p className="font-mono text-sm text-ink">
                  {q.data.tech_stack.join(' · ')}
                </p>
              </div>
            )}
            {q.data.github_url && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
                  Source
                </p>
                <a
                  href={q.data.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link font-mono text-sm"
                >
                  GitHub ↗
                </a>
              </div>
            )}
            {q.data.demo_url && (
              <div>
                <p className="font-mono text-xs uppercase tracking-widest text-ink-faint mb-1">
                  Live
                </p>
                <a
                  href={q.data.demo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link font-mono text-sm"
                >
                  Open demo ↗
                </a>
              </div>
            )}
          </div>

          {q.data.description && (
            <div className="font-serif text-xl text-ink leading-relaxed whitespace-pre-line max-w-2xl">
              {q.data.description}
            </div>
          )}
        </article>
      )}
    </main>
  );
}
