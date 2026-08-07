import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}

// Формує компактний список сторінок з "..." для великої кількості сторінок,
// напр: 1 ... 4 5 [6] 7 8 ... 12
function getPageList(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | 'ellipsis')[] = [];
  sorted.forEach((p, idx) => {
    if (idx > 0 && p - sorted[idx - 1] > 1) result.push('ellipsis');
    result.push(p);
  });
  return result;
}

export default function Pagination({ page, pages, onChange }: PaginationProps) {
  if (pages <= 1) return null;

  const pageList = getPageList(page, pages);

  return (
    <nav className="mt-4 flex items-center justify-center gap-1.5" aria-label="Пагінація">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Попередня сторінка"
      >
        <ChevronLeft size={16} />
      </button>

      {pageList.map((p, idx) =>
        p === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="flex h-9 w-9 items-center justify-center text-navy-300">
            <MoreHorizontal size={16} />
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors ${
              p === page
                ? 'bg-brand-emerald-600 text-white'
                : 'border border-navy-200 text-navy-600 hover:bg-navy-50'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 text-navy-600 transition-colors hover:bg-navy-50 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Наступна сторінка"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
