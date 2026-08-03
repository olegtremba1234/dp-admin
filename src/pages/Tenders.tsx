import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Input, Select } from '../components/ui/Fields';
import { tendersApi } from '../api/resources';
import type { TenderItem, TenderStatus } from '../types';

const statusLabels: Record<TenderStatus, string> = {
  active: 'Активний',
  completed: 'Завершено',
  cancelled: 'Скасовано',
};

const emptyForm = {
  title: '',
  number: '',
  status: 'active' as TenderStatus,
  publishDate: new Date().toISOString().slice(0, 10),
  deadline: '',
  link: 'https://prozorro.gov.ua/',
};

export default function Tenders() {
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load() {
    setIsLoading(true);
    setTenders(await tendersApi.list());
    setIsLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setError('');
    setModalOpen(true);
  }

  function openEdit(t: TenderItem) {
    setEditingId(t._id);
    setForm({
      title: t.title,
      number: t.number,
      status: t.status,
      publishDate: t.publishDate.slice(0, 10),
      deadline: t.deadline ? t.deadline.slice(0, 10) : '',
      link: t.link,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const payload = { ...form, deadline: form.deadline || undefined };
      if (editingId) {
        await tendersApi.update(editingId, payload);
      } else {
        await tendersApi.create(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося зберегти тендер');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await tendersApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Тендери"
        description="Публічні закупівлі (Prozorro)"
        action={<Button onClick={openCreate}><Plus size={16} /> Додати тендер</Button>}
      />

      <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Назва</th>
              <th className="px-4 py-3">№</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3">Дата публікації</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-navy-400">Завантаження...</td></tr>
            ) : tenders.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-navy-400">Тендерів ще немає</td></tr>
            ) : (
              tenders.map((t) => (
                <tr key={t._id} className="border-t border-navy-100">
                  <td className="px-4 py-2.5 font-medium text-navy-900">{t.title}</td>
                  <td className="px-4 py-2.5 text-navy-500">{t.number}</td>
                  <td className="px-4 py-2.5">
                    <span className="rounded-full bg-navy-100 px-2 py-0.5 text-xs font-semibold text-navy-700">{statusLabels[t.status]}</span>
                  </td>
                  <td className="px-4 py-2.5 text-navy-500">{new Date(t.publishDate).toLocaleDateString('uk-UA')}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <a href={t.link} target="_blank" rel="noreferrer" className="rounded-md p-1.5 text-navy-400 hover:bg-navy-50">
                        <ExternalLink size={15} />
                      </a>
                      <button onClick={() => openEdit(t)} className="rounded-md p-1.5 text-navy-500 hover:bg-navy-50 hover:text-navy-800">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(t._id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal title={editingId ? 'Редагувати тендер' : 'Новий тендер'} isOpen={modalOpen} onClose={() => setModalOpen(false)} width="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <Input label="Назва закупівлі" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Input label="№ оголошення (Prozorro)" required value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="UA-2026-..." />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Статус" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TenderStatus })}>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <Input label="Дата публікації" type="date" required value={form.publishDate} onChange={(e) => setForm({ ...form, publishDate: e.target.value })} />
          </div>
          <Input label="Дедлайн (необов'язково)" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          <Input label="Посилання на Prozorro" required type="url" value={form.link} onChange={(e) => setForm({ ...form, link: e.target.value })} />

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Скасувати</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Збереження...' : 'Зберегти'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Видалити тендер?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={isDeleting} />
    </div>
  );
}
