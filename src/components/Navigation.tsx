"use client";
import { Home, Package, Receipt, Scale, Settings2, MapPin } from "lucide-react";
export type TabType =
  | "dashboard"
  | "essentials"
  | "expenses"
  | "balances"
  | "analytics"
  | "activity";
interface Props {
  activeTab: TabType;
  setActiveTab: (t: TabType) => void;
  pendingDebtsCount: number;
  pendingPackingCount?: number;
  tripName?: string;
  onOpenSettings?: () => void;
}
const items = [
  { id: "dashboard", label: "Overview", icon: Home },
  { id: "essentials", label: "Packing", icon: Package },
  { id: "expenses", label: "Expenses", icon: Receipt },
  { id: "balances", label: "Balances", icon: Scale },
] as const;
export default function Navigation({
  activeTab,
  setActiveTab,
  pendingDebtsCount,
  pendingPackingCount,
  tripName,
  onOpenSettings,
}: Props) {
  const links = items.map((item) => {
    const Icon = item.icon;
    const active =
      item.id === activeTab ||
      (item.id === "expenses" && activeTab === "analytics");
    const count =
      item.id === "essentials"
        ? pendingPackingCount
        : item.id === "balances"
          ? pendingDebtsCount
          : 0;
    return (
      <button
        key={item.id}
        type="button"
        aria-label={item.label}
        aria-current={active ? "page" : undefined}
        onClick={() => setActiveTab(item.id)}
      >
        <span className="tc-nav-icon">
          <Icon size={21} />
          {Boolean(count) && (
            <span aria-hidden="true" className="tc-nav-count">
              {count! > 99 ? "99+" : count}
            </span>
          )}
        </span>
        <span>{item.label}</span>
      </button>
    );
  });
  return (
    <>
      <nav className="tc-navigation" aria-label="Trip sections">
        {links}
      </nav>
      <aside className="tc-sidebar">
        <div className="tc-sidebar-brand">
          <MapPin size={26} />
          <div>
            <strong>TripKharcha</strong>
            <p>Plan. Pack. Share.</p>
          </div>
        </div>
        <div className="tc-sidebar-trip">
          <span className="tc-eyebrow">CURRENT TRIP</span>
          <strong>{tripName}</strong>
        </div>
        <nav aria-label="Desktop trip sections">{links}</nav>
        <button className="tc-button" onClick={onOpenSettings}>
          <Settings2 size={18} />
          Settings
        </button>
      </aside>
    </>
  );
}
