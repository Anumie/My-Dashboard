export const dynamic = "force-dynamic";
import { db } from "@/lib/db";
import { projects } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ExternalLink, ArrowLeft } from "lucide-react";


async function getPublishedProjects() {
  return db.select().from(projects).where(eq(projects.status, "published")).orderBy(projects.createdAt);
}

export default async function PublicPortfolioPage() {
  const allProjects = await getPublishedProjects();
  const featured = allProjects.filter((p) => p.featured);
  const postItems = allProjects.filter((p) => p.type === "post");
  const projectItems = allProjects.filter((p) => p.type === "project");

  return (
    <div className="min-h-screen bg-cream">
      <nav className="border-b border-stone-200/60 px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
          </Link>
          <span className="text-sm font-medium text-stone-600">Portfolio</span>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-8 py-16">
        <div className="mb-16">
          <h1 className="text-4xl font-semibold text-stone-800 tracking-tight mb-3">Work & Writing</h1>
          <p className="text-stone-500 text-lg">A collection of projects and posts.</p>
        </div>

        {featured.length > 0 && (
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Featured</p>
            <div className="space-y-4">
              {featured.map((project) => <ProjectCard key={project.id} project={project} large />)}
            </div>
          </section>
        )}

        {projectItems.filter((p) => !p.featured).length > 0 && (
          <section className="mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Projects</p>
            <div className="space-y-3">
              {projectItems.filter((p) => !p.featured).map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </section>
        )}

        {postItems.filter((p) => !p.featured).length > 0 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-5">Writing</p>
            <div className="space-y-3">
              {postItems.filter((p) => !p.featured).map((project) => <ProjectCard key={project.id} project={project} />)}
            </div>
          </section>
        )}

        {allProjects.length === 0 && (
          <div className="text-center py-20 text-stone-400">
            <p className="text-4xl mb-4">✦</p>
            <p>No published work yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project, large = false }: { project: any; large?: boolean }) {
  const Wrapper = project.link ? "a" : "div";
  const wrapperProps = project.link ? { href: project.link, target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <Wrapper {...wrapperProps}
      className={`group block p-5 rounded-2xl border border-stone-200/60 bg-white/50 hover:bg-white/80 hover:border-stone-300 transition-all ${large ? "p-6" : ""}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-stone-800 group-hover:text-stone-900 transition-colors ${large ? "text-xl" : "text-base"}`}>
            {project.title}
          </p>
          {project.description && (
            <p className="text-stone-500 text-sm mt-1.5 leading-relaxed line-clamp-2">{project.description}</p>
          )}
          {project.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {project.tags.map((tag: string) => (
                <span key={tag} className="text-[11px] px-2 py-0.5 bg-stone-100 text-stone-500 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
        {project.link && <ExternalLink className="w-4 h-4 text-stone-300 group-hover:text-stone-500 transition-colors flex-shrink-0 mt-0.5" />}
      </div>
    </Wrapper>
  );
}
