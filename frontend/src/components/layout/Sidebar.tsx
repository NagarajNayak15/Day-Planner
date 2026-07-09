import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  to: string;
  label: string;
  icon: string;
}

const items: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/tasks', label: 'Tasks', icon: '✅' },
  { to: '/stats', label: 'Statistics', icon: '📊' },
  { to: '/settings', label: 'Settings', icon: '⚙️' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            )
          }
        >
          <span className="text-lg">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const streak = user?.currentStreak ?? 0;
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-3 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
            ⏱
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">DayPlanner</span>
        </div>
        <div
          title={`Current streak: ${streak} day${streak === 1 ? '' : 's'}`}
          className={cn(
            'flex items-center gap-1 rounded-full px-2.5 py-1 text-sm font-semibold',
            streak > 0
              ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400'
              : 'bg-slate-100 text-slate-400 dark:bg-slate-800'
          )}
        >
          <span>🔥</span>
          <span>{streak}</span>
        </div>
      </div>
      <div className="flex-1 px-3">
        <NavItems onNavigate={onNavigate} />
      </div>
      <div className="px-4 py-4 text-xs text-slate-400">
        Plan your day. Build your streak.
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white md:block dark:border-slate-800 dark:bg-slate-900">
      <SidebarContent />
    </aside>
  );
}

export function MobileSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <div className={cn('fixed inset-0 z-50 md:hidden', open ? '' : 'pointer-events-none')}>
      <div
        className={cn(
          'absolute inset-0 bg-slate-900/50 transition-opacity',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute left-0 top-0 h-full w-64 border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>
  );
}
