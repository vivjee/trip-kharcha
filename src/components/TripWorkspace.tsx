"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  MapPin,
  MoreHorizontal,
  Plus,
  Settings2,
  Share2,
  Users,
} from "lucide-react";
import type { Expense, Settlement, SimplifiedDebt } from "@/types/trip";
import {
  useTripStore,
  tripActions,
  tripCalculations,
  reloadLibrary,
} from "@/lib/trip-store";
import { formatMoney } from "@/lib/money";
import { formatDateRange } from "@/lib/date-utils";
import { getChecklistStats } from "@/lib/essentials-templates";
import TripThumbnail from "./TripThumbnail";
import PhotoPicker from "./PhotoPicker";
import Navigation, { type TabType } from "./Navigation";
import SaveStatus from "./SaveStatus";

const Expenses = dynamic(() => import("./ExpensesView"));
const Packing = dynamic(() => import("./EssentialsView"));
const Balances = dynamic(() => import("./BalancesView"));
const Insights = dynamic(() => import("./AnalyticsView"));
const Activity = dynamic(() => import("./ActivityLogView"));
const Appearance = dynamic(() => import("./AppearanceSettings"));
const ExpenseForm = dynamic(() => import("./AddExpenseModal"));
const PaymentForm = dynamic(() => import("./SettleUpModal"));
const NewTrip = dynamic(() => import("./TripModal"));
const EditTrip = dynamic(() => import("./EditTripModal"));
const Profile = dynamic(() => import("./CreateProfileModal"));
const Members = dynamic(() => import("./AddParticipantModal"));
const Identity = dynamic(() => import("./ClaimIdentityModal"));
const Complete = dynamic(() => import("./CompleteTripModal"));
const Reopen = dynamic(() => import("./ReopenTripModal"));
const Backup = dynamic(() => import("./SyncTripModal"));
const Share = dynamic(() => import("./ShareSummaryModal"));
type Modal =
  | "expense"
  | "payment"
  | "new"
  | "edit"
  | "profile"
  | "members"
  | "identity"
  | "complete"
  | "reopen"
  | "backup"
  | "share"
  | "";
const sections = [
  "dashboard",
  "essentials",
  "expenses",
  "balances",
  "analytics",
  "activity",
  "details",
];

