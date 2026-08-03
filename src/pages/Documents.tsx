import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FileText, Upload, Loader2 } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Input, Select } from '../components/ui/Fields';
import { documentsApi, uploadApi } from '../api/resources';
import type { OfficialDocument, DocumentCategory } from '../types';

const categoryLabels: Record<DocumentCategory, string> = {
  about: 'Про підприємство',
  reporting: 'Звітність',
  charter: 'Установчі документи',
  tender: 'Тендерна документація',
  financial: 'Фінансова звітність',
  other: 'Інше',
};

const emptyForm = {
  title: '',
  date: new Date().toISOString().slice(0, 10),
  fileUrl: '',
  fileSize: '',
  category: 'other' as DocumentCategory,
};

export default function Documents() {
  const [documents, setDocuments] = useState<OfficialDocument[]>([]);
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
    setDocuments(await documentsApi.list());
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

  function openEdit(doc: OfficialDocument) {
    setEditingId(doc._id);
    setForm({
      title: doc.title,
      date: doc.date.slice(0, 10),
      fileUrl: doc.fileUrl,
      fileSize: doc.fileSize || '',
      category: doc.category,
    });
    setError('');
    setModalOpen(true);
  }

  async function handleFileUpload(file: File | null) {
    if (!file) return;
    setIsUploading(true);
    try {
      const { url, fileSize } = await uploadApi.document(file);
      setForm((f) => ({ ...f, fileUrl: url, fileSize }));
    } catch {
      setError('Не вдалося завантажити файл. Переконайтесь, що це PDF.');
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.fileUrl) {
      setError('Завантажте PDF-файл документа');
      return;
    }
    setIsSaving(true);
    try {
      if (editingId) {
        await documentsApi.update(editingId, form);
      } else {
        await documentsApi.create(form);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося зберегти документ');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await documentsApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Документи"
        description="Публічна звітність та документи (PDF)"
        action={<Button onClick={openCreate}><Plus size={16} /> Додати документ</Button>}
      />

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <p className="text-center text-navy-400">Завантаження...</p>
        ) : documents.length === 0 ? (
          <p className="text-center text-navy-400">Документів ще немає</p>
        ) : (
          documents.map((doc) => (
            <div key={doc._id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
                  <FileText size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy-900">{doc.title}</p>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-navy-400">
                    <span>{new Date(doc.date).toLocaleDateString('uk-UA')}</span>
                    <span className="rounded bg-navy-50 px-1.5 py-0.5">{categoryLabels[doc.category]}</span>
                    {doc.fileSize && <span>{doc.fileSize}</span>}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => openEdit(doc)} className="rounded-md p-1.5 text-navy-500 hover:bg-navy-50 hover:text-navy-800">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setDeleteId(doc._id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal title={editingId ? 'Редагувати документ' : 'Новий документ'} isOpen={modalOpen} onClose={() => setModalOpen(false)} width="md">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <Input label="Назва документа" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Дата" type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <Select label="Категорія" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as DocumentCategory })}>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">PDF-файл</label>
            {form.fileUrl ? (
              <div className="flex items-center justify-between rounded-lg border border-navy-200 px-3 py-2 text-sm text-navy-700">
                <span className="truncate">{form.fileUrl.split('/').pop()}</span>
                <label className="cursor-pointer text-xs font-semibold text-brand-emerald-700 hover:underline">
                  Замінити
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0] || null)} />
                </label>
              </div>
            ) : (
              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-navy-300 px-3 py-4 text-sm text-navy-400 hover:border-brand-emerald-500 hover:text-brand-emerald-600">
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {isUploading ? 'Завантаження...' : 'Обрати PDF-файл'}
                <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e.target.files?.[0] || null)} />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Скасувати</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Збереження...' : 'Зберегти'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Видалити документ?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isDeleting}
      />
    </div>
  );
}
