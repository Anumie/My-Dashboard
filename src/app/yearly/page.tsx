"use client";

import { useState, useEffect } from "react";
import { getYear } from "date-fns";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Card, SectionTitle, PageHeader, EmptyState } from "@/components/ui/index";
import type { YearlyReflection, YearBucket, Goal } from "@/types";

const GOAL_CATEGORIES = ["Finance", "Health", "Business", "Personal"] as const;
const CATEGORY_COLORS: Record<string, string> = {
  Finance: "#dc8f2a",
  Health: "#7da07a",
  Business: "#78716c",
  Personal: "#ed856e",
};

const REFLECTION_QUESTIONS = [
  { key: "focusWord" as const, label: "Word / Theme of the Year", placeholder: "What one word captures your intention for this year?" },
  { key: "vision" as const, label: "Vision", placeholder: "What does your ideal life look like at the end of this year?" },
  { key: "nonNegotiables" as const, label: "Non-Negotiables", placeholder: "What commitments will you never compromise on?" },
  { key: "whatToChange" as const, label: "What to Change", placeholder: "What habits or patterns are you leaving behind?" },
];

export default function YearlyPage() {
  const currentYear = getYear(new Date());
  const [year, setYear] = useState(currentYear);
  const [reflection, setReflection] = useState<Partial<YearlyReflection>>({});
  const [goals, setGoals] = useState<Goal[]>([]);
  const [buckets, setBuckets] = useState<YearBucket[]>([]);
  const [saving, setSaving] = useState(false);
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState("Personal");

  useEffect(() => {
    Promise.all([
      fetch(`/api/yearly?year=${year}`).then((r) => r.json()),
      fetch(`/api/goals?scope=yearly&year=${year}`).then((r) => r.json()),
    ]).then(([reflData, goalsData]) => {
      if (reflData) {
        setReflection(reflData);
        setBuckets(reflData.yearBuckets ?? []);
      } else {
        setReflection({});
        setBuckets([]);
      }
      setGoals(goalsData);
    });
  }, [year]);

  function updateField(key: keyof YearlyReflection, value: string) {
    setReflection((prev) => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/yearly", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ year, ...reflection, yearBuckets: buckets }),
    });
    setSaving(false);
    toast.success("Saved ✓");
  }

  async function addGoal() {
    if (!newGoalText.trim()) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newGoalText, category: newGoalCategory, scope: "yearly", year }),
    });
    const goal = await res.json();
    setGoals((prev) => [...prev, goal]);
    setNewGoalText("");
  }

  async function toggleGoal(goal: Goal) {
    const res = await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: goal.id, completed: !goal.completed }),
    });
    const updated = await res.json();
    setGoals((prev) => prev.map((g) => (g.id === goal.id ? updated : g)));
  }

  async function deleteGoal(id: number) {
    await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  function addBucket() {
    setBuckets((prev) => [...prev, { theme: "New Bucket", items: [] }]);
  }

  function updateBucket(i: number, key: "theme" | "items", value: any) {
    setBuckets((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], [key]: value };
      return next;
    });
  }

  function addBucketItem(bucketIndex: number, text: string) {
    if (!text.trim()) return;
    setBuckets((prev) => {
      const next = [...prev];
      next[bucketIndex] = { ...next[bucketIndex], items: [...next[bucketIndex].items, text] };
      return next;
    });
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Yearly View</h1>
          <div className="flex gap-2 mt-1">
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <button key={y} onClick={() => setYear(y)}
                className={cn("text-xs px-2.5 py-1 rounded-lg transition-colors",
                  year === y ? "bg-stone-700 text-cream" : "text-stone-500 hover:bg-stone-100"
                )}>{y}</button>
            ))}
          </div>
        </div>
        <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-1.5">
          <Save className="w-3.5 h-3.5" />
          {saving ? "Saving…" : "Save All"}
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Left: Reflection Questions */}
        <div className="col-span-3 space-y-4">
          {/* Focus word */}
          <Card parchment>
            <div className="text-center py-2">
              <p className="text-xs text-stone-400 uppercase tracking-widest mb-2">
                {year} Word of the Year
              </p>
              <input
                type="text"
                className="text-4xl font-semibold text-stone-700 text-center bg-transparent border-none outline-none focus:outline-none w-full placeholder:text-stone-300"
                placeholder="Clarity"
                value={reflection.focusWord ?? ""}
                onChange={(e) => updateField("focusWord", e.target.value)}
              />
            </div>
          </Card>

          {REFLECTION_QUESTIONS.slice(1).map((q) => (
            <Card key={q.key}>
              <SectionTitle>{q.label}</SectionTitle>
              <textarea
                className="textarea-base"
                rows={4}
                placeholder={q.placeholder}
                value={(reflection[q.key] as string) ?? ""}
                onChange={(e) => updateField(q.key, e.target.value)}
              />
            </Card>
          ))}

          {/* Year Buckets */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <SectionTitle className="mb-0">Year Buckets</SectionTitle>
              <button onClick={addBucket} className="btn-ghost text-xs flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Bucket
              </button>
            </div>
            {buckets.length === 0 ? (
              <EmptyState icon="🪣" message="Create themed buckets for your year — e.g. Travel, Projects, Learning" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {buckets.map((bucket, i) => (
                  <BucketCard key={i} bucket={bucket}
                    onUpdateTheme={(theme) => updateBucket(i, "theme", theme)}
                    onAddItem={(text) => addBucketItem(i, text)}
                    onRemoveItem={(j) => updateBucket(i, "items", bucket.items.filter((_, k) => k !== j))}
                    onRemove={() => setBuckets((prev) => prev.filter((_, k) => k !== i))}
                  />
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right: Yearly Goals */}
        <div className="col-span-2 space-y-4">
          <Card>
            <SectionTitle>Yearly Goals</SectionTitle>
            <div className="flex gap-2 mb-4">
              <select className="input-base w-28 text-xs" value={newGoalCategory} onChange={(e) => setNewGoalCategory(e.target.value)}>
                {GOAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="text" className="input-base flex-1 text-xs" placeholder="New goal…"
                value={newGoalText} onChange={(e) => setNewGoalText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addGoal()} />
              <button onClick={addGoal} className="btn-primary px-3">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {GOAL_CATEGORIES.map((cat) => {
              const catGoals = goals.filter((g) => g.category === cat);
              if (catGoals.length === 0) return null;
              return (
                <div key={cat} className="mb-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{cat}</span>
                  </div>
                  <div className="space-y-1.5">
                    {catGoals.map((goal) => (
                      <div key={goal.id} className="flex items-center gap-2 group">
                        <button onClick={() => toggleGoal(goal)}
                          className={cn("w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all",
                            goal.completed ? "border-transparent" : "border-stone-300")}
                          style={goal.completed ? { backgroundColor: CATEGORY_COLORS[cat] } : {}}>
                          {goal.completed && <span className="text-white text-[8px]">✓</span>}
                        </button>
                        <span className={cn("text-sm flex-1", goal.completed && "line-through text-stone-400")}>{goal.title}</span>
                        <button onClick={() => deleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-clay-400">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {goals.length === 0 && <EmptyState icon="🎯" message="Add your yearly goals above" />}
          </Card>
        </div>
      </div>
    </div>
  );
}

function BucketCard({
  bucket,
  onUpdateTheme,
  onAddItem,
  onRemoveItem,
  onRemove,
}: {
  bucket: YearBucket;
  onUpdateTheme: (t: string) => void;
  onAddItem: (t: string) => void;
  onRemoveItem: (i: number) => void;
  onRemove: () => void;
}) {
  const [newItem, setNewItem] = useState("");
  return (
    <div className="p-3 bg-parchment rounded-xl border border-stone-200/60">
      <div className="flex items-center gap-2 mb-2">
        <input
          className="text-sm font-semibold text-stone-700 bg-transparent border-none outline-none flex-1"
          value={bucket.theme}
          onChange={(e) => onUpdateTheme(e.target.value)}
        />
        <button onClick={onRemove} className="text-stone-300 hover:text-clay-400">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
      <ul className="space-y-1 mb-2">
        {bucket.items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5 group text-xs text-stone-600">
            <span className="text-stone-300">◦</span>
            <span className="flex-1">{item}</span>
            <button onClick={() => onRemoveItem(i)} className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-clay-400">×</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-1">
        <input
          className="input-base text-xs flex-1 py-1"
          placeholder="Add item…"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { onAddItem(newItem); setNewItem(""); } }}
        />
      </div>
    </div>
  );
}
