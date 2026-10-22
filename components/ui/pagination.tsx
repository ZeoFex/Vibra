"use client";

import { useEffect, useState } from "react";

export function usePage<T>(items: T[], pageSize: number, resetKey: string) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    setPage(0);
  }, [resetKey]);

  const slice = items.slice(safePage * pageSize, safePage * pageSize + pageSize);
  return { slice, page: safePage, pageCount, setPage, start: safePage * pageSize };
}

export function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: pageCount }, (_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => onPage(index)}
          className={`h-9 min-w-9 rounded-full px-3 text-sm ${
            index === page ? "bg-violet-600 text-white" : "bg-white/10 text-white/70 hover:bg-white/15"
          }`}
          aria-current={index === page ? "page" : undefined}
        >
          {index + 1}
        </button>
      ))}
    </div>
  );
}
