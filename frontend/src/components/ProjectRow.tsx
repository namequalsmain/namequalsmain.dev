import { Link } from 'react-router-dom';
import type { Project } from '@/content/types';

/**
 * One project as a numbered editorial row.
 *
 *   01  →  Project Title
 *          Short summary describing what it is.
 *          /python /fastapi /docker
 */
export function ProjectRow({ project, index }: { project: Project; index: number }) {
  const num = String(index + 1).padStart(2, '0');
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group block py-8 border-t border-ink/15 first:border-t-0
                 transition-colors hover:bg-paper-dark/40 -mx-4 px-4"
    >
      <div className="flex gap-8 items-baseline">
        <span className="font-mono text-sm text-ink-faint shrink-0 mt-1">
          {num}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-3xl md:text-4xl text-ink
                         group-hover:italic group-hover:text-accent
                         transition-all duration-300">
            {project.title}
          </h3>
          {project.summary && (
            <p className="mt-2 text-ink-muted max-w-xl leading-relaxed">
              {project.summary}
            </p>
          )}
          {project.tech_stack.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-3">
              {project.tech_stack.slice(0, 8).map((tech) => (
                <span key={tech} className="font-mono text-xs text-ink-faint">
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
        <span
          aria-hidden="true"
          className="font-serif italic text-2xl text-ink-faint
                     group-hover:text-accent group-hover:translate-x-1
                     transition-all duration-300 shrink-0"
        >
          →
        </span>
      </div>
    </Link>
  );
}
