import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Input, Select } from '../components/ui/Fields';
import { categoriesApi } from '../api/resources';
import type { Category } from '../types';

const emptyForm = { name: '', slug: '', type: 'sale' as 'sale' | 'service' };

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function load() {
    setIsLoading(true);
    setCategories(await categoriesApi.list());
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

  function openEdit(cat: Category) {
    setEditingId(cat._id);
    setForm({ name: cat.name, slug: cat.slug, type: cat.type });
    setError('');
    setModalOpen(true);
  }

  function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9а-яіїєґ\s-]/gi, '')
      .replace(/\s+/g, '-');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const payload = { ...form, slug: form.slug || slugify(form.name) };
      if (editingId) {
        await categoriesApi.update(editingId, payload);
      } else {
        await categoriesApi.create(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося зберегти категорію');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await categoriesApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Категорії"
        description="Категорії товарів та послуг для дошки оголошень"
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> Додати категорію
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Назва</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Тип</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-navy-400">Завантаження...</td></tr>
            ) : categories.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-navy-400">Категорій ще немає</td></tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat._id} className="border-t border-navy-100">
                  <td className="px-4 py-2.5 font-medium text-navy-900">{cat.name}</td>
                  <td className="px-4 py-2.5 text-navy-500">{cat.slug}</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        cat.type === 'sale' ? 'bg-brand-emerald-100 text-brand-emerald-800' : 'bg-navy-100 text-navy-700'
                      }`}
                    >
                      {cat.type === 'sale' ? 'Продаж' : 'Послуга'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(cat)} className="rounded-md p-1.5 text-navy-500 hover:bg-navy-50 hover:text-navy-800">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => setDeleteId(cat._id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
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

      <Modal title={editingId ? 'Редагувати категорію' : 'Нова категорія'} isOpen={modalOpen} onClose={() => setModalOpen(false)} width="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <Input label="Назва" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            hint="Залиште порожнім для автогенерації"
          />
          <Select label="Тип" required value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'sale' | 'service' })}>
            <option value="sale">Продаж</option>
            <option value="service">Послуга</option>
          </Select>
          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Скасувати</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Збереження...' : 'Зберегти'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Видалити категорію?"
        description="Оголошення цієї категорії залишаться, але без прив'язки до категорії."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
