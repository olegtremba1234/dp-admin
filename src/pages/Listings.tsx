import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, ImageOff, Upload, X as XIcon, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import { Input, Textarea, Select } from '../components/ui/Fields';
import { listingsApi, categoriesApi, uploadApi } from '../api/resources';
import { resolveFileUrl } from '../api/client';
import type { Listing, Category } from '../types';

const PAGE_SIZE = 15;

type AttributeRow = { key: string; value: string };

const emptyForm = {
  title: '',
  type: 'sale' as 'sale' | 'service',
  category: '',
  price: '',
  isNegotiable: false,
  unit: '',
  description: '',
  images: [] as string[],
  status: 'active' as Listing['status'],
  isFeatured: false,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  location: '',
};

export default function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [attributes, setAttributes] = useState<AttributeRow[]>([{ key: '', value: '' }]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');

  async function loadListings(targetPage = page) {
    setIsLoading(true);
    const res = await listingsApi.listAll(targetPage, PAGE_SIZE);
    setListings(res.items);
    setTotal(res.total);
    setPages(res.pages);
    setIsLoading(false);
  }

  useEffect(() => {
    categoriesApi.list().then(setCategories);
  }, []);

  useEffect(() => {
    loadListings(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm });
    setAttributes([{ key: '', value: '' }]);
    setError('');
    setModalOpen(true);
  }

  function openEdit(listing: Listing) {
    setEditingId(listing._id);
    setForm({
      title: listing.title,
      type: listing.type,
      category: typeof listing.category === 'string' ? listing.category : listing.category._id,
      price: listing.price === null ? '' : String(listing.price),
      isNegotiable: listing.isNegotiable,
      unit: listing.unit || '',
      description: listing.description,
      images: listing.images || [],
      status: listing.status,
      isFeatured: listing.isFeatured,
      contactName: listing.contactName,
      contactPhone: listing.contactPhone,
      contactEmail: listing.contactEmail || '',
      location: listing.location || '',
    });
    const attrEntries = Object.entries(listing.attributes || {});
    setAttributes(attrEntries.length ? attrEntries.map(([key, value]) => ({ key, value })) : [{ key: '', value: '' }]);
    setError('');
    setModalOpen(true);
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files || !files.length) return;
    setIsUploading(true);
    try {
      const urls = await uploadApi.images(Array.from(files));
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch {
      setError('Не вдалося завантажити зображення');
    } finally {
      setIsUploading(false);
    }
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((i) => i !== url) }));
  }

  function updateAttribute(idx: number, field: 'key' | 'value', value: string) {
    setAttributes((rows) => rows.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  }

  function addAttributeRow() {
    setAttributes((rows) => [...rows, { key: '', value: '' }]);
  }

  function removeAttributeRow(idx: number) {
    setAttributes((rows) => rows.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.category) {
      setError('Оберіть категорію');
      return;
    }

    const attributesObj: Record<string, string> = {};
    attributes.forEach((row) => {
      if (row.key.trim()) attributesObj[row.key.trim()] = row.value.trim();
    });

    const payload = {
      title: form.title,
      type: form.type,
      category: form.category,
      price: form.price === '' ? null : Number(form.price),
      isNegotiable: form.isNegotiable,
      unit: form.unit,
      description: form.description,
      images: form.images,
      attributes: attributesObj,
      status: form.status,
      isFeatured: form.isFeatured,
      contactName: form.contactName,
      contactPhone: form.contactPhone,
      contactEmail: form.contactEmail,
      location: form.location,
    };

    setIsSaving(true);
    try {
      if (editingId) {
        await listingsApi.update(editingId, payload);
        await loadListings(page);
      } else {
        await listingsApi.create(payload);
        // Нові оголошення сортуються найновішими згори — показуємо першу сторінку
        setPage(1);
        await loadListings(1);
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося зберегти оголошення');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await listingsApi.remove(deleteId);
      setDeleteId(null);
      // Якщо видалили останній запис на не першій сторінці — повертаємось на попередню
      const isLastItemOnPage = listings.length === 1 && page > 1;
      const targetPage = isLastItemOnPage ? page - 1 : page;
      if (isLastItemOnPage) setPage(targetPage);
      await loadListings(targetPage);
    } finally {
      setIsDeleting(false);
    }
  }

  const filteredCategories = categories.filter((c) => c.type === form.type);

  return (
    <div>
      <PageHeader
        title="Оголошення"
        description={`Керування дошкою оголошень: продаж продукції та надання послуг${total ? ` · всього ${total}` : ''}`}
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> Додати оголошення
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-xl border border-navy-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy-50 text-xs uppercase tracking-wide text-navy-500">
            <tr>
              <th className="px-4 py-3">Фото</th>
              <th className="px-4 py-3">Назва</th>
              <th className="px-4 py-3">Тип</th>
              <th className="px-4 py-3">Ціна</th>
              <th className="px-4 py-3">Статус</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-navy-400">
                  Завантаження...
                </td>
              </tr>
            ) : listings.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-navy-400">
                  Оголошень ще немає
                </td>
              </tr>
            ) : (
              listings.map((listing) => (
                <tr key={listing._id} className="border-t border-navy-100">
                  <td className="px-4 py-2.5">
                    <div className="h-12 w-16 overflow-hidden rounded-md bg-navy-100">
                      {listing.images[0] ? (
                        <img src={listing.images[0]} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-navy-300">
                          <ImageOff size={16} />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="max-w-[240px] px-4 py-2.5 font-medium text-navy-900">
                    <p className="line-clamp-1">{listing.title}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        listing.type === 'sale'
                          ? 'bg-brand-emerald-100 text-brand-emerald-800'
                          : 'bg-navy-100 text-navy-700'
                      }`}
                    >
                      {listing.type === 'sale' ? 'Продаж' : 'Послуга'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-navy-600">
                    {listing.price === null ? 'Договірна' : `${listing.price.toLocaleString('uk-UA')} грн`}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusPill status={listing.status} />
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(listing)}
                        className="rounded-md p-1.5 text-navy-500 hover:bg-navy-50 hover:text-navy-800"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => setDeleteId(listing._id)}
                        className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                      >
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

      <Pagination page={page} pages={pages} onChange={handlePageChange} />

      {/* Форма створення/редагування */}
      <Modal
        title={editingId ? 'Редагувати оголошення' : 'Нове оголошення'}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        width="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

          <Input
            label="Назва оголошення"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Select
              label="Тип"
              required
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'sale' | 'service', category: '' })}
            >
              <option value="sale">Продаж</option>
              <option value="service">Послуга</option>
            </Select>
            <Select
              label="Категорія"
              required
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="">Оберіть категорію</option>
              {filteredCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Ціна, грн"
              type="number"
              min={0}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              hint="Залиште порожнім для «Договірна»"
            />
            <Input
              label="Одиниця виміру"
              placeholder="за м³, за годину..."
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
            />
            <Select
              label="Статус"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as Listing['status'] })}
            >
              <option value="active">В наявності</option>
              <option value="reserved">Заброньовано</option>
              <option value="archived">Архів (приховано)</option>
            </Select>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={form.isNegotiable}
                onChange={(e) => setForm({ ...form, isNegotiable: e.target.checked })}
                className="h-4 w-4 rounded border-navy-300 text-brand-emerald-600"
              />
              Можливий торг
            </label>
            <label className="flex items-center gap-2 text-sm text-navy-700">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="h-4 w-4 rounded border-navy-300 text-brand-emerald-600"
              />
              Показувати на головній ("Гарячі оголошення")
            </label>
          </div>

          <Textarea
            label="Опис"
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          {/* Характеристики */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">Характеристики</label>
            <div className="space-y-2">
              {attributes.map((row, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    placeholder="Назва (напр. Порода)"
                    value={row.key}
                    onChange={(e) => updateAttribute(idx, 'key', e.target.value)}
                    className="w-1/2 rounded-lg border border-navy-200 px-3 py-2 text-sm outline-none focus:border-brand-emerald-500"
                  />
                  <input
                    placeholder="Значення (напр. Сосна)"
                    value={row.value}
                    onChange={(e) => updateAttribute(idx, 'value', e.target.value)}
                    className="w-1/2 rounded-lg border border-navy-200 px-3 py-2 text-sm outline-none focus:border-brand-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttributeRow(idx)}
                    className="shrink-0 rounded-lg border border-navy-200 px-2 text-navy-400 hover:bg-navy-50"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addAttributeRow}
              className="mt-2 text-xs font-semibold text-brand-emerald-700 hover:underline"
            >
              + Додати характеристику
            </button>
          </div>

          {/* Зображення */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">Зображення</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {form.images.map((img) => (
                <div key={img} className="relative h-20 w-20 overflow-hidden rounded-lg border border-navy-100">
                  <img src={resolveFileUrl(img)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(img)}
                    className="absolute right-0.5 top-0.5 rounded-full bg-navy-950/70 p-0.5 text-white"
                  >
                    <XIcon size={12} />
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-navy-300 text-navy-400 hover:border-brand-emerald-500 hover:text-brand-emerald-600">
                {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                <span className="text-[10px]">Завантажити</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Контактна особа"
              required
              value={form.contactName}
              onChange={(e) => setForm({ ...form, contactName: e.target.value })}
            />
            <Input
              label="Телефон"
              required
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              placeholder="+380 97 123 45 67"
            />
            <Input
              label="Email (необов'язково)"
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
            />
            <Input
              label="Локація"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="смт Монастириське, ..."
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Скасувати
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Збереження...' : 'Зберегти'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Видалити оголошення?"
        description="Цю дію неможливо скасувати."
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}

function StatusPill({ status }: { status: Listing['status'] }) {
  const config = {
    active: { label: 'В наявності', className: 'bg-brand-emerald-50 text-brand-emerald-700' },
    reserved: { label: 'Заброньовано', className: 'bg-amber-50 text-amber-700' },
    archived: { label: 'Архів', className: 'bg-navy-100 text-navy-500' },
  }[status];

  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${config.className}`}>{config.label}</span>;
}
