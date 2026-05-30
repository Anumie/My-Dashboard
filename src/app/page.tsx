"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays } from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Dumbbell,
  BookOpen,
  Trash2,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import confetti from "canvas-confetti";
import {
  getWeekStart,
  formatWeekKey,
  navigateWeek,
  isCurrentWeek,
  formatDisplayDate,
  todayKey,
  cn,
} from "@/lib/utils";
import { Card, SectionTitle, PageHeader, EmptyState } from "@/components/ui/index";
import type { Task, GymSession, WeeklyFocus } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const GYM_TYPES = ["Upper", "Lower", "Cardio", "Full Body", "Rest"];

// Pop sound via Web Audio API
function playPopSound() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch (_) {}
}

function fireConfetti() {
  confetti({
    particleCount: 60,
    spread: 70,
    origin: { y: 0.7 },
    colors: ["#edc57f", "#7da07a", "#e7e5e4", "#dc8f2a", "#a8c0a6"],
    scalar: 0.9,
  });
}

export default function WeekPage() {
  const [weekStart, setWeekStart] = useState<Date>(getWeekStart());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [gymSessions, setGymSessions] = useState<GymSession[]>([]);
  const [focus, setFocus] = useState<WeeklyFocus | null>(null);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);

  // Focus form state
  const [theme, setTheme] = useState("");
  const [goals, setGoals] = useState<string[]>(["", "", ""]);
  const [reflections, setReflections] = useState("");
  const [currentlyReading, setCurrentlyReading] = useState("");
  const [readingAuthor, setReadingAuthor] = useState("");
  const [savingFocus, setSavingFocus] = useState(false);

  const weekKey = formatWeekKey(weekStart);
  const weekEnd = addDays(weekStart, 6);
  const isCurrent = isCurrentWeek(weekStart);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tasksRes, gymRes, focusRes] = await Promise.all([
        fetch(`/api/tasks?weekStart=${weekKey}`),
        fetch(`/api/gym?from=${weekKey}&to=${format(weekEnd, "yyyy-MM-dd")}`),
        fetch(`/api/weekly-focus?weekStart=${weekKey}`),
      ]);
      const [tasksData, gymData, focusData] = await Promise.all([
        tasksRes.json(),
        gymRes.json(),
        focusRes.json(),
      ]);
      setTasks(tasksData);
      setGymSessions(gymData);
      setFocus(focusData);

      if (focusData) {
        setTheme(focusData.theme ?? "");
        setGoals(
          focusData.goals?.length > 0 ? focusData.goals : ["", "", ""]
        );
        setReflections(focusData.reflections ?? "");
        setCurrentlyReading(focusData.currentlyReading ?? "");
        setReadingAuthor(focusData.currentlyReadingAuthor ?? "");
      } else {
        setTheme("");
        setGoals(["", "", ""]);
        setReflections("");
        setCurrentlyReading("");
        setReadingAuthor("");
      }
    } finally {
      setLoading(false);
    }
  }, [weekKey]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function addTask() {
    if (!newTask.trim()) return;
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTask.trim(), weekStart: weekKey }),
    });
    const task = await res.json();
    setTasks((prev) => [...prev, task]);
    setNewTask("");
  }

  async function toggleTask(task: Task) {
    const newCompleted = !task.completed;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed: newCompleted } : t))
    );
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, completed: newCompleted }),
    });
    if (newCompleted) {
      playPopSound();
      fireConfetti();
    }
  }

  async function deleteTask(id: number) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
  }

  async function toggleGym(dateStr: string, type: string) {
    const existing = gymSessions.find((s) => s.sessionDate === dateStr);
    if (existing) {
      setGymSessions((prev) => prev.filter((s) => s.id !== existing.id));
      await fetch(`/api/gym?id=${existing.id}`, { method: "DELETE" });
    } else {
      const res = await fetch("/api/gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionDate: dateStr, type }),
      });
      const session = await res.json();
      setGymSessions((prev) => [...prev, session]);
      toast.success(`${type} session logged! 💪`);
    }
  }

  async function saveFocus() {
    setSavingFocus(true);
    await fetch("/api/weekly-focus", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weekStart: weekKey,
        theme,
        goals: goals.filter(Boolean),
        reflections,
        currentlyReading,
        currentlyReadingAuthor: readingAuthor,
      }),
    });
    setSavingFocus(false);
    toast.success("Saved ✓");
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const gymCount = gymSessions.length;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header with week navigation */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
            {isCurrent ? "This Week" : "Week of"}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {formatDisplayDate(weekStart)} – {formatDisplayDate(weekEnd)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekStart((w) => navigateWeek(w, "prev"))}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {!isCurrent && (
            <button
              onClick={() => setWeekStart(getWeekStart())}
              className="text-xs text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={() => setWeekStart((w) => navigateWeek(w, "next"))}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sand-100 flex items-center justify-center text-lg">
            ✅
          </div>
          <div>
            <p className="text-xs text-stone-400">Tasks done</p>
            <p className="text-lg font-semibold text-stone-700">
              {completedCount}/{tasks.length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sage-100 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-sage-600" />
          </div>
          <div>
            <p className="text-xs text-stone-400">Gym sessions</p>
            <p className="text-lg font-semibold text-stone-700">{gymCount}x</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-clay-50 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-clay-500" />
          </div>
          <div>
            <p className="text-xs text-stone-400">Reading</p>
            <p className="text-sm font-medium text-stone-700 truncate">
              {currentlyReading || "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {/* Left column: Tasks + Gym */}
        <div className="col-span-3 space-y-4">
          {/* Task Checklist */}
          <Card>
            <SectionTitle>Weekly Tasks</SectionTitle>

            {/* Add task */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                className="input-base flex-1"
                placeholder="Add a task…"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
              />
              <button onClick={addTask} className="btn-primary flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>

            {/* Task list */}
            {tasks.length === 0 ? (
              <EmptyState icon="📋" message="No tasks yet — add one above!" />
            ) : (
              <ul className="space-y-2">
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    className="flex items-center gap-3 group py-0.5"
                  >
                    <button
                      onClick={() => toggleTask(task)}
                      className={cn(
                        "checkbox-custom",
                        task.completed && "checkbox-custom-checked"
                      )}
                    >
                      {task.completed && (
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </button>
                    <span
                      className={cn(
                        "flex-1 text-sm transition-all",
                        task.completed
                          ? "line-through text-stone-400"
                          : "text-stone-700"
                      )}
                    >
                      {task.title}
                    </span>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-clay-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Gym Tracker */}
          <Card>
            <SectionTitle>Gym This Week</SectionTitle>
            <div className="grid grid-cols-7 gap-1.5">
              {DAYS.map((day, i) => {
                const date = addDays(weekStart, i);
                const dateStr = format(date, "yyyy-MM-dd");
                const session = gymSessions.find((s) => s.sessionDate === dateStr);
                const isToday = dateStr === todayKey();

                return (
                  <div key={day} className="flex flex-col items-center gap-1.5">
                    <span className={cn("day-label", isToday && "text-sand-500 font-semibold")}>
                      {day}
                    </span>
                    <button
                      onClick={() =>
                        toggleGym(dateStr, session ? "" : "Upper")
                      }
                      className={cn(
                        "w-10 h-10 rounded-xl border-2 flex items-center justify-center text-base transition-all duration-150 hover:scale-105",
                        session
                          ? "bg-sage-400 border-sage-400 text-white shadow-sm"
                          : isToday
                          ? "border-sand-300 bg-sand-50 text-sand-300"
                          : "border-stone-200 text-stone-200 hover:border-stone-300"
                      )}
                    >
                      {session ? "💪" : <Dumbbell className="w-4 h-4" />}
                    </button>
                    {session && (
                      <span className="text-[10px] text-stone-400">{session.type}</span>
                    )}
                  </div>
                );
              })}
            </div>
            {gymCount > 0 && (
              <p className="text-xs text-stone-400 mt-3">
                {gymCount} session{gymCount !== 1 ? "s" : ""} this week 🔥
              </p>
            )}
          </Card>
        </div>

        {/* Right column: Focus, Goals, Reflections, Reading */}
        <div className="col-span-2 space-y-4">
          {/* Weekly Focus */}
          <Card parchment>
            <SectionTitle>Weekly Focus</SectionTitle>
            <input
              type="text"
              className="input-base mb-3"
              placeholder="This week's theme…"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            />

            <div className="space-y-2 mb-3">
              {goals.map((goal, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-stone-400 w-4">{i + 1}.</span>
                  <input
                    type="text"
                    className="input-base"
                    placeholder={`Goal ${i + 1}…`}
                    value={goal}
                    onChange={(e) => {
                      const next = [...goals];
                      next[i] = e.target.value;
                      setGoals(next);
                    }}
                  />
                </div>
              ))}
            </div>

            <button onClick={saveFocus} disabled={savingFocus} className="btn-secondary w-full text-center">
              {savingFocus ? "Saving…" : "Save Focus"}
            </button>
          </Card>

          {/* Reflections */}
          <Card>
            <SectionTitle>Reflections</SectionTitle>
            <textarea
              className="textarea-base"
              rows={4}
              placeholder="What went well? What would you change?"
              value={reflections}
              onChange={(e) => setReflections(e.target.value)}
              onBlur={saveFocus}
            />
          </Card>

          {/* Currently Reading */}
          <Card parchment>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-clay-400" />
              <SectionTitle className="mb-0">Currently Reading</SectionTitle>
            </div>
            <input
              type="text"
              className="input-base mb-2"
              placeholder="Book title…"
              value={currentlyReading}
              onChange={(e) => setCurrentlyReading(e.target.value)}
              onBlur={saveFocus}
            />
            <input
              type="text"
              className="input-base"
              placeholder="Author…"
              value={readingAuthor}
              onChange={(e) => setReadingAuthor(e.target.value)}
              onBlur={saveFocus}
            />
            {currentlyReading && (
              <div className="mt-3 p-2.5 bg-white/50 rounded-xl border border-stone-200/60">
                <p className="text-sm font-medium text-stone-700">
                  {currentlyReading}
                </p>
                {readingAuthor && (
                  <p className="text-xs text-stone-400">by {readingAuthor}</p>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
