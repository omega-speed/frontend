"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  addTask,
  deleteTask,
  getTasks,
  toggleTask,
  updateTask,
} from "../service";
import type { LearnerTask, TaskStatus } from "../types";

// The ONE task list, rendered anywhere: My Plan shows all of it, each
// application card shows its school's slice. Sleek by subtraction: a row is a
// status pill + the words + a hover ✕. The pill cycles to do → in progress →
// done on tap (optimistic, honest rollback). Due dates live on deadlines and
// reminders — not as chrome on every row.

type Editing = { id: string; field: "title" } | null;

const NEXT: Record<TaskStatus, TaskStatus> = {
  todo: "in_progress",
  in_progress: "done",
  done: "todo",
};
const STATUS_META: Record<TaskStatus, { label: string; className: string }> = {
  todo: {
    label: "to do",
    className: "bg-muted text-muted-foreground hover:text-foreground",
  },
  in_progress: { label: "in progress", className: "bg-gold/15 text-gold" },
  done: { label: "done", className: "bg-win/15 text-win" },
};

export function TaskList({
  filter,
  refreshKey = 0,
  placeholder = "Add a task",
  title,
  showProgress = false,
  limit,
  onChanged,
}: {
  filter?: { applicationId?: string; institutionId?: string };
  refreshKey?: number;
  placeholder?: string;
  title?: string;
  showProgress?: boolean;
  limit?: number;
  onChanged?: () => void;
}) {
  const [tasks, setTasks] = useState<LearnerTask[] | null>(null);
  const [text, setText] = useState("");
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<Editing>(null);
  const [draft, setDraft] = useState("");
  const [, start] = useTransition();
  const changed = useRef(onChanged);
  changed.current = onChanged;

  useEffect(() => {
    start(async () => {
      const res = await getTasks(
        filter?.applicationId
          ? { applicationId: filter.applicationId }
          : undefined,
      );
      if (res.ok) setTasks(res.tasks);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, filter?.applicationId]);

  const notify = () => changed.current?.();

  // The words leave the input and the row grows in at the SAME instant, right
  // above where they were typed — one continuous motion, no server-lag gap.
  // The optimistic row carries its own spinner until the real record replaces
  // it; on failure it collapses back out and the words return to the input.
  const add = () => {
    const t = text.trim();
    if (!t || workingId) return;
    const tempId = `tmp-${Date.now()}`;
    const temp: LearnerTask = {
      id: tempId,
      title: t,
      institutionId: filter?.institutionId ?? null,
      applicationId: filter?.applicationId ?? null,
      dueAt: null,
      done: false,
      status: "todo",
      source: "learner",
    };
    setText("");
    setWorkingId(tempId);
    setTasks((x) => [...(x ?? []), temp]);
    start(async () => {
      const res = await addTask({ title: t, ...filter });
      if (res.ok && res.task) {
        setTasks((x) => (x ?? []).map((y) => (y.id === tempId ? res.task! : y)));
        notify();
      } else {
        setTasks((x) => (x ?? []).filter((y) => y.id !== tempId));
        setText(t); // the words come back — nothing silently lost
        toast.error(res.message || "Couldn't add that.");
      }
      setWorkingId(null);
    });
  };

  const toggle = (task: LearnerTask) => {
    if (workingId) return;
    const next = NEXT[task.status ?? (task.done ? "done" : "todo")];
    setWorkingId(task.id);
    setTasks((x) =>
      (x ?? []).map((t) =>
        t.id === task.id ? { ...t, status: next, done: next === "done" } : t,
      ),
    );
    start(async () => {
      const res = await toggleTask(task.id);
      if (!res.ok) {
        setTasks((x) =>
          (x ?? []).map((t) =>
            t.id === task.id
              ? { ...t, status: task.status, done: task.done }
              : t,
          ),
        );
        toast.error("That didn't save.");
      } else notify();
      setWorkingId(null);
    });
  };

  const remove = (task: LearnerTask) => {
    if (workingId) return;
    setWorkingId(task.id);
    setTasks((x) => (x ?? []).filter((t) => t.id !== task.id));
    start(async () => {
      const res = await deleteTask(task.id);
      if (!res.ok) {
        setTasks((x) => [task, ...(x ?? [])]);
        toast.error("That didn't save.");
      } else notify();
      setWorkingId(null);
    });
  };

  const saveTitle = (task: LearnerTask) => {
    const t = draft.trim();
    setEditing(null);
    if (!t || t === task.title || workingId) return;
    setWorkingId(task.id);
    setTasks((x) =>
      (x ?? []).map((y) => (y.id === task.id ? { ...y, title: t } : y)),
    );
    start(async () => {
      const res = await updateTask(task.id, { title: t });
      if (!res.ok) {
        setTasks((x) =>
          (x ?? []).map((y) =>
            y.id === task.id ? { ...y, title: task.title } : y,
          ),
        );
        toast.error("That didn't save.");
      }
      setWorkingId(null);
    });
  };

  const list = limit ? (tasks ?? []).slice(0, limit) : (tasks ?? []);
  const doneCount = (tasks ?? []).filter(
    (t) => (t.status ?? (t.done ? "done" : "todo")) === "done",
  ).length;
  const total = tasks?.length ?? 0;

  return (
    <div>
      {(title || (showProgress && total > 0)) && (
        <div className="flex items-baseline justify-between gap-3">
          {title && (
            <p className="text-[10px] font-black uppercase text-muted-foreground">
              {title}
            </p>
          )}
          {total > 0 && (
            <span className="text-[10px] font-bold tabular-nums text-muted-foreground">
              {doneCount} of {total} done
            </span>
          )}
        </div>
      )}
      {showProgress && total > 0 && (
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gold transition-[width] duration-500 ease-out"
            style={{ width: `${Math.round((doneCount / total) * 100)}%` }}
          />
        </div>
      )}

      {tasks && list.length > 0 && (
        <ul className="mt-1.5 flex flex-col">
          <AnimatePresence initial={false}>
            {list.map((t) => {
              const status: TaskStatus = t.status ?? (t.done ? "done" : "todo");
              const editingTitle =
                editing?.id === t.id && editing.field === "title";
              return (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                  className="group overflow-hidden"
                >
                  <div className=" flex items-center gap-2 rounded-xs px-1.5 py-1.5 transition-colors hover:bg-accent/70 ">
                    <button
                      type="button"
                      disabled={workingId === t.id}
                      onClick={() => toggle(t)}
                      title="Tap to change status"
                      className={`press shrink-0 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase transition-[transform,background-color,color] ${STATUS_META[status].className} `}
                    >
                      <motion.span
                        key={status}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.15,
                          ease: [0.23, 1, 0.32, 1],
                        }}
                        className="block"
                      >
                        {STATUS_META[status].label}
                      </motion.span>
                    </button>

                    {editingTitle ? (
                      <input
                        autoFocus
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={() => saveTitle(t)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveTitle(t);
                          if (e.key === "Escape") setEditing(null);
                        }}
                        className="h-6 min-w-0 flex-1 rounded-full border border-input bg-background px-2 text-xs outline-none transition-[border-color] duration-200 focus-visible:border-primary/60"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (status === "done" || workingId) return;
                          setDraft(t.title);
                          setEditing({ id: t.id, field: "title" });
                        }}
                        title={status === "done" ? undefined : "Edit"}
                        className={`min-w-0 flex-1 truncate text-left text-xs transition-colors ${
                          status === "done"
                            ? "cursor-default text-muted-foreground line-through decoration-muted-foreground/40"
                            : status === "in_progress"
                              ? "font-medium text-foreground"
                              : "text-foreground"
                        }`}
                      >
                        {t.title}
                      </button>
                    )}

                    {workingId === t.id ? (
                      <span className="appear-delayed shrink-0">
                        <Loader2
                          className="size-3 animate-spin text-primary"
                          strokeWidth={2.5}
                        />
                      </span>
                    ) : (
                      <button
                        type="button"
                        aria-label={`Remove ${t.title}`}
                        onClick={() => remove(t)}
                        className="shrink-0 text-[10px] text-muted-foreground/0 transition-colors group-hover:text-muted-foreground/60 hover:!text-loss"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}

      {tasks && tasks.length === 0 && (
        <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground/70">
          Nothing here yet — add your first task below.
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="h-7 flex-1 rounded-full border border-input bg-background px-3 text-xs placeholder:text-muted-foreground/40 outline-none transition-[border-color,background-color] duration-200 focus-visible:border-primary/60 focus-visible:bg-card"
        />
        <button
          type="button"
          disabled={!text.trim() || workingId != null}
          onClick={add}
          className="press flex items-center gap-1.5 text-[11px] font-bold text-primary transition-opacity hover:opacity-75 disabled:opacity-40"
        >
          Add
          {workingId?.startsWith("tmp-") && (
            <span className="appear-delayed">
              <Loader2 className="size-3 animate-spin" strokeWidth={2.5} />
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
