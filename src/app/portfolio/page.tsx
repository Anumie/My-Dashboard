"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, ExternalLink, Pencil, Globe } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn, formatDate } from "@/lib/utils";
import { Card, SectionTitle, PageHeader, EmptyState, StatusBadge, TagPill, Modal } from "@/components/ui/index";
import type { Project, ProjectStatus, ProjectType } from "@/types";

const TYPE_TABS: { value: ProjectType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "project", label: "Projects" },
  { value: "post", label: "Posts" },
];

const STATUS_OPTIONS: ProjectStatus[] = ["idea", "draft", "published"];

const defaultForm = {
  title: "",
  description: "",
  type: "project" as ProjectType,
  tags: "",
  status: "idea" as ProjectStatus,
  link: "",
  featured: false,
};

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeType, setActiveType] = useState<ProjectType | "all">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then(setProjects);
  }, []);

  function openAdd() {
    setForm(defaultForm);
    setEditing(null);
    setShowAdd(true);
  }

  function openEdit(project: Project) {
    setForm({
      title: project.title,
      description: project.description ?? "",
      type: project.type,
      tags: project.tags.join(", "),
      status: project.status,
      link: project.link ?? "",
      featured: project.featured,
    });
    setEditing(project);
    setShowAdd(true);
  }

  async function submit() {
    if (!form.title.trim()) return;
    const payload = {
      ...form,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    if (editing) {
      const res = await fetch("/api/projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editing.id, ...payload }),
      });
      const updated = await res.json();
      setProjects((prev) => prev.map((p) => (p.id === editing.id ? updated : p)));
      toast.success("Updated!");
    } else {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const project = await res.json();
      setProjects((prev) => [...prev, project]);
      toast.success("Added!");
    }
    setShowAdd(false);
  }

  async function deleteProject(id: number) {
    await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  const filtered = activeType === "all" ? projects : projects.filter((p) => p.type === activeType);
  const publishedCount = projects.filter((p) => p.status === "published").length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Portfolio & Content"
        subtitle={`${publishedCount} published · ${projects.length} total`}
        action={
          <div className="flex gap-2">
            <Link href="/portfolio/public" target="_blank"
              className="btn-secondary flex items-center gap-1.5 text-sm">
              <Globe className="w-3.5 h-3.5" /> Public Page
            </Link>
            <button onClick={openAdd} className="btn-primary flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {["idea", "draft", "published"].map((status) => {
          const count = projects.filter((p) => p.status === status).length;
          return (
            <Card key={status} className="text-center py-3">
              <p className="text-2xl font-bold text-stone-800">{count}</p>
              <p className="text-xs text-stone-400 capitalize">{status}</p>
            </Card>
          );
        })}
        <Card className="text-center py-3">
          <p className="text-2xl font-bold text-stone-800">{projects.filter((p) => p.featured).length}</p>
          <p className="text-xs text-stone-400">Featured</p>
        </Card>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 mb-4 bg-stone-100 rounded-xl p-1 w-fit">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveType(tab.value)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm transition-all",
              activeType === tab.value
                ? "bg-white text-stone-700 shadow-sm font-medium"
                : "text-stone-500 hover:text-stone-700"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Project cards */}
      {filtered.length === 0 ? (
        <EmptyState icon="✨" message="Nothing here yet — add your first item!" action={
          <button onClick={openAdd} className="btn-secondary">Add First Item</button>
        } />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((project) => (
            <Card key={project.id} className="group relative">
              {project.featured && (
                <div className="absolute top-3 right-3 text-sand-400 text-xs">⭐ featured</div>
              )}
              <div className="flex items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 leading-tight">{project.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={project.status} />
                    <span className="text-[10px] text-stone-400 capitalize">{project.type}</span>
                  </div>
                </div>
              </div>

              {project.description && (
                <p className="text-xs text-stone-500 mb-3 line-clamp-2">{project.description}</p>
              )}

              {project.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.map((tag) => <TagPill key={tag} label={tag} />)}
                </div>
              )}

              <div className="flex items-center gap-2 mt-auto">
                {project.link && (
                  <a href={project.link} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1 transition-colors">
                    <ExternalLink className="w-3 h-3" /> Visit
                  </a>
                )}
                <div className="ml-auto flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(project)} className="btn-ghost py-1 px-2 text-xs">
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button onClick={() => deleteProject(project.id)} className="btn-danger py-1 px-2 text-xs">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        title={editing ? "Edit Item" : "Add Item"}
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Title</label>
            <input type="text" className="input-base" placeholder="Project or post title…"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Description</label>
            <textarea className="textarea-base" rows={2} placeholder="Brief description…"
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Type</label>
              <select className="input-base" value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as ProjectType })}>
                <option value="project">Project</option>
                <option value="post">Post</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Status</label>
              <select className="input-base" value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectStatus })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Tags (comma-separated)</label>
            <input type="text" className="input-base" placeholder="react, design, writing…"
              value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Link (optional)</label>
            <input type="url" className="input-base" placeholder="https://…"
              value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured}
              onChange={(e) => setForm({ ...form, featured: e.target.checked })}
              className="rounded" />
            <span className="text-sm text-stone-600">Featured on public page</span>
          </label>
          <button onClick={submit} className="btn-primary w-full">
            {editing ? "Save Changes" : "Add Item"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
