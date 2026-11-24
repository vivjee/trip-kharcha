"use client";
export const PAGE_SIZE = 50;
export default function Pagination({
  page,
  count,
  onChange,
}: {
  page: number;
  count: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / PAGE_SIZE));
  if (pages === 1) return null;
  return (
    <nav className="tc-pagination" aria-label="List pages">
      <button
        className="tc-button"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        Previous
      </button>
      <span aria-live="polite">
        {page + 1} / {pages} · {count} entries
      </span>
      <button
        className="tc-button"
        disabled={page >= pages - 1}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  );
}
