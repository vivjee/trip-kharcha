"use client";
import { useMemo, useState } from "react";
import type { Trip } from "@/types/trip";
import { formatDateTime } from "@/lib/date-utils";
import Pagination, { PAGE_SIZE } from "./Pagination";
export default function ActivityLogView({ trip }: { trip: Trip }) {
  const [member, setMember] = useState("all");
  const [page, setPage] = useState(0);
  const logs = useMemo(
    () =>
      (trip.auditLogs || [])
        .filter((l) => member === "all" || l.performedBy.id === member)
        .slice()
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    [trip.auditLogs, member],
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(logs.length / PAGE_SIZE) - 1),
  );
  return (
    <div className="tc-view">
      <div className="tc-page-heading">
        <div>
          <h1>Activity history</h1>
          <p>A record of the changes made to this trip.</p>
        </div>
      </div>
      <label className="tc-field">
        Filter by member
        <select
          value={member}
          onChange={(e) => {
            setMember(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">
            All members · {(trip.auditLogs || []).length} changes
          </option>
          {trip.participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <div className="tc-card">
        {logs
          .slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)
          .map((log) => (
            <article className="tc-activity" key={log.id}>
              <div className="tc-section-title">
                <strong>
                  {log.performedBy.avatar} {log.performedBy.name}
                </strong>
                <time dateTime={log.timestamp}>
                  {formatDateTime(log.timestamp)}
                </time>
              </div>
              <p>{log.details}</p>
              <span className="tc-help">
                {log.actionType.toLowerCase().replaceAll("_", " ")}
              </span>
            </article>
          ))}
        {!logs.length && <p className="tc-empty">No activity to show.</p>}
      </div>
      <Pagination page={safePage} count={logs.length} onChange={setPage} />
    </div>
  );
}
