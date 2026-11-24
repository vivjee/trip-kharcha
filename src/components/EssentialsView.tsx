"use client";
import { useMemo, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import type {
  Trip,
  ChecklistItem,
  ChecklistCategory,
  TripType,
} from "@/types/trip";
import {
  CHECKLIST_CATEGORIES,
  TRIP_TYPES,
  getChecklistStats,
} from "@/lib/essentials-templates";
import Pagination, { PAGE_SIZE } from "./Pagination";
import SaveStatus, { useSaveForm } from "./SaveStatus";
interface Props {
  trip: Trip;
  onToggleItem: (id: string) => void;
  onTogglePackingComplete: () => void;
  onUpdateQuantity: (id: string, q: string) => void;
  onAssignItem: (id: string, p?: string) => void;
  onAddItem: (i: Omit<ChecklistItem, "id" | "isChecked">) => Promise<boolean>;
  onDeleteItem: (id: string) => void;
  onResetChecklist: (t: TripType) => void;
}
function Quantity({
  item,
  onChange,
}: {
  item: ChecklistItem;
  onChange: (q: string) => void;
}) {
  const [value, setValue] = useState(item.quantity || "");
  return (
    <label className="tc-quantity">
      <span className="sr-only">Quantity for {item.name}</span>
      <input
        value={value}
        maxLength={100}
        placeholder="Quantity"
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => {
          if (value !== item.quantity) onChange(value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
          }
        }}
      />
    </label>
  );
}
export default function EssentialsView({
  trip,
  onToggleItem,
  onTogglePackingComplete,
  onUpdateQuantity,
  onAssignItem,
  onAddItem,
  onDeleteItem,
  onResetChecklist,
}: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [newCategory, setNewCategory] = useState<ChecklistCategory>("other");
  const [notice, setNotice] = useState("");
  const { saving, error, run } = useSaveForm();
  const list = trip.checklist;
  const stats = getChecklistStats(list || []);
  const filtered = useMemo(
    () =>
      (list || []).filter(
        (i) =>
          i.name.toLowerCase().includes(query.toLowerCase()) &&
          (filter === "all" ||
            (filter === "packed" ? i.isChecked : !i.isChecked)) &&
          (category === "all" || i.category === category),
      ),
    [list, query, filter, category],
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1),
  );
  return (
    <div className="tc-view">
      <div className="tc-page-heading">
        <div>
          <h1>Packing</h1>
          <p>A lighter mind starts with a ready bag.</p>
        </div>
        <button className="tc-button primary" onClick={() => setAdding(true)}>
          <Plus size={18} />
          Add item
        </button>
      </div>
      <section className="tc-card">
        <div className="tc-section-title">
          <h2>
            {stats.packed} of {stats.total} packed
          </h2>
          <strong>{stats.percentage}%</strong>
        </div>
        <progress
          value={stats.packed}
          max={stats.total || 1}
          aria-label="Packing progress"
        />
        <div className="tc-actions">
          <button
            className="tc-button"
            disabled={
              !trip.isPackingComplete && (stats.pending > 0 || !stats.total)
            }
            onClick={onTogglePackingComplete}
          >
            {trip.isPackingComplete ? "Reopen packing" : "Finish packing"}
          </button>
          <button
            className="tc-text-button"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(
                  (list || [])
                    .map(
                      (i) =>
                        (i.isChecked ? "✓ " : "☐ ") +
                        i.name +
                        (i.quantity ? " · " + i.quantity : ""),
                    )
                    .join("\n"),
                );
                setNotice("Packing list copied.");
              } catch {
                setNotice(
                  "Clipboard unavailable. Try again from your browser.",
                );
              }
            }}
          >
            Copy list
          </button>
        </div>
        {notice && <p role="status">{notice}</p>}
      </section>
      <div className="tc-filters">
        <label className="tc-field">
          <span className="sr-only">Search packing list</span>
          <input
            placeholder="Find an item"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
          />
        </label>
        <label className="tc-field">
          <span className="sr-only">Packing category</span>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All categories</option>
            {CHECKLIST_CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="tc-tabs" aria-label="Packing filter">
        {["all", "pending", "packed"].map((f) => (
          <button
            key={f}
            aria-pressed={f === filter}
            onClick={() => {
              setFilter(f);
              setPage(0);
            }}
          >
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div className="tc-packing-list">
        {filtered
          .slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
          .map((i) => (
            <article
              key={i.id}
              className={"tc-packing-row " + (i.isChecked ? "is-packed" : "")}
            >
              <label className="tc-check">
                <input
                  type="checkbox"
                  checked={i.isChecked}
                  onChange={() => onToggleItem(i.id)}
                />
                <span>
                  {i.name}
                  <small>
                    {
                      CHECKLIST_CATEGORIES.find((c) => c.id === i.category)
                        ?.label
                    }
                  </small>
                </span>
              </label>
              <div className="tc-packing-tools">
                <Quantity
                  key={i.id + ":" + i.quantity}
                  item={i}
                  onChange={(q) => onUpdateQuantity(i.id, q)}
                />
                <label className="tc-assignee">
                  <span className="sr-only">Assign {i.name}</span>
                  <select
                    value={i.assignedToParticipantId || ""}
                    onChange={(e) =>
                      onAssignItem(i.id, e.target.value || undefined)
                    }
                  >
                    <option value="">Anyone</option>
                    {trip.participants.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                {i.isCustom && (
                  <button
                    className="tc-icon danger"
                    aria-label={"Remove " + i.name}
                    onClick={() => {
                      if (confirm("Remove “" + i.name + "”?"))
                        onDeleteItem(i.id);
                    }}
                  >
                    <Trash2 size={17} />
                  </button>
                )}
              </div>
            </article>
          ))}
      </div>
      {!filtered.length && (
        <p className="tc-empty">
          No items to show. Try another filter or add an item.
        </p>
      )}
      <Pagination page={safePage} count={filtered.length} onChange={setPage} />
      <details className="tc-card">
        <summary>Reset from a packing template</summary>
        <p>This replaces the current list and clears packing progress.</p>
        <div className="tc-actions">
          {TRIP_TYPES.map((t) => (
            <button
              className="tc-button"
              key={t.type}
              onClick={() => {
                if (
                  confirm(
                    "Replace this packing list with the " +
                      t.title +
                      " template?",
                  )
                )
                  onResetChecklist(t.type);
              }}
            >
              {t.emoji} {t.title}
            </button>
          ))}
        </div>
      </details>
      {adding && (
        <div
          className="tc-dialog-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="packing-add-title"
        >
          <div className="tc-dialog">
            <div className="tc-section-title">
              <h2 id="packing-add-title">Add packing item</h2>
              <button
                className="tc-icon"
                aria-label="Close packing form"
                onClick={() => setAdding(false)}
              >
                <X />
              </button>
            </div>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (
                  await run(() =>
                    onAddItem({
                      name: name.trim(),
                      category: newCategory,
                      quantity: quantity.trim() || undefined,
                    }),
                  )
                ) {
                  setAdding(false);
                  setName("");
                  setQuantity("");
                }
              }}
            >
              <SaveStatus saving={saving} error={error} />
              <label className="tc-field">
                Item name
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className="tc-field">
                Quantity & unit
                <input
                  placeholder="e.g. 2 pairs or 1 L"
                  maxLength={100}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </label>
              <label className="tc-field">
                Category
                <select
                  value={newCategory}
                  onChange={(e) =>
                    setNewCategory(e.target.value as ChecklistCategory)
                  }
                >
                  {CHECKLIST_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="tc-actions">
                <button
                  type="button"
                  className="tc-button"
                  onClick={() => setAdding(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !name.trim()}
                  className="tc-button primary"
                >
                  Save item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
