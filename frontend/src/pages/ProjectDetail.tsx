import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { uploadUrl } from '@/api/client';
import { TechTag } from '@/components/TechTag';
import { Loading, ErrorBox } from '@/components/Loading';

export function ProjectDetail() {
  const { slug = '' } = useParams();
  const q = useQuery({
    queryKey: ['project', slug],
    queryFn: () => projectsApi.getBySlug(slug),
    retry: false,
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/" className="text-sm text-slate-500 hover:text-slate-300">
        ← Back to home
      </Link>

      {q.isLoading && <Loading />}
      {q.isError && <ErrorBox message="Project not found." />}

      {q.data && (
        <article className="mt-8 flex flex-col gap-6">
          <header>
            <h1 className="text-4xl text-slate-100">{q.data.title}</h1>
            <p className="mt-2 text-slate-400">{q.data.summary}</p>
          </header>

          {q.data.cover_image && (
            <img
              src={uploadUrl(q.data.cover_image)!}
              alt={q.data.title}
              className="w-full rounded-lg border border-slate-800"
            />
          )}

          {q.data.tech_stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {q.data.tech_stack.map((tech) => (
                <TechTag key={tech}>{tech}</TechTag>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {q.data.github_url && (
              <a href={q.data.github_url} target="_blank" rel="noopener noreferrer" className="btn-secondary">
                Source
              </a>
            )}
            {q.data.demo_url && (
              <a href={q.data.demo_url} target="_blank" rel="noopener noreferrer" className="btn-primary">
                Live demo
              </a>
            )}
          </div>

          {q.data.description && (
            <div className="prose prose-invert text-slate-300 whitespace-pre-line">
              {q.data.description}
            </div>
          )}
        </article>
      )}
    </main>
  );
}
