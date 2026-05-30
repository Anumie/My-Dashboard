"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { Plus, Settings, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { getWeekStart, formatWeekKey, navigateWeek, isCurrentWeek, todayKey, cn, calcProgress } from "@/lib/utils";
import { Card, SectionTitle, Modal, PageHeader, ProgressBar, EmptyState } from "@/components/ui/index";
import { ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react";
import type { HabitWithCompletions, Habit } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const ICONS = ["☀️","🏋️","📖","🧘","💧","🥗","🙏","✍️","🎯","💊","🌿","❤️","🎵","🛌","💪","🍎","🧠","🚶","🌅","✅"];
const COLORS = ["#7da07a","#dc8f2a","#ed856e","#78716c","#5c8259","#e4a84d","#a8a29e","#84491d","#27a9a9","#6b6b9e"];

export default function HabitsPage() {
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart());
  const [habits, setHabits] = useState<HabitWithCompletions[]>([]);
  const [loading, setLoading] = useState(true);
  const [showManage, setShowManage] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Partial<Habit> | null>(null);

  // New habit form
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("⭐");
  const [newColor, setNewColor] = useState("#7da07a");
  const [newGoal, setNewGoal] = useState(7);
  const [newSection, setNewSection] = useState("daily");

  const weekKey = formatWeekKey(weekStart);
  const weekEnd = addDays(weekStart, 6);
  const isCurrent = isCurrentWeek(weekStart);

  const fetchHabits = useCallback(async () => {
    setLoading(true);
    const res = await fetch(
      `/api/habits?from=${weekKey}&to=${format(weekEnd, "yyyy-MM-dd")}`
    );
    const data = await res.json();
    setHabits(data);
    setLoading(false);
  }, [weekKey]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  async function toggleHabit(habitId: number, dateStr: string) {
    const res = await fetch("/api/habits/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date: dateStr }),
    });
    const { completed } = await res.json();
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        return {
          ...h,
          completions: completed
            ? [...h.completions, dateStr]
            : h.completions.filter((d) => d !== dateStr),
        };
      })
    );
  }

  async function createHabit() {
    if (!newName.trim()) return;
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, icon: newIcon, color: newColor, goal: newGoal, section: newSection }),
    });
    const habit = await res.json();
    setHabits((prev) => [...prev, { ...habit, completions: [] }]);
    setNewName("");
    toast.success("Habit added!");
  }

  async function deleteHabit(id: number) {
    if (!confirm("Delete this habit?")) return;
    await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
    setHabits((prev) => prev.filter((h) => h.id !== id));
    toast.success("Habit deleted");
  }

  // Calculate overall completion score for the week
  const totalPossible = habits.reduce((sum, h) => sum + h.goal, 0);
  const totalCompleted = habits.reduce((sum, h) => {
    const weekDays = DAYS.map((_, i) => format(addDays(weekStart, i), "yyyy-MM-dd"));
    return sum + h.completions.filter((d) => weekDays.includes(d)).length;
  }, 0);
  const weekScore = calcProgress(totalCompleted, totalPossible);

  const dailyHabits = habits.filter((h) => h.section === "daily");
  const devotionalHabits = habits.filter((h) => h.section === "devotional");

  function HabitGrid({ section, sectionHabits }: { section: string; sectionHabits: HabitWithCompletions[] }) {
    if (sectionHabits.length === 0) return null;
    return (
      <div className="mb-4">
        <SectionTitle className="mb-2">{section}</SectionTitle>
        <div className="space-y-2">
          {sectionHabits.map((habit) => {
            const weekCompletions = DAYS.map((_, i) => {
              const d = format(addDays(weekStart, i), "yyyy-MM-dd");
              return habit.completions.includes(d);
            });
            const done = weekCompletions.filter(Boolean).length;
            const pct = calcProgress(done, habit.goal);

            return (
              <div key={habit.id} className="flex items-center gap-3">
                <div className="flex items-center gap-2 w-40 flex-shrink-0">
                  <span className="text-lg">{habit.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-stone-700 truncate">{habit.name}</p>
                    <p className="text-[10px] text-stone-400">{done}/{habit.goal} days</p>
                  </div>
                </div>

                <div className="flex gap-1">
                  {DAYS.map((day, i) => {
                    const dateStr = format(addDays(weekStart, i), "yyyy-MM-dd");
                    const isCompleted = weekCompletions[i];
                    const isToday = dateStr === todayKey();

                    return (
                      <button
                        key={day}
                        onClick={() => toggleHabit(habit.id, dateStr)}
                        title={`${habit.name} — ${day}`}
                        className={cn(
                          "habit-cell",
                          isCompleted && "habit-cell-completed",
                          isToday && !isCompleted && "border-sand-300"
                        )}
                        style={isCompleted ? { backgroundColor: habit.color + "dd", borderColor: habit.color } : {}}
                      >
                        {isCompleted && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>

                <div className="w-16 ml-1">
                  <ProgressBar value={done} max={habit.goal} color={habit.color} />
                  <p className="text-[10px] text-stone-400 mt-0.5">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">Habits</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            Week of {format(weekStart, "MMM d")} — {format(weekEnd, "MMM d")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setWeekStart((w) => navigateWeek(w, "prev"))} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500">
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isCurrent && (
            <button onClick={() => setWeekStart(getWeekStart())} className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100">
              Today
            </button>
          )}
          <button onClick={() => setWeekStart((w) => navigateWeek(w, "next"))} className="p-2 rounded-xl hover:bg-stone-100 text-stone-500">
            <ChevronRight className="w-4 h-4" />
          </button>
          <button onClick={() => setShowManage(true)} className="btn-secondary flex items-center gap-1.5">
            <Settings className="w-3.5 h-3.5" /> Manage
          </button>
        </div>
      </div>

      {/* Score card */}
      <Card className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-stone-700">Week Score</p>
          <p className="text-2xl font-bold text-stone-800">{weekScore}%</p>
        </div>
        <ProgressBar value={totalCompleted} max={totalPossible} color="#7da07a" className="h-3" />
        <p className="text-xs text-stone-400 mt-1.5">{totalCompleted} of {totalPossible} possible completions</p>
      </Card>

      {/* Day headers */}
      {habits.length > 0 && (
        <div className="flex items-center gap-3 mb-2 pl-44">
          {DAYS.map((day, i) => {
            const dateStr = format(addDays(weekStart, i), "yyyy-MM-dd");
            const isToday = dateStr === todayKey();
            return (
              <div key={day} className="w-8 text-center">
                <span className={cn("text-[11px] font-medium", isToday ? "text-sand-500" : "text-stone-400")}>
                  {day}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Habit grid */}
      <Card>
        {habits.length === 0 ? (
          <EmptyState icon="🌱" message="No habits yet — add some in Manage!" action={
            <button onClick={() => setShowManage(true)} className="btn-secondary">Open Manage</button>
          } />
        ) : (
          <>
            <HabitGrid section="Daily Habits" sectionHabits={dailyHabits} />
            <HabitGrid section="Devotional" sectionHabits={devotionalHabits} />
          </>
        )}
      </Card>

      {/* Manage Modal */}
      <Modal open={showManage} onClose={() => setShowManage(false)} title="Manage Habits" maxWidth="max-w-2xl">
        {/* Add new habit */}
        <div className="p-4 bg-parchment rounded-2xl mb-4">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">New Habit</p>
          <div className="space-y-3">
            <input type="text" className="input-base" placeholder="Habit name…" value={newName} onChange={(e) => setNewName(e.target.value)} />
            <div className="flex gap-3">
              <div className="flex-1">
                <p className="text-xs text-stone-400 mb-1.5">Icon</p>
                <div className="flex flex-wrap gap-1.5">
                  {ICONS.map((icon) => (
                    <button key={icon} onClick={() => setNewIcon(icon)}
                      className={cn("w-8 h-8 rounded-lg text-base hover:bg-stone-100 transition-colors", newIcon === icon && "bg-stone-200")}
                    >{icon}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-stone-400 mb-1.5">Color</p>
                <div className="flex flex-wrap gap-1.5">
                  {COLORS.map((color) => (
                    <button key={color} onClick={() => setNewColor(color)}
                      className={cn("w-6 h-6 rounded-full transition-all", newColor === color && "ring-2 ring-offset-1 ring-stone-400")}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs text-stone-400 mb-1 block">Goal (days/week)</label>
                <input type="number" min={1} max={7} className="input-base" value={newGoal} onChange={(e) => setNewGoal(parseInt(e.target.value))} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-stone-400 mb-1 block">Section</label>
                <select className="input-base" value={newSection} onChange={(e) => setNewSection(e.target.value)}>
                  <option value="daily">Daily</option>
                  <option value="devotional">Devotional</option>
                </select>
              </div>
            </div>
            <button onClick={createHabit} className="btn-primary w-full">
              <Plus className="w-3.5 h-3.5 inline mr-1" /> Add Habit
            </button>
          </div>
        </div>

        {/* Existing habits list */}
        <div className="space-y-2">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-stone-100">
              <div className="flex items-center gap-3">
                <span className="text-xl">{habit.icon}</span>
                <div>
                  <p className="text-sm font-medium text-stone-700">{habit.name}</p>
                  <p className="text-xs text-stone-400 capitalize">{habit.section} · {habit.goal}×/week</p>
                </div>
              </div>
              <button onClick={() => deleteHabit(habit.id)} className="btn-danger p-1.5">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
