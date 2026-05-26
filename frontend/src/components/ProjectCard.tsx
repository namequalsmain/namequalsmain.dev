import { Link } from 'react-router-dom';
import { uploadUrl } from '@/api/client';
import type { Project } from '@/api/types';
import { TechTag } from './TechTag';

export function ProjectCard({ project }: { project: Project }) {
  const cover = uploadUrl(project.cover_image);
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group card flex flex-col gap-4 hover:border-accent transition-colors"
    >
      {cover && (
        <div className="aspect-video overflow-hidden rounded-md border border-slate-800 bg-slate-950">
          <img
            src={cover}
            alt={project.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <h3 className="text-xl text-slate-100 group-hover:text-accent transition-colors">
          {project.title}
        </h3>
        <p className="text-slate-400 text-sm">{project.summary}</p>
        {project.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {project.tech_stack.slice(0, 6).map((tech) => (
              <TechTag key={tech}>{tech}</TechTag>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
