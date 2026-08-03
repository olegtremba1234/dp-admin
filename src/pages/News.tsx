import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Upload, Loader2, ImageOff } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Input, Textarea } from '../components/ui/Fields';
import { newsApi, uploadApi } from '../api/resources';
import { resolveFileUrl } from '../api/client';
import type { NewsItem } from '../types';

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  date: new Date().toISOString().slice(0, 10),
  image: '',
  isPublished: true,
};

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load() {
    setIsLoading(true);
    setNews(await newsApi.list());
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

  function openEdit(item: NewsItem) {
    setEditingId(item._id);
    setForm({
      title: item.title,
      excerpt: item.excerpt,
      content: item.content || '',
      date: item.date.slice(0, 10),
      image: item.image || '',
      isPublished: item.isPublished,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleImageUpload(file: File | null) {
    if (!file) return;
    setIsUploading(true);
    try {
      const url = await uploadApi.image(file);
      setForm((f) => ({ ...f, image: url }));
    } catch {
      setError('Не вдалося завантажити зображення');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      if (editingId) {
        await newsApi.update(editingId, form);
      } else {
        await newsApi.create(form);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося зберегти новину');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await newsApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Новини"
        description="Новини та офіційні повідомлення на головній сторінці"
        action={<Button onClick={openCreate}><Plus size={16} /> Додати новину</Button>}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          <p className="text-center text-navy-400">Завантаження...</p>
        ) : news.length === 0 ? (
          <p className="text-center text-navy-400">Новин ще немає</p>
        ) : (
          news.map((item) => (
            <div key={item._id} className="overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm">
              <div className="h-32 w-full bg-navy-100">
                {item.image ? (
                  <img src={resolveFileUrl(item.image)} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-navy-300"><ImageOff size={24} /></div>
                )}
              </div>
              <div className="p-3">
                <div className="mb-1 flex items-center gap-2 text-xs text-navy-400">
                  <span>{new Date(item.date).toLocaleDateString('uk-UA')}</span>
                  {!item.isPublished && <span className="rounded bg-amber-50 px-1.5 py-0.5 text-amber-700">Чернетка</span>}
                </div>
                <p className="mb-2 line-clamp-2 text-sm font-semibold text-navy-900">{item.title}</p>
                <div className="flex justify-end gap-1.5">
                  <button onClick={() => openEdit(item)} className="rounded-md p-1.5 text-navy-500 hover:bg-navy-50 hover:text-navy-800">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => setDeleteId(item._id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal title={editingId ? 'Редагувати новину' : 'Нова новина'} isOpen={modalOpen} onClose={() => setModalOpen(false)} width="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <Input label="Заголовок" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Textarea label="Короткий опис (excerpt)" required rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <Textarea label="Повний текст (необов'язково)" rows={5} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Дата публікації" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy-600">Статус</label>
              <label className="flex h-[38px] items-center gap-2 text-sm text-navy-700">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="h-4 w-4 rounded border-navy-300 text-brand-emerald-600"
                />
                Опубліковано
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">Зображення</label>
            {form.image ? (
              <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-lg border border-navy-100">
                <img src={resolveFileUrl(form.image)} alt="" className="h-full w-full object-cover" />
                <button type="button" onClick={() => setForm({ ...form, image: '' })} className="absolute right-1 top-1 rounded-full bg-navy-950/70 px-2 py-0.5 text-xs text-white">
                  Змінити
                </button>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-300 px-3 py-4 text-sm text-navy-400 hover:border-brand-emerald-500 hover:text-brand-emerald-600">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isUploading ? 'Завантаження...' : 'Завантажити зображення'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Скасувати</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Збереження...' : 'Зберегти'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Видалити новину?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={isDeleting} />
    </div>
  );
}
