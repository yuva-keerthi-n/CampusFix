import { Wrench } from 'lucide-react';

export default function Logo({ light = false, size = 'md' }) {
  const box = size === 'lg' ? 'h-11 w-11' : 'h-9 w-9';
  return (
    <span className="inline-flex items-center gap-2.5">
      <span className={`${box} grid place-items-center rounded-xl bg-brand-600 text-white shadow-sm`}>
        <Wrench className="h-5 w-5" strokeWidth={2.4} />
      </span>
      <span className={`text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink-900'}`}>
        Campus<span className="text-brand-500">Fix</span>
      </span>
    </span>
  );
}
