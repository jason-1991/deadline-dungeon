import { useState } from "react";
import type { Dungeon } from "../game/types.ts";
import { buildDungeon } from "../game/logic.ts";
import { TEMPLATES } from "../game/templates.ts";

interface TaskDraft {
  name: string;
  hours: string;
}

interface MilestoneDraft {
  title: string;
  tasks: TaskDraft[];
}

interface Props {
  onCreate: (dungeon: Dungeon) => void;
}

const BLANK_MILESTONE = (): MilestoneDraft => ({
  title: "",
  tasks: [{ name: "", hours: "1" }],
});

const fromTemplate = (templateId: string): MilestoneDraft[] => {
  const tpl = TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return [BLANK_MILESTONE()];
  return tpl.rooms.map((r) => ({
    title: r.title,
    tasks: r.tasks.map((t) => ({ name: t.title, hours: String(t.estimateHours) })),
  }));
};

const input: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-panel-edge)",
  borderRadius: 6,
  color: "var(--color-text)",
  fontFamily: "Nunito, sans-serif",
  fontSize: 14,
  fontWeight: 600,
  padding: "6px 10px",
  width: "100%",
};

const btn = (variant: "primary" | "ghost" | "danger"): React.CSSProperties => ({
  background:
    variant === "primary"
      ? "var(--color-pumpkin)"
      : variant === "danger"
      ? "transparent"
      : "transparent",
  border:
    variant === "ghost"
      ? "1px solid var(--color-panel-edge)"
      : variant === "danger"
      ? "1px solid var(--color-danger)"
      : "none",
  borderRadius: 6,
  color:
    variant === "primary"
      ? "#1B1035"
      : variant === "danger"
      ? "var(--color-danger)"
      : "var(--color-secondary)",
  cursor: "pointer",
  fontFamily: "Nunito, sans-serif",
  fontSize: 13,
  fontWeight: 800,
  padding: "5px 12px",
  whiteSpace: "nowrap",
});

