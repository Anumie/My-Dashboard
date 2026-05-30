"use client";

import { useState, useEffect, useCallback } from "react";
import { format, subWeeks, startOfWeek } from "date-fns";
import { Plus, Trash2, Trophy, Lightbulb } from "lucide-react";
import { toast } from "react-hot-toast";
import { getCurrentQuarter, getQuarterLabel, cn, calcProgress } from "@/lib/utils";
import { Card, SectionTitle, PageHeader, ProgressBar, EmptyState } from "@/components/ui/index";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { QuarterlyData, Goal, CreditCard, SavingsAccount } from "@/types";

const GOAL_CATEGORIES = ["Finance", "Health", "Business", "Personal"] as const;
const CATEGORY_COLORS: Record<string, string> = {
  Finance: "#dc8f2a",
  Health: "#7da07a",
  Business: "#78716c",
  Personal: "#ed856e",
};

export default function QuarterPage() {
  const currentQ = getCurrentQuarter();
  const [quarter, setQuarter] = useState(currentQ.quarter);
  const [year, setYear] = useState(currentQ.year);
  const [qData, setQData] = useState<QuarterlyData | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [gymChartData, setGymChartData] = useState<{ week: string; sessions: number }[]>([]);
  const [loading, setLoading] = useState(true);

  // Editable state
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [savings, setSavings] = useState<SavingsAccount[]>([]);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [parkingLot, setParkingLot] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState("");
  const [newIdea, setNewIdea] = useState("");
  const [newGoalText, setNewGoalText] = useState("");
  const [newGoalCategory, setNewGoalCategory] = useState<string>("Personal");

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [qRes, goalsRes, gymRes] = await Promise.all([
      fetch(`/api/quarter?quarter=${quarter}&year=${year}`),
      fetch(`/api/goals?scope=quarterly&quarter=${quarter}&year=${year}`),
      // Fetch last 13 weeks of gym data
      fetch(`/api/gym?from=${format(subWeeks(new Date(), 13), "yyyy-MM-dd")}&to=${format(new Date(), "yyyy-MM-dd")}`),
    ]);
    const [qData, goalsData, gymData] = await Promise.all([
      qRes.json(), goalsRes.json(), gymRes.json()
    ]);

    setQData(qData);
    setGoals(goalsData);
    setCreditCards(qData?.creditCards ?? []);
    setSavings(qData?.savings ?? []);
    setAchievements(qData?.achievements ?? []);
    setParkingLot(qData?.parkingLot ?? []);

    // Build gym chart: group by week
    const weekMap: Record<string, number> = {};
    for (const session of gymData) {
      const wk = format(startOfWeek(new Date(session.sessionDate), { weekStartsOn: 1 }), "MMM d");
      weekMap[wk] = (weekMap[wk] ?? 0) + 1;
    }
    // Fill last 13 weeks
    const chart = [];
    for (let i = 12; i >= 0; i--) {
      const wkStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
      const label = format(wkStart, "MMM d");
      chart.push({ week: label, sessions: weekMap[label] ?? 0 });
    }
    setGymChartData(chart);
    setLoading(false);
  }, [quarter, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function saveFinance() {
    await fetch("/api/quarter", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quarter, year, creditCards, savings, achievements, parkingLot }),
    });
    toast.success("Saved ✓");
  }

  async function addGoal() {
    if (!newGoalText.trim()) return;
    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newGoalText, category: newGoalCategory, scope: "quarterly", quarter, year }),
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

  function addAchievement() {
    if (!newAchievement.trim()) return;
    const updated = [...achievements, newAchievement.trim()];
    setAchievements(updated);
    setNewAchievement("");
    updateList(updated, parkingLot);
  }

  function addIdea() {
    if (!newIdea.trim()) return;
    const updated = [...parkingLot, newIdea.trim()];
    setParkingLot(updated);
    setNewIdea("");
    updateList(achievements, updated);
  }

  async function updateList(ach: string[], pl: string[]) {
    await fetch("/api/quarter", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quarter, year, creditCards, savings, achievements: ach, parkingLot: pl }),
    });
  }

  function addCreditCard() {
    setCreditCards((prev) => [...prev, { name: "Card", balance: 0, limit: 1000 }]);
  }

  function addSavings() {
    setSavings((prev) => [...prev, { name: "Account", balance: 0, goal: 1000 }]);
  }

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Quarter View</h1>
          <div className="flex gap-2 mt-1">
            {[1,2,3,4].map((q) => (
              <button key={q} onClick={() => setQuarter(q)}
                className={cn("text-xs px-2.5 py-1 rounded-lg transition-colors",
                  quarter === q ? "bg-stone-700 text-cream" : "text-stone-500 hover:bg-stone-100"
                )}>Q{q}</button>
            ))}
            <span className="text-stone-300">|</span>
            <button className="text-xs text-stone-500">{year}</button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Column 1: Finance */}
        <div className="space-y-4">
          {/* Credit Cards */}
          <Card>
            <SectionTitle>Credit Cards</SectionTitle>
            {creditCards.map((card, i) => (
              <div key={i} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <input className="input-base text-xs flex-1" value={card.name}
                    onChange={(e) => { const c = [...creditCards]; c[i].name = e.target.value; setCreditCards(c); }} />
                  <button onClick={() => { setCreditCards(prev => prev.filter((_, j) => j !== i)); }} className="text-stone-300 hover:text-clay-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-2 mb-1.5">
                  <div className="flex-1">
                    <label className="text-[10px] text-stone-400">Balance</label>
                    <input type="number" className="input-base text-xs" value={card.balance}
                      onChange={(e) => { const c = [...creditCards]; c[i].balance = +e.target.value; setCreditCards(c); }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-stone-400">Limit</label>
                    <input type="number" className="input-base text-xs" value={card.limit}
                      onChange={(e) => { const c = [...creditCards]; c[i].limit = +e.target.value; setCreditCards(c); }} />
                  </div>
                </div>
                <ProgressBar value={card.balance} max={card.limit} color="#ed856e" />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>${card.balance.toLocaleString()}</span>
                  <span>{calcProgress(card.balance, card.limit)}% used</span>
                </div>
              </div>
            ))}
            <button onClick={addCreditCard} className="btn-ghost text-xs w-full mt-1">
              <Plus className="w-3 h-3 inline mr-1" /> Add Card
            </button>
          </Card>

          {/* Savings */}
          <Card>
            <SectionTitle>Savings</SectionTitle>
            {savings.map((acct, i) => (
              <div key={i} className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <input className="input-base text-xs flex-1" value={acct.name}
                    onChange={(e) => { const s = [...savings]; s[i].name = e.target.value; setSavings(s); }} />
                  <button onClick={() => { setSavings(prev => prev.filter((_, j) => j !== i)); }} className="text-stone-300 hover:text-clay-400">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex gap-2 mb-1.5">
                  <div className="flex-1">
                    <label className="text-[10px] text-stone-400">Balance</label>
                    <input type="number" className="input-base text-xs" value={acct.balance}
                      onChange={(e) => { const s = [...savings]; s[i].balance = +e.target.value; setSavings(s); }} />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-stone-400">Goal</label>
                    <input type="number" className="input-base text-xs" value={acct.goal}
                      onChange={(e) => { const s = [...savings]; s[i].goal = +e.target.value; setSavings(s); }} />
                  </div>
                </div>
                <ProgressBar value={acct.balance} max={acct.goal} color="#7da07a" />
                <div className="flex justify-between text-[10px] text-stone-400 mt-0.5">
                  <span>${acct.balance.toLocaleString()}</span>
                  <span>{calcProgress(acct.balance, acct.goal)}% to goal</span>
                </div>
              </div>
            ))}
            <button onClick={addSavings} className="btn-ghost text-xs w-full">
              <Plus className="w-3 h-3 inline mr-1" /> Add Account
            </button>
          </Card>

          <button onClick={saveFinance} className="btn-primary w-full">Save Finance Data</button>
        </div>

        {/* Column 2: Goals */}
        <div className="space-y-4">
          <Card>
            <SectionTitle>Quarterly Goals</SectionTitle>

            {/* Add goal */}
            <div className="flex gap-2 mb-4">
              <select className="input-base w-28" value={newGoalCategory}
                onChange={(e) => setNewGoalCategory(e.target.value)}>
                {GOAL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <input type="text" className="input-base flex-1" placeholder="New goal…"
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

            {goals.length === 0 && <EmptyState icon="🎯" message="Add your Q goals above" />}
          </Card>
        </div>

        {/* Column 3: Gym chart + Achievements + Parking Lot */}
        <div className="space-y-4">
          {/* Gym consistency chart */}
          <Card>
            <SectionTitle>Gym Consistency (13 weeks)</SectionTitle>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={gymChartData} margin={{ top: 0, right: 0, bottom: 0, left: -30 }}>
                  <XAxis dataKey="week" tick={{ fontSize: 9, fill: "#a8a29e" }} tickLine={false} axisLine={false}
                    tickFormatter={(v) => v.split(" ")[1] ?? v} />
                  <YAxis tick={{ fontSize: 9, fill: "#a8a29e" }} tickLine={false} axisLine={false} ticks={[0,1,2,3,4,5]} />
                  <Tooltip contentStyle={{ background: "#fdf6ec", border: "1px solid #e7e5e4", borderRadius: 8, fontSize: 11 }}
                    cursor={{ fill: "#f5f5f4" }} />
                  <Bar dataKey="sessions" radius={[3,3,0,0]}>
                    {gymChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.sessions >= 3 ? "#7da07a" : entry.sessions >= 1 ? "#edc57f" : "#e7e5e4"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Achievements */}
          <Card>
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-3.5 h-3.5 text-sand-500" />
              <SectionTitle className="mb-0">Achievements</SectionTitle>
            </div>
            <div className="flex gap-2 mb-3">
              <input className="input-base flex-1 text-xs" placeholder="Add achievement…"
                value={newAchievement} onChange={(e) => setNewAchievement(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAchievement()} />
              <button onClick={addAchievement} className="btn-primary px-2.5">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {achievements.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-2">Log your wins here 🏆</p>
            ) : (
              <ul className="space-y-1.5">
                {achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 group text-sm">
                    <span className="text-sand-400 mt-0.5">✦</span>
                    <span className="flex-1 text-stone-600">{a}</span>
                    <button onClick={() => { const u = achievements.filter((_, j) => j !== i); setAchievements(u); updateList(u, parkingLot); }}
                      className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-clay-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Parking Lot */}
          <Card parchment>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-3.5 h-3.5 text-sand-500" />
              <SectionTitle className="mb-0">Parking Lot</SectionTitle>
            </div>
            <div className="flex gap-2 mb-3">
              <input className="input-base flex-1 text-xs" placeholder="Ideas for later…"
                value={newIdea} onChange={(e) => setNewIdea(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addIdea()} />
              <button onClick={addIdea} className="btn-primary px-2.5">
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {parkingLot.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-2">Capture ideas here 💡</p>
            ) : (
              <ul className="space-y-1.5">
                {parkingLot.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2 group text-sm">
                    <span className="text-stone-300 mt-0.5">◦</span>
                    <span className="flex-1 text-stone-600">{idea}</span>
                    <button onClick={() => { const u = parkingLot.filter((_, j) => j !== i); setParkingLot(u); updateList(achievements, u); }}
                      className="opacity-0 group-hover:opacity-100 text-stone-300 hover:text-clay-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
