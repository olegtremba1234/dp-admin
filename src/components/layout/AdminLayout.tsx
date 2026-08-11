import { useCallback, useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  FileText,
  Newspaper,
  Gavel,
  Briefcase,
  ClipboardList,
  Mail,
  MessageSquareText,
  LogOut,
  Wheat,
  Menu,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  contactApi,
  listingRequestsApi,
  vacancyApplicationsApi,
} from "../../api/resources";
import ScrollToTopButton from "../ui/ScrollToTopButton";

type CountKey = "contact" | "requests" | "vacancyApplications";

const navItems: {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
  countKey?: CountKey;
}[] = [
  { to: "/", label: "Огляд", icon: LayoutDashboard, end: true },
  { to: "/listings", label: "Оголошення", icon: Package },
  { to: "/categories", label: "Категорії", icon: FolderTree },
  { to: "/documents", label: "Документи", icon: FileText },
  { to: "/news", label: "Новини", icon: Newspaper },
  { to: "/tenders", label: "Тендери", icon: Gavel },
  { to: "/vacancies", label: "Вакансії", icon: Briefcase },
  {
    to: "/contact-submissions",
    label: "Звернення",
    icon: Mail,
    countKey: "contact",
  },
  {
    to: "/listing-requests",
    label: "Заявки по оголошеннях",
    icon: MessageSquareText,
    countKey: "requests",
  },
  {
    to: "/vacancy-applications",
    label: "Відгуки на вакансії",
    icon: ClipboardList,
    countKey: "vacancyApplications",
  },
];

export function ProtectedRoute() {
  const { admin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-navy-400">
        Завантаження...
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  return <AdminLayout />;
}

export interface AdminLayoutContext {
  refreshCounts: () => void;
}

const POLL_INTERVAL_MS = 30_000;

function AdminLayout() {
  const { admin, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [counts, setCounts] = useState<Record<CountKey, number>>({
    contact: 0,
    requests: 0,
    vacancyApplications: 0,
  });

  const refreshCounts = useCallback(() => {
    contactApi
      .list()
      .then((items) =>
        setCounts((c) => ({
          ...c,
          contact: items.filter((i) => !i.isResolved).length,
        })),
      )
      .catch(() => {});
    listingRequestsApi
      .list()
      .then((items) =>
        setCounts((c) => ({
          ...c,
          requests: items.filter((i) => !i.isResolved).length,
        })),
      )
      .catch(() => {});
    vacancyApplicationsApi
      .list()
      .then((items) =>
        setCounts((c) => ({
          ...c,
          vacancyApplications: items.filter((i) => !i.isResolved).length,
        })),
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    refreshCounts();
    const interval = setInterval(refreshCounts, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refreshCounts]);

  // Закривати мобільне меню при зміні роута
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-[#f4f6f9]">
      {/* Оверлей для мобільного меню */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-navy-950/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Адаптивний Сайдбар (Десктоп + Мобільне висувне меню) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-navy-100 bg-navy-950 text-navy-200 transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-navy-900 px-5 py-4 lg:py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-emerald-600 text-white">
              <Wheat size={20} />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-bold text-white">ДП «Монастириське»</p>
              <p className="text-[11px] text-navy-400">Адмін-панель</p>
            </div>
          </div>
          {/* Кнопка закриття меню для мобілки */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="rounded-lg p-1 text-navy-400 hover:bg-navy-900 hover:text-white lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, label, icon: Icon, end, countKey }) => {
            const count = countKey ? counts[countKey] : 0;
            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-brand-emerald-600 text-white"
                      : "text-navy-300 hover:bg-navy-900 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span className="flex-1">{label}</span>
                {count > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-navy-900 p-3">
          <div className="mb-2 px-2">
            <p className="truncate text-xs font-semibold text-white">
              {admin?.name}
            </p>
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
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Мобільна шапка з кнопкою Бургер-меню */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-navy-100 bg-white px-4 py-3 lg:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="rounded-lg p-1.5 text-navy-700 hover:bg-navy-50"
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-emerald-600 text-white">
                <Wheat size={14} />
              </span>
              <p className="text-sm font-bold text-navy-900">Адмін-панель</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="rounded-lg p-1.5 text-navy-400 hover:bg-navy-50"
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Область сторінок (додано min-w-0 і overflow-x-hidden для уникнення поломки від таблиць) */}
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <Outlet context={{ refreshCounts }} />
        </main>
      </div>

      <ScrollToTopButton />
    </div>
  );
}
