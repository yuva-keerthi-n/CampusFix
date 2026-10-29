import { PRIORITY_STYLES, STATUS_STYLES, statusLabel } from '../utils/status';

export function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.Reported;
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style.badge}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {statusLabel(status)}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
        PRIORITY_STYLES[priority] || PRIORITY_STYLES.Low
      }`}
    >
      {priority}
    </span>
  );
}
