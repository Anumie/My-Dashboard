"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Plus, Trash2, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn, calcProgress } from "@/lib/utils";
import { Card, SectionTitle, PageHeader, ProgressBar, EmptyState, Modal } from "@/components/ui/index";
import type { BucketListItem, BucketCategory, Priority } from "@/types";

const CATEGORIES: { name: BucketCategory; icon: string; color: string }[] = [
  { name: "Travel", icon: "✈️", color: "#dc8f2a" },
  { name: "Experience", icon: "🎉", color: "#ed856e" },
  { name: "Career", icon: "💼", color: "#78716c" },
  { name: "Personal", icon: "🌱", color: "#7da07a" },
  { name: "Health", icon: "💪", color: "#5c8259" },
  { name: "Creative", icon: "🎨", color: "#e4a84d" },
  { name: "Financial", icon: "💰", color: "#a35b1b" },
];

const PRIORITIES: { value: Priority; label: string }[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function BucketListPage() {
  const [items, setItems] = useState<BucketListItem[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [activeCategory, setActiveCategory] = useState<BucketCategory | "all">("all");
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<BucketCategory>("Travel");
  const [newPriority, setNewPriority] = useState<Priority>("medium");
  const [newNotes, setNewNotes] = useState("");

  useEffect(() => {
    fetch("/api/bucket-list").then((r) => r.json()).then(setItems);
  }, []);

  async function addItem() {
    if (!newTitle.trim()) return;
    const res = await fetch("/api/bucket-list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, category: newCategory, priority: newPriority, notes: newNotes }),
    });
    const item = await res.json();
    setItems((prev) => [...prev, item]);
    setNewTitle("");
    setNewNotes("");
    setShowAdd(false);
    toast.success("Added to bucket list! 🎯");
  }

  async function toggleItem(item: BucketListItem) {
    const now = format(new Date(), "yyyy-MM-dd");
    const res = await fetch("/api/bucket-list", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        completed: !item.completed,
        completedDate: !item.completed ? now : null,
      }),
    });
    const updated = await res.json();
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
    if (!item.completed) toast.success("Bucket list item completed! 🎉");
  }

  async function deleteItem(id: number) {
    await fetch(`/api/bucket-list?id=${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const totalCompleted = items.filter((i) => i.completed).length;
  const totalItems = items.length;

  const displayItems =
    activeCategory === "all"
      ? items
      : items.filter((i) => i.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <PageHeader
        title="Bucket List"
        subtitle={`${totalCompleted} of ${totalItems} completed`}
        action={
          <button onClick={() => setShowAdd(true)} className="btn-primary flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        }
      />

      {/* Overall progress */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-stone-700">Overall Progress</p>
          <p className="text-2xl font-bold text-stone-800">{calcProgress(totalCompleted, totalItems)}%</p>
        </div>
        <ProgressBar value={totalCompleted} max={totalItems} color="#dc8f2a" className="h-3" />

        {/* Category breakdown */}
        <div className="grid grid-cols-7 gap-2 mt-4">
          {CATEGORIES.map((cat) => {
            const catItems = items.filter((i) => i.category === cat.name);
            const catDone = catItems.filter((i) => i.completed).length;
            return (
              <div key={cat.name} className="text-center">
                <p className="text-xl mb-1">{cat.icon}</p>
                <p className="text-[10px] text-stone-500 font-medium">{catDone}/{catItems.length}</p>
                <div className="mt-1 h-1 rounded-full bg-stone-100 overflow-hidden">
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${calcProgress(catDone, catItems.length)}%`, backgroundColor: cat.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Category filter tabs */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "text-xs px-3 py-1.5 rounded-lg transition-colors",
            activeCategory === "all" ? "bg-stone-700 text-cream" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
          )}
        >
          All ({items.length})
        </button>
        {CATEGORIES.map((cat) => {
          const catItems = items.filter((i) => i.category === cat.name);
          return (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                "text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1",
                activeCategory === cat.name ? "text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              )}
              style={activeCategory === cat.name ? { backgroundColor: cat.color } : {}}
            >
              {cat.icon} {cat.name} ({catItems.length})
            </button>
          );
        })}
      </div>

      {/* Items list */}
      {displayItems.length === 0 ? (
        <EmptyState icon="🎯" message="No items yet in this category" action={
          <button onClick={() => setShowAdd(true)} className="btn-secondary">Add Your First Item</button>
        } />
      ) : (
        <div className="space-y-2">
          {/* Incomplete */}
          {displayItems.filter((i) => !i.completed).map((item) => (
            <BucketItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
          ))}

          {/* Completed section */}
          {displayItems.some((i) => i.completed) && (
            <>
              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-stone-200" />
                <span className="text-xs text-stone-400">Completed</span>
                <div className="flex-1 h-px bg-stone-200" />
              </div>
              {displayItems.filter((i) => i.completed).map((item) => (
                <BucketItem key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Bucket List Item">
        <div className="space-y-3">
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Title</label>
            <input
              type="text"
              className="input-base"
              placeholder="What do you want to do?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Category</label>
              <select className="input-base" value={newCategory} onChange={(e) => setNewCategory(e.target.value as BucketCategory)}>
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-stone-400 mb-1 block">Priority</label>
              <select className="input-base" value={newPriority} onChange={(e) => setNewPriority(e.target.value as Priority)}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Notes (optional)</label>
            <textarea className="textarea-base" rows={2} placeholder="Any details…" value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
          </div>
          <button onClick={addItem} className="btn-primary w-full">Add to Bucket List</button>
        </div>
      </Modal>
    </div>
  );
}

function BucketItem({
  item,
  onToggle,
  onDelete,
}: {
  item: BucketListItem;
  onToggle: (item: BucketListItem) => void;
  onDelete: (id: number) => void;
}) {
  const cat = CATEGORIES.find((c) => c.name === item.category);
  const priorityColor = item.priority === "high" ? "bg-clay-100 text-clay-600" : item.priority === "low" ? "bg-stone-100 text-stone-400" : "bg-sand-100 text-sand-600";

  return (
    <div className={cn("card flex items-center gap-3 group transition-all", item.completed && "opacity-60")}>
      <button
        onClick={() => onToggle(item)}
        className={cn(
          "w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all",
          item.completed ? "border-transparent bg-sage-400" : "border-stone-300 hover:border-stone-400"
        )}
      >
        {item.completed && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
      </button>

      <span className="text-lg">{cat?.icon}</span>

      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium text-stone-700", item.completed && "line-through")}>{item.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-stone-400">{item.category}</span>
          <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", priorityColor)}>{item.priority}</span>
          {item.completed && item.completedDate && (
            <span className="text-[10px] text-stone-300">✓ {item.completedDate}</span>
          )}
        </div>
        {item.notes && <p className="text-xs text-stone-400 mt-0.5">{item.notes}</p>}
      </div>

      <button
        onClick={() => onDelete(item.id)}
        className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-clay-400 transition-all"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