export default function TripWorkspace() {
  const store = useTripStore();
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const routeKey = pathname + "?" + params.toString();
  const previousRoute = useRef(routeKey);
  const [modal, setModal] = useState<Modal>("");
  const [appearance, setAppearance] = useState(false);
  const [expense, setExpense] = useState<Expense>();
  const [payment, setPayment] = useState<Settlement>();
  const [debt, setDebt] = useState<SimplifiedDebt>();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [backupTripId, setBackupTripId] = useState("");
  const [notice, setNotice] = useState("");
  const trip =
    pathname.startsWith("/trip") && !pathname.startsWith("/trips")
      ? store.data.trips.find((t) => t.id === params.get("id"))
      : undefined;
  const section = sections.includes(params.get("section") || "")
    ? params.get("section")!
    : "dashboard";
  const settings = pathname.startsWith("/settings");
  const go = (url: string) => {
    const fromDialog = Boolean(history.state?.tcDialog);
    if (fromDialog)
      history.replaceState(
        { ...history.state, tcDialog: undefined },
        "",
        location.href,
      );
    setModal("");
    setAppearance(false);
    if (fromDialog) router.replace(url);
    else router.push(url);
  };
  const openTrip = (id: string, part = "dashboard") =>
    go(`/trip/?id=${encodeURIComponent(id)}&section=${part}`);
  const currentId = trip ? store.data.identityByTripId[trip.id] : "";
  const finances = trip ? tripCalculations(trip) : undefined;
  const close = () => setModal("");
  const saved = async (
    action: Promise<boolean>,
    message = "Saved to this device",
  ) => {
    const ok = await action;
    if (ok) setNotice(message);
    return ok;
  };
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (previousRoute.current === routeKey) return;
    previousRoute.current = routeKey;
    const frame = requestAnimationFrame(() => {
      document.querySelector(".tc-scroll")?.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [routeKey]);
  useEffect(() => {
    let dispose: (() => void) | undefined;
    void import("@/lib/platform").then(async (platform) => {
      dispose = await platform.installLifecycle();
    });
    return () => dispose?.();
  }, []);
  if (store.status === "loading")
    return (
      <main className="tc-loading" aria-busy="true">
        Opening your trips…
      </main>
    );
  if (store.status === "recovery")
    return (
      <main className="tc-page tc-recovery">
        <h1>Your saved library needs attention</h1>
        <p>Your original data has been kept unchanged.</p>
        <p role="alert">{store.error}</p>
        <div className="tc-actions">
          <button
            className="tc-button primary"
            onClick={() => {
              const blob = new Blob([store.raw || "No data could be read"], {
                type: "application/json",
              });
              void import("@/lib/platform").then((p) =>
                p.shareFiles(
                  [
                    new File([blob], "trip-library-recovery.json", {
                      type: blob.type,
                    }),
                  ],
                  "Original library",
                ),
              );
            }}
          >
            Save original data
          </button>
          <button className="tc-button" onClick={reloadLibrary}>
            Try reading again
          </button>
        </div>
      </main>
    );
  if (appearance) return <Appearance onClose={() => setAppearance(false)} />;

  const openExpense = (e?: Expense) => {
    if (trip?.status === "completed") return;
    setExpense(e);
    setModal("expense");
  };
  const openPayment = (d?: SimplifiedDebt) => {
    setPayment(undefined);
    setDebt(d);
    setModal("payment");
  };
  const selectedBackupTrip =
    trip ||
    store.data.trips.find((t) => t.id === backupTripId) ||
    store.data.trips[0];
  const personalBalance = finances?.balances.find(
    (b) => b.participantId === currentId,
  );
  const packing = getChecklistStats(trip?.checklist || []);
  const filteredTrips = store.data.trips.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "active"
          ? t.status !== "completed"
          : t.status === "completed")),
  );
  return (
    <div className={`tc-app ${trip ? "has-trip" : ""}`}>
      <div className="tc-scroll">
        <header className="tc-header">
          <div className="tc-header-title">
            {(trip || settings) && (
              <button
                className="tc-icon"
                aria-label="Back to trips"
                onClick={() => go("/trips/")}
              >
                <ArrowLeft />
              </button>
            )}
            <div>
              <span className="tc-eyebrow">TRIPKHARCHA</span>
              <p>
                {trip?.name ||
                  (settings
                    ? "Settings"
                    : "A little planning. More exploring.")}
              </p>
            </div>
          </div>
          <button
            className="tc-icon"
            aria-label={trip ? "Trip details" : "Settings"}
            onClick={() =>
              trip ? openTrip(trip.id, "details") : go("/settings/")
            }
          >
            {trip ? <MoreHorizontal /> : <Settings2 />}
          </button>
        </header>
        {!modal && <SaveStatus />}
        {notice && (
          <p className="tc-notice" role="status">
            <Check size={16} />
            {notice}
          </p>
        )}
        <main id="main-content" className="tc-page">
          {settings ? (
            <>
              <div className="tc-page-heading">
                <div>
                  <h1>Make yourself at home</h1>
                  <p>Your profile, your preferences, your data.</p>
                </div>
              </div>
              <section className="tc-card">
                <h2>Your profile</h2>
                <p>
                  {store.data.profile
                    ? `${store.data.profile.avatar} ${store.data.profile.name}`
                    : "Optional. Add yourself to new trips more easily."}
                </p>
                <button
                  className="tc-button"
                  onClick={() => setModal("profile")}
                >
                  {store.data.profile ? "Edit profile" : "Create profile"}
                </button>
                <p className="tc-help">
                  Your profile is separate from the member selected on this
                  device. Completed trip names stay as recorded.
                </p>
              </section>
              <section className="tc-card">
                <h2>Appearance</h2>
                <p>Choose a palette and a comfortable reading style.</p>
                <button
                  className="tc-button"
                  onClick={() => setAppearance(true)}
                >
                  Appearance & advanced options
                </button>
              </section>
              <section className="tc-card">
                <h2>Backup & restore</h2>
                <p>
                  Trips stay on this device. Keep a backup before changing
                  phones or clearing app data.
                </p>
                {store.data.trips.length > 0 && (
                  <label className="tc-field">
                    Trip to export
                    <select
                      value={selectedBackupTrip?.id || ""}
                      onChange={(e) => setBackupTripId(e.target.value)}
                    >
                      {store.data.trips.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                <button
                  className="tc-button"
                  onClick={() => setModal("backup")}
                >
                  <Download size={18} />
                  Backup or restore
                </button>
              </section>
              <section className="tc-card danger-zone">
                <h2>Delete trip data</h2>
                <p>
                  This removes trips from this device. Export any trips you want
                  to keep first.
                </p>
                <button
                  className="tc-button danger"
                  onClick={async () => {
                    if (
                      confirm(
                        "Delete all trips from this device? Your profile and appearance will remain.",
                      )
                    )
                      await saved(tripActions.clear(), "Trip library cleared");
                  }}
                >
                  Delete all trips
                </button>
              </section>
              <p className="tc-help">
                TripKharcha 3.1.1 · Device-local storage · NPR
              </p>
            </>
          ) : !trip ? (
            <>
              <div className="tc-page-heading">
                <div>
                  <span className="tc-eyebrow">YOUR NEXT CHAPTER</span>
                  <h1>
                    {store.data.trips.length
                      ? "Your trips"
                      : "Good company. Clear balances."}
                  </h1>
                  <p>
                    {store.data.trips.length
                      ? "Everything you need for the road ahead."
                      : "Plan what to pack, share expenses, and settle up together."}
                  </p>
                </div>
                <button
                  className="tc-button primary"
                  onClick={() => setModal("new")}
                >
                  <Plus size={19} />
                  Create trip
                </button>
              </div>
              {store.data.trips.length > 0 ? (
                <>
                  <label className="tc-field">
                    <span className="sr-only">Search trips</span>
                    <input
                      placeholder="Search your trips"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <div className="tc-tabs" aria-label="Filter trips">
                    {["all", "active", "completed"].map((f) => (
                      <button
                        key={f}
                        aria-pressed={f === filter}
                        onClick={() => setFilter(f)}
                      >
                        {f === "all"
                          ? "All trips"
                          : f === "active"
                            ? "On the go"
                            : "Completed"}
                      </button>
                    ))}
                  </div>
                  <div className="tc-trip-grid">
                    {filteredTrips.map((t) => (
                      <button
                        key={t.id}
                        className="tc-trip-card"
                        onClick={() => openTrip(t.id)}
                      >
                        <div className="tc-trip-image" data-media-overlay>
                          <TripThumbnail trip={t} size="md" />
                          <span className="tc-image-badge">
                            {t.status === "completed"
                              ? "Completed"
                              : "On the go"}
                          </span>
                        </div>
                        <div className="tc-trip-copy">
                          <h2>{t.name}</h2>
                          <p>{formatDateRange(t)}</p>
                          <div className="tc-row">
                            <span>
                              <Users size={15} />
                              {t.participants.length}{" "}
                              {t.participants.length === 1 ? "member" : "members"}
                            </span>
                            <strong>
                              {formatMoney(
                                tripCalculations(t).stats.totalSpent,
                                t.currencySymbol,
                              )}
                            </strong>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {!filteredTrips.length && (
                    <p className="tc-empty">No trips match this search.</p>
                  )}
                </>
              ) : (
                <div className="tc-welcome" data-media-overlay>
                  <TripThumbnail
                    trip={{ name: "Nepal", tripType: "long_trek" }}
                    size="hero"
                  />
                  <div>
                    <MapPin size={22} />
                    <h2>
                      Less keeping tabs.
                      <br />
                      More making memories.
                    </h2>
                    <p>Your trip stays private on your device.</p>
                  </div>
                </div>
              )}
              <div className="tc-library-footer">
                <p>Bringing a trip from another device?</p>
                <button
                  className="tc-button"
                  onClick={() => setModal("backup")}
                >
                  Import a backup
                </button>
              </div>
            </>
          ) : section === "dashboard" ? (
            <>
              <div className="tc-cover" data-media-overlay>
                <TripThumbnail trip={trip} size="hero" />
                <div className="tc-cover-copy">
                  <span className="tc-image-badge">
                    {trip.status === "completed" ? "Completed" : "On the go"}
                  </span>
                  <h1>{trip.name}</h1>
                  <p>
                    {formatDateRange(trip)} ·{" "}
                    {trip.participants.length === 1
                      ? "Solo trip"
                      : `${trip.participants.length} members`}
                  </p>
                </div>
              </div>
              <div className="tc-summary">
                <section className="tc-card">
                  <span className="tc-eyebrow">TOTAL SPENT</span>
                  <strong className="tc-amount">
                    {formatMoney(
                      finances!.stats.totalSpent,
                      trip.currencySymbol,
                    )}
                  </strong>
                  <p>
                    {trip.expenses.length}{" "}
                    {trip.expenses.length === 1 ? "expense" : "expenses"}
                    {trip.participants.length > 1 ? ", shared together" : ""}
                  </p>
                </section>
                <section className="tc-card">
                  <span className="tc-eyebrow">YOUR BALANCE</span>
                  {personalBalance ? (
                    <>
                      <strong className="tc-amount">
                        {formatMoney(
                          Math.abs(personalBalance.netBalance),
                          trip.currencySymbol,
                        )}
                      </strong>
                      <p>
                        {personalBalance.netBalance > 0
                          ? "To receive"
                          : personalBalance.netBalance < 0
                            ? "To pay"
                            : "All square"}{" "}
                        · {personalBalance.participantName}
                      </p>
                    </>
                  ) : (
                    <>
                      <p>Select your trip identity to see your balance.</p>
                      <button
                        className="tc-text-button"
                        onClick={() => setModal("identity")}
                      >
                        Choose your identity <ArrowRight size={16} />
                      </button>
                    </>
                  )}
                </section>
              </div>
              {trip.status !== "completed" && (
                <div className="tc-actions">
                  <button
                    className="tc-button primary"
                    onClick={() => openExpense()}
                  >
                    <Plus size={19} />
                    Add expense
                  </button>
                </div>
              )}
              <section className="tc-card" aria-labelledby="home-balances">
                <div className="tc-section-title">
                  <h2 id="home-balances">Who pays whom</h2>
                  <button
                    className="tc-text-button"
                    onClick={() => openTrip(trip.id, "balances")}
                  >
                    All balances <ArrowRight size={16} />
                  </button>
                </div>
                {trip.participants.length < 2 ? (
                  <>
                    <p className="tc-balances-empty">
                      Solo trip, so there is no one to settle with. Add members
                      to split costs.
                    </p>
                    {trip.status !== "completed" && (
                      <button
                        className="tc-text-button"
                        onClick={() => setModal("members")}
                      >
                        <Users size={16} />
                        Add members
                      </button>
                    )}
                  </>
                ) : finances!.debts.length ? (
                  <table className="tc-debt-table">
                    <thead>
                      <tr>
                        <th scope="col">From → To</th>
                        <th scope="col" className="tc-num">
                          Amount
                        </th>
                        <th scope="col">
                          <span className="sr-only">Action</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {finances!.debts.map((d) => {
                        const fromName =
                          d.from.id === currentId ? "You" : d.from.name;
                        const toName = d.to.id === currentId ? "You" : d.to.name;
                        return (
                          <tr key={d.id}>
                            <td>
                              <div className="tc-debt-pair">
                                <span
                                  className={
                                    d.from.id === currentId ? "is-me" : undefined
                                  }
                                  title={d.from.name}
                                >
                                  {fromName}
                                </span>
                                <ArrowRight size={14} aria-label="pays" />
                                <span
                                  className={
                                    d.to.id === currentId ? "is-me" : undefined
                                  }
                                  title={d.to.name}
                                >
                                  {toName}
                                </span>
                              </div>
                            </td>
                            <td className="tc-num">
                              {formatMoney(d.amount, trip.currencySymbol)}
                            </td>
                            <td>
                              <button
                                className="tc-settle-button"
                                onClick={() => openPayment(d)}
                                aria-label={`Settle ${formatMoney(d.amount, trip.currencySymbol)} from ${d.from.name} to ${d.to.name}`}
                              >
                                Settle
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p className="tc-balances-empty">
                    {trip.expenses.length
                      ? "All square. Nobody owes anything right now."
                      : "Balances appear here after the first expense."}
                  </p>
                )}
              </section>
              <button
                className="tc-card tc-packing-link"
                onClick={() => openTrip(trip.id, "essentials")}
              >
                <div>
                  <h2>Packing for the journey</h2>
                  <p>
                    {packing.packed} of {packing.total} items packed
                    {trip.isPackingComplete ? " · Ready to go" : ""}
                  </p>
                  <progress
                    value={packing.packed}
                    max={packing.total || 1}
                    aria-label="Packing progress"
                  />
                </div>
                <ArrowRight size={20} />
              </button>
              <section className="tc-card">
                <div className="tc-section-title">
                  <h2>Recent expenses</h2>
                  <button
                    className="tc-text-button"
                    onClick={() => openTrip(trip.id, "expenses")}
                  >
                    See all <ArrowRight size={16} />
                  </button>
                </div>
                {trip.expenses.length ? (
                  [...trip.expenses]
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 3)
                    .map((e) => (
                      <div className="tc-list-row" key={e.id}>
                        <div>
                          <strong>{e.title}</strong>
                          <p>
                            {
                              trip.participants.find((p) => p.id === e.paidById)
                                ?.name
                            }{" "}
                            paid · {e.date.slice(0, 10)}
                          </p>
                        </div>
                        <strong>
                          {formatMoney(e.amount, trip.currencySymbol)}
                        </strong>
                      </div>
                    ))
                ) : (
                  <p>No expenses yet. The first one starts the story.</p>
                )}
              </section>
            </>
          ) : section === "essentials" ? (
            <Packing
              trip={trip}
              onToggleItem={(id) => void tripActions.toggleItem(trip.id, id)}
              onTogglePackingComplete={() =>
                void tripActions.finishPacking(trip.id)
              }
              onUpdateQuantity={(id, q) =>
                void tripActions.checklist(trip.id, id, { quantity: q })
              }
              onAssignItem={(id, p) =>
                void tripActions.checklist(trip.id, id, {
                  assignedToParticipantId: p,
                })
              }
              onAddItem={(i) => tripActions.addItem(trip.id, i)}
              onDeleteItem={(id) => void tripActions.deleteItem(trip.id, id)}
              onResetChecklist={(type) =>
                void tripActions.resetPacking(trip.id, type)
              }
            />
          ) : section === "expenses" ? (
            <>
              <div className="tc-subnav">
                <button
                  className="tc-text-button"
                  onClick={() => openTrip(trip.id, "analytics")}
                >
                  Spending insights <ArrowRight size={16} />
                </button>
              </div>
              <Expenses
                trip={trip}
                onOpenAddExpense={() => openExpense()}
                onEditExpense={openExpense}
                onDeleteExpense={(id) =>
                  void saved(
                    tripActions.deleteExpense(trip.id, id),
                    "Expense deleted",
                  )
                }
              />
            </>
          ) : section === "balances" ? (
            <Balances
              trip={trip}
              simplifiedDebts={finances!.debts}
              onOpenSettleUp={openPayment}
              onEditSettlement={(p) => {
                setDebt(undefined);
                setPayment(p);
                setModal("payment");
              }}
              onDeleteSettlement={(id) =>
                void saved(
                  tripActions.deleteSettlement(trip.id, id),
                  "Payment deleted",
                )
              }
            />
          ) : section === "analytics" ? (
            <>
              <button
                className="tc-text-button"
                onClick={() => openTrip(trip.id, "expenses")}
              >
                <ArrowLeft size={16} />
                Expenses
              </button>
              <Insights trip={trip} />
            </>
          ) : section === "activity" ? (
            <>
              <button
                className="tc-text-button"
                onClick={() => openTrip(trip.id, "details")}
              >
                <ArrowLeft size={16} />
                Trip details
              </button>
              <Activity trip={trip} />
            </>
          ) : (
            <>
              <div className="tc-page-heading">
                <div>
                  <h1>Trip details</h1>
                  <p>The people and plans behind {trip.name}.</p>
                </div>
                <button className="tc-button" onClick={() => setModal("edit")}>
                  Edit details
                </button>
              </div>
              <section className="tc-card">
                <h2>Dates & cover</h2>
                <p>{formatDateRange(trip)}</p>
                <p>{trip.description}</p>
                <PhotoPicker
                  kind="cover"
                  label="trip cover"
                  photoId={trip.coverPhotoId}
                  onChange={(id, color) =>
                    tripActions.cover(trip.id, id, color)
                  }
                />
              </section>
              <section className="tc-card">
                <div className="tc-section-title">
                  <h2>Members</h2>
                  {trip.status !== "completed" && (
                    <button
                      className="tc-text-button"
                      onClick={() => setModal("members")}
                    >
                      Manage members
                    </button>
                  )}
                </div>
                <div className="tc-member-list">
                  {trip.participants.map((p) => (
                    <span key={p.id}>
                      {p.avatar} {p.name}
                      {p.id === currentId ? " · This device" : ""}
                    </span>
                  ))}
                </div>
                <button
                  className="tc-button"
                  onClick={() => setModal("identity")}
                >
                  Change device identity
                </button>
              </section>
              <section className="tc-card">
                <h2>Share & history</h2>
                <div className="tc-actions">
                  <button
                    className="tc-button"
                    onClick={() => setModal("share")}
                  >
                    <Share2 size={18} />
                    Share summary
                  </button>
                  <button
                    className="tc-button"
                    onClick={() => setModal("backup")}
                  >
                    Backup trip
                  </button>
                  <button
                    className="tc-button"
                    onClick={() => openTrip(trip.id, "activity")}
                  >
                    Activity history
                  </button>
                </div>
              </section>
              <section className="tc-card">
                <h2>
                  {trip.status === "completed"
                    ? "Trip completed"
                    : "Ready to wrap up?"}
                </h2>
                <p>
                  Completing a trip locks expenses and members. Payments can
                  still be recorded.
                </p>
                <button
                  className="tc-button primary"
                  onClick={() =>
                    setModal(
                      trip.status === "completed" ? "reopen" : "complete",
                    )
                  }
                >
                  {trip.status === "completed"
                    ? "Reopen trip"
                    : "Complete trip"}
                </button>
              </section>
              <button
                className="tc-button danger"
                onClick={async () => {
                  if (
                    confirm(`Delete “${trip.name}” from this device?`) &&
                    (await tripActions.remove(trip.id))
                  )
                    go("/trips/");
                }}
              >
                Delete this trip
              </button>
            </>
          )}
        </main>
      </div>
      {trip && (
        <Navigation
          activeTab={section as TabType}
          setActiveTab={(tab) => openTrip(trip.id, tab)}
          pendingDebtsCount={finances!.debts.length}
          pendingPackingCount={packing.pending}
          tripName={trip.name}
          onOpenSettings={() => go("/settings/")}
        />
      )}
      {modal === "new" && (
        <NewTrip
          isOpen
          userProfile={store.data.profile}
          existingTrips={store.data.trips}
          onClose={close}
          onCreateTrip={async (t, host) => {
            const id = await tripActions.create(t, host);
            if (id) openTrip(id);
            return Boolean(id);
          }}
        />
      )}
      {modal === "profile" && (
        <Profile
          isOpen
          initialProfile={store.data.profile}
          onClose={close}
          onSaveProfile={(p) => saved(tripActions.profile(p), "Profile saved")}
        />
      )}
      {modal === "backup" && (
        <Backup
          isOpen
          trip={selectedBackupTrip}
          onClose={close}
          onOpenClaimIdentity={() => setModal("identity")}
          onImportTrip={async (t) => {
            const ok = await tripActions.import(t);
            if (ok) openTrip(t.id);
            return ok;
          }}
        />
      )}
      {trip && (
        <>
          {modal === "expense" && (
            <ExpenseForm
              isOpen
              trip={trip}
              expenseToEdit={expense}
              onClose={close}
              onSaveExpense={(e, id) =>
                saved(tripActions.expense(trip.id, e, id), "Expense saved")
              }
            />
          )}
          {modal === "payment" && (
            <PaymentForm
              isOpen
              trip={trip}
              presetDebt={debt}
              settlementToEdit={payment}
              onClose={close}
              onSaveSettlement={(s, id) =>
                saved(
                  tripActions.settlement(trip.id, s, id),
                  "Payment recorded",
                )
              }
            />
          )}
          {modal === "edit" && (
            <EditTrip
              isOpen
              trip={trip}
              onClose={close}
              onSave={async (d) => {
                const ok = await saved(tripActions.details(trip.id, d));
                if (ok) close();
                return ok;
              }}
            />
          )}
          {modal === "members" && (
            <Members
              isOpen
              trip={trip}
              currentParticipantId={currentId}
              onClose={close}
              onAddParticipant={(p) => tripActions.addMember(trip.id, p)}
              onUpdateParticipant={(id, name) =>
                tripActions.renameMember(trip.id, id, name)
              }
              onRemoveParticipant={(id) =>
                void tripActions.removeMember(trip.id, id)
              }
            />
          )}
          {modal === "identity" && (
            <Identity
              isOpen
              trip={trip}
              currentParticipantId={currentId}
              onClose={close}
              onClaimIdentity={(id) => tripActions.identity(trip.id, id)}
            />
          )}
          {modal === "complete" && (
            <Complete
              isOpen
              trip={trip}
              simplifiedDebts={finances!.debts}
              onClose={close}
              onConfirmComplete={(date) =>
                saved(tripActions.complete(trip.id, date), "Trip completed")
              }
            />
          )}
          {modal === "reopen" && (
            <Reopen
              isOpen
              trip={trip}
              onClose={close}
              onConfirm={async () => {
                if (await saved(tripActions.reopen(trip.id), "Trip reopened"))
                  close();
              }}
            />
          )}
          {modal === "share" && (
            <Share
              isOpen
              trip={trip}
              simplifiedDebts={finances!.debts}
              onClose={close}
            />
          )}
        </>
      )}
    </div>
  );
}
