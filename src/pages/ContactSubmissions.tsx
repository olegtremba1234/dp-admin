import { useEffect, useState } from 'react';
import { Trash2, CheckCircle2, Circle, Mail, Phone } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { contactApi } from '../api/resources';
import type { ContactSubmission } from '../types';

export default function ContactSubmissions() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load() {
    setIsLoading(true);
    setItems(await contactApi.list());
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleResolved(item: ContactSubmission) {
    setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isResolved: !i.isResolved } : i)));
    await contactApi.setResolved(item._id, !item.isResolved);
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await contactApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Звернення" description="Звернення громадян та клієнтів зі сторінки «Контакти»" />

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-navy-400">Завантаження...</p>
        ) : items.length === 0 ? (
          <p className="text-center text-navy-400">Звернень ще немає</p>
        ) : (
          items.map((item) => (
            <div key={item._id} className={`rounded-xl border bg-white p-4 shadow-sm ${item.isResolved ? 'border-navy-100 opacity-70' : 'border-brand-emerald-200'}`}>
              <div className="mb-2 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-navy-900">{item.subject}</p>
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
              <p className="mb-3 text-sm text-navy-600">{item.message}</p>
              <div className="flex flex-wrap gap-4 text-xs text-navy-500">
                <span className="flex items-center gap-1"><Phone size={12} /> {item.phone}</span>
                {item.email && <span className="flex items-center gap-1"><Mail size={12} /> {item.email}</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog isOpen={!!deleteId} title="Видалити звернення?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={isDeleting} />
    </div>
  );
}
