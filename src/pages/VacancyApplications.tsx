import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, CheckCircle2, Circle, Phone, Mail, Briefcase } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { vacancyApplicationsApi } from '../api/resources';
import type { VacancyApplication } from '../types';
import type { AdminLayoutContext } from '../components/layout/AdminLayout';

export default function VacancyApplications() {
  const { refreshCounts } = useOutletContext<AdminLayoutContext>();
  const [items, setItems] = useState<VacancyApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load() {
    setIsLoading(true);
    setItems(await vacancyApplicationsApi.list());
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleResolved(item: VacancyApplication) {
    setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isResolved: !i.isResolved } : i)));
    await vacancyApplicationsApi.setResolved(item._id, !item.isResolved);
    refreshCounts();
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await vacancyApplicationsApi.remove(deleteId);
      setDeleteId(null);
      await load();
      refreshCounts();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Відгуки на вакансії" description="Заявки кандидатів зі сторінок вакансій" />

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-navy-400">Завантаження...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-navy-400">Відгуків ще немає</p>
        ) : (
          items.map((item) => {
            const vacancyTitle = typeof item.vacancy === 'string' ? item.vacancy : item.vacancy?.title;
            return (
              <div key={item._id} className={`rounded-xl border bg-white p-4 shadow-sm ${item.isResolved ? 'border-navy-100 opacity-70' : 'border-brand-emerald-200'}`}>
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-bold text-navy-900">
                      <Briefcase size={14} className="text-brand-emerald-600" /> {vacancyTitle || 'Вакансію видалено'}
                    </p>
                    <p className="text-xs text-navy-400">
                      {item.name} · {new Date(item.createdAt).toLocaleString('uk-UA')}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button onClick={() => toggleResolved(item)} className="rounded-md p-1.5 text-brand-emerald-600 hover:bg-brand-emerald-50">
                      {item.isResolved ? <CheckCircle2 size={17} /> : <Circle size={17} />}
                    </button>
                    <button onClick={() => setDeleteId(item._id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {item.message && <p className="mb-3 text-sm text-navy-600">{item.message}</p>}
                <div className="flex flex-wrap gap-4 text-xs text-navy-500">
                  <span className="flex items-center gap-1"><Phone size={12} /> {item.phone}</span>
                  {item.email && <span className="flex items-center gap-1"><Mail size={12} /> {item.email}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteId} title="Видалити відгук?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={isDeleting} />
    </div>
  );
}