export default function CreateDungeonForm({ onCreate }: Props) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [templateId, setTemplateId] = useState("blank");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([BLANK_MILESTONE()]);
  const [errors, setErrors] = useState<string[]>([]);

  const applyTemplate = (id: string) => {
    setTemplateId(id);
    setMilestones(id === "blank" ? [BLANK_MILESTONE()] : fromTemplate(id));
  };

  const updateMilestoneTitle = (mi: number, val: string) =>
    setMilestones((ms) => ms.map((m, i) => (i === mi ? { ...m, title: val } : m)));

  const addMilestone = () =>
    setMilestones((ms) => [...ms, BLANK_MILESTONE()]);

  const removeMilestone = (mi: number) =>
    setMilestones((ms) => ms.filter((_, i) => i !== mi));

  const updateTask = (mi: number, ti: number, field: "name" | "hours", val: string) =>
    setMilestones((ms) =>
      ms.map((m, i) =>
        i !== mi
          ? m
          : {
              ...m,
              tasks: m.tasks.map((t, j) =>
                j !== ti ? t : { ...t, [field]: val }
              ),
            }
      )
    );

  const addTask = (mi: number) =>
    setMilestones((ms) =>
      ms.map((m, i) =>
        i !== mi ? m : { ...m, tasks: [...m.tasks, { name: "", hours: "1" }] }
      )
    );

  const removeTask = (mi: number, ti: number) =>
    setMilestones((ms) =>
      ms.map((m, i) =>
        i !== mi ? m : { ...m, tasks: m.tasks.filter((_, j) => j !== ti) }
      )
    );

  const validate = (): string[] => {
    const errs: string[] = [];
    if (!name.trim()) errs.push("Dungeon name is required.");
    if (!deadline) {
      errs.push("Deadline is required.");
    } else if (new Date(deadline) <= new Date()) {
      errs.push("Deadline must be in the future.");
    }
    if (milestones.length === 0) errs.push("Add at least one milestone.");
    milestones.forEach((m, mi) => {
      if (!m.title.trim()) errs.push(`Milestone ${mi + 1}: title is required.`);
      if (m.tasks.length === 0) errs.push(`Milestone ${mi + 1}: add at least one task.`);
      m.tasks.forEach((t, ti) => {
        if (!t.name.trim())
          errs.push(`Milestone ${mi + 1}, task ${ti + 1}: name is required.`);
        const h = parseFloat(t.hours);
        if (isNaN(h) || h < 0.5)
          errs.push(`Milestone ${mi + 1}, task ${ti + 1}: hours must be ≥ 0.5.`);
      });
    });
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    const dungeon = buildDungeon(
      name.trim(),
      new Date(deadline).toISOString(),
      milestones.map((m) => ({
        title: m.title.trim(),
        tasks: m.tasks.map((t) => ({
          title: t.name.trim(),
          estimateHours: parseFloat(t.hours),
        })),
      }))
    );
    onCreate(dungeon);
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        maxWidth: 640,
        margin: "0 auto",
        padding: "32px 24px",
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <h1
        style={{
          fontFamily: "'Press Start 2P', monospace",
          fontSize: 18,
          color: "var(--color-pumpkin)",
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        Forge Your Dungeon
      </h1>

      {/* Name */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ color: "var(--color-secondary)", fontSize: 13 }}>Dungeon Name</span>
        <input style={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Senior Thesis" />
      </label>

      {/* Deadline */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ color: "var(--color-secondary)", fontSize: 13 }}>Deadline</span>
        <input style={input} type="datetime-local" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </label>

      {/* Template */}
      <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={{ color: "var(--color-secondary)", fontSize: 13 }}>Template</span>
        <select
          style={input}
          value={templateId}
          onChange={(e) => applyTemplate(e.target.value)}
        >
          <option value="blank">Blank</option>
          {TEMPLATES.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
      </label>

      {/* Milestones */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <span style={{ color: "var(--color-secondary)", fontSize: 13 }}>Milestones</span>
        {milestones.map((m, mi) => (
          <div
            key={mi}
            style={{
              background: "var(--color-panel)",
              border: "1px solid var(--color-panel-edge)",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                style={{ ...input, flex: 1 }}
                placeholder={`Milestone ${mi + 1} title`}
                value={m.title}
                onChange={(e) => updateMilestoneTitle(mi, e.target.value)}
              />
              {milestones.length > 1 && (
                <button type="button" style={btn("danger")} onClick={() => removeMilestone(mi)}>
                  Remove
                </button>
              )}
            </div>

            {m.tasks.map((t, ti) => (
              <div key={ti} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  style={{ ...input, flex: 1 }}
                  placeholder="Task name"
                  value={t.name}
                  onChange={(e) => updateTask(mi, ti, "name", e.target.value)}
                />
                <input
                  style={{ ...input, width: 80, flex: "none" }}
                  type="number"
                  min={0.5}
                  step={0.5}
                  placeholder="hrs"
                  value={t.hours}
                  onChange={(e) => updateTask(mi, ti, "hours", e.target.value)}
                />
                {m.tasks.length > 1 && (
                  <button type="button" style={btn("danger")} onClick={() => removeTask(mi, ti)}>
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button type="button" style={btn("ghost")} onClick={() => addTask(mi)}>
              + Add Task
            </button>
          </div>
        ))}
        <button type="button" style={btn("ghost")} onClick={addMilestone}>
          + Add Milestone
        </button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <ul style={{ margin: 0, padding: "0 0 0 18px", color: "var(--color-danger)", fontSize: 13, display: "flex", flexDirection: "column", gap: 4 }}>
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      {/* Submit */}
      <button
        type="submit"
        style={{
          ...btn("primary"),
          padding: "12px 24px",
          fontSize: 15,
          fontFamily: "'Press Start 2P', monospace",
          letterSpacing: "0.03em",
          alignSelf: "flex-start",
        }}
      >
        Enter the Dungeon
      </button>
    </form>
  );
}
