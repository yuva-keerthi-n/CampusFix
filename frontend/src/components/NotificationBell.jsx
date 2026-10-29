import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, BellOff } from 'lucide-react';
import * as notificationsService from '../services/notifications.service';
import { formatDateTime } from '../utils/format';

// In-app notifications. Polls every 20 seconds so updates appear without a refresh.
export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setItems(await notificationsService.list());
    } catch {
      // Background refresh: stay quiet if it fails, the next poll will retry.
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = items.filter((n) => !n.isRead);

  const openItem = async (n) => {
    setOpen(false);
    if (!n.isRead) {
      try {
        await notificationsService.markRead(n.id);
        setItems((list) => list.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
      } catch {
        // Marking as read is best-effort; still take the user to the complaint.
      }
    }
    navigate(`/complaints/${n.complaintId}`);
  };

  const markAll = async () => {
    await Promise.allSettled(unread.map((n) => notificationsService.markRead(n.id)));
    load();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => {
          setOpen((o) => !o);
          load();
        }}
        className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-200/60"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {unread.length > 9 ? '9+' : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-x-3 top-16 z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="text-sm font-bold text-ink-900">Notifications</h3>
            {unread.length > 0 && (
              <button onClick={markAll} className="text-xs font-semibold text-brand-700 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-slate-400">
                <BellOff className="h-6 w-6" />
                <p className="text-sm">You're all caught up.</p>
              </div>
            ) : (
              items.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  onClick={() => openItem(n)}
                  className={`flex w-full gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-0 hover:bg-slate-50 ${
                    n.isRead ? '' : 'bg-brand-50/50'
                  }`}
                >
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? 'bg-transparent' : 'bg-brand-600'}`} />
                  <span className="min-w-0">
                    <span className="block text-sm text-slate-700">{n.message}</span>
                    <span className="mt-0.5 block text-xs text-slate-400">{formatDateTime(n.createdAt)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
