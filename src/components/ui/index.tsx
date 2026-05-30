"use client";

import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { useEffect } from "react";

// ─── Card ──────────────────────────────────────────────────────────────────────
export function Card({
  children,
  className,
  parchment = false,
}: {
  children: React.ReactNode;
  className?: string;
  parchment?: boolean;
}) {
  return (
    <div className={cn(parchment ? "card-parchment" : "card", className)}>
      {children}
    </div>
  );
}

// ─── Section Title ─────────────────────────────────────────────────────────────
export function SectionTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3 className={cn("section-title", className)}>{children}</h3>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
export function ProgressBar({
  value,
  max = 100,
  color = "#7da07a",
  className,
}: {
  value: number;
  max?: number;
  color?: string;
  className?: string;
}) {
  const pct = max === 0 ? 0 : Math.min((value / max) * 100, 100);
  return (
    <div className={cn("progress-bar", className)}>
      <div
        className="progress-fill"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={cn("modal-content", maxWidth)}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-5 pb-0">
            <h2 className="text-base font-semibold text-stone-700">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({
  icon,
  message,
  action,
}: {
  icon?: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
      {icon && <span className="text-4xl">{icon}</span>}
      <p className="text-stone-400 text-sm">{message}</p>
      {action && action}
    </div>
  );
}

// ─── Tag Pill ─────────────────────────────────────────────────────────────────
export function TagPill({ label }: { label: string }) {
  return <span className="tag-pill">{label}</span>;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "published"
      ? "status-published"
      : status === "draft"
      ? "status-draft"
      : "status-idea";

  return (
    <span className={cn("tag-pill capitalize", cls)}>{status}</span>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────────────
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-stone-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Inline Input ─────────────────────────────────────────────────────────────
export function InlineInput({
  placeholder,
  value,
  onChange,
  onEnter,
  className,
}: {
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onEnter?: () => void;
  className?: string;
}) {
  return (
    <input
      type="text"
      className={cn("input-base", className)}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && onEnter) onEnter();
      }}
    />
  );
}
