import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

interface ChapterGameShellProps {
  instruction: string;
  reaction?: string;
  children: ReactNode;
}

export function ChapterGameShell({
  instruction,
  reaction,
  children,
}: ChapterGameShellProps) {
  return (
    <div className="space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900 text-white px-4 py-2">
        <p className="text-sm sm:text-base font-extrabold tracking-tight text-lime-300">
          {instruction}
        </p>
        {reaction && (
          <p
            className="text-xs font-medium text-slate-100 inline-flex items-center gap-1.5"
            role="status"
            aria-live="polite"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span>{reaction}</span>
          </p>
        )}
      </div>

      {children}
    </div>
  );
}
