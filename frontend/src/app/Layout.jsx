import { NavLink, Outlet } from 'react-router';
import DataMenu from './DataMenu';
import ServerStatus from './ServerStatus';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/research', label: 'Research Room' },
  { to: '/arena', label: 'Arena' },
  { to: '/debriefs', label: 'Past debates' },
];

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/" className="text-xl font-bold text-indigo-700">
            DebateLab
          </NavLink>
          <nav className="flex flex-wrap items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <DataMenu />
          </nav>
        </div>
      </header>

      <ServerStatus />

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
