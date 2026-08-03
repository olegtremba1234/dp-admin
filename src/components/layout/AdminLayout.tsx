import { NavLink, Navigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Newspaper,
  Gavel,
  Mail,
  MessageSquareText,
  LogOut,
  Wheat,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', label: 'Огляд', icon: LayoutDashboard, end: true },
  { to: '/listings', label: 'Оголошення', icon: Package },
  { to: '/categories', label: 'Категорії', icon: FolderTree },
  { to: '/documents', label: 'Документи', icon: FileText },
  { to: '/news', label: 'Новини', icon: Newspaper },
  { to: '/tenders', label: 'Тендери', icon: Gavel },
  { to: '/contact-submissions', label: 'Звернення', icon: Mail },
  { to: '/listing-requests', label: 'Заявки по оголошеннях', icon: MessageSquareText },
];

export function ProtectedRoute() {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-navy-400">Завантаження...</div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  return <AdminLayout />;
}

function AdminLayout() {
  const { admin, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-[#f4f6f9]">
      {/* Сайдбар */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-navy-100 bg-navy-950 text-navy-200 lg:flex">
        <div className="flex items-center gap-3 border-b border-navy-900 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-emerald-600 text-white">
            <Wheat size={20} />
          </span>
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">ДП «Монастириське»</p>
            <p className="text-[11px] text-navy-400">Адмін-панель</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-emerald-600 text-white'
                    : 'text-navy-300 hover:bg-navy-900 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-navy-900 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-xs font-semibold text-white">{admin?.name}</p>
            <p className="truncate text-[11px] text-navy-400">{admin?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-navy-300 hover:bg-navy-900 hover:text-white"
          >
            <LogOut size={16} /> Вийти
          </button>
        </div>
      </aside>

      {/* Основний контент */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Мобільний топбар */}
        <header className="flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-emerald-600 text-white">
              <Wheat size={16} />
            </span>
            <p className="text-sm font-bold text-navy-900">Адмін-панель</p>
          </div>
          <button onClick={logout} className="text-navy-400">
            <LogOut size={18} />
          </button>
        </header>

        {/* Мобільна нижня навігація */}
        <nav className="order-2 flex overflow-x-auto border-t border-navy-100 bg-white px-2 py-1.5 lg:hidden">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium ${
                  isActive ? 'text-brand-emerald-700' : 'text-navy-400'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
