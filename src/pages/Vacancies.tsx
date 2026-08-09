import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, MapPin, Briefcase } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { Input, Textarea, Select } from '../components/ui/Fields';
import { vacanciesApi } from '../api/resources';
import type { Vacancy, EmploymentType, VacancyStatus } from '../types';

const employmentLabels: Record<EmploymentType, string> = {
  'full-time': 'Повна зайнятість',
  'part-time': 'Часткова зайнятість',
  contract: 'Договірна / проєктна',
};

const emptyForm = {
  title: '',
  department: '',
  employmentType: 'full-time' as EmploymentType,
  salary: '',
  location: '',
  description: '',
  requirements: '',
  benefits: '',
  status: 'open' as VacancyStatus,
  isFeatured: false,
  deadline: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
};

export default function Vacancies() {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
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
    setVacancies(await vacanciesApi.list());
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

  function openEdit(v: Vacancy) {
    setEditingId(v._id);
    setForm({
      title: v.title,
      department: v.department || '',
      employmentType: v.employmentType,
      salary: v.salary || '',
      location: v.location || '',
      description: v.description,
      requirements: v.requirements || '',
      benefits: v.benefits || '',
      status: v.status,
      isFeatured: v.isFeatured,
      deadline: v.deadline ? v.deadline.slice(0, 10) : '',
      contactName: v.contactName,
      contactPhone: v.contactPhone,
      contactEmail: v.contactEmail || '',
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
        await vacanciesApi.update(editingId, payload);
      } else {
        await vacanciesApi.create(payload);
      }
      setModalOpen(false);
      await load();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося зберегти вакансію');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await vacanciesApi.remove(deleteId);
      setDeleteId(null);
      await load();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Вакансії"
        description="Відкриті позиції ДП «Монастириське»"
        action={
          <Button onClick={openCreate}>
            <Plus size={16} /> Додати вакансію
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-3">
        {isLoading ? (
          <p className="text-center text-navy-400">Завантаження...</p>
        ) : vacancies.length === 0 ? (
          <p className="text-center text-navy-400">Вакансій ще немає</p>
        ) : (
          vacancies.map((v) => (
            <div key={v._id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-700">
                  <Briefcase size={20} />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-navy-900">{v.title}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        v.status === 'open' ? 'bg-brand-emerald-50 text-brand-emerald-700' : 'bg-navy-100 text-navy-500'
                      }`}
                    >
                      {v.status === 'open' ? 'Відкрита' : 'Закрита'}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-navy-400">
                    <span>{employmentLabels[v.employmentType]}</span>
                    {v.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {v.location}
                      </span>
                    )}
                    {v.salary && <span>{v.salary}</span>}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button onClick={() => openEdit(v)} className="rounded-md p-1.5 text-navy-500 hover:bg-navy-50 hover:text-navy-800">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setDeleteId(v._id)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal title={editingId ? 'Редагувати вакансію' : 'Нова вакансія'} isOpen={modalOpen} onClose={() => setModalOpen(false)} width="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

          <Input label="Назва посади" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Підрозділ (необов'язково)"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              placeholder="Відділ рослинництва"
            />
            <Select
              label="Тип зайнятості"
              value={form.employmentType}
              onChange={(e) => setForm({ ...form, employmentType: e.target.value as EmploymentType })}
            >
              {Object.entries(employmentLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Зарплата (необов'язково)" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} placeholder="15000–20000 грн" />
            <Input label="Локація" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="м. Монастириська" />
            <Select label="Статус" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as VacancyStatus })}>
              <option value="open">Відкрита</option>
              <option value="closed">Закрита</option>
            </Select>
          </div>

          <Textarea label="Опис обов'язків" required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Textarea
            label="Вимоги"
            rows={4}
            value={form.requirements}
            onChange={(e) => setForm({ ...form, requirements: e.target.value })}
            hint="Кожен рядок — окремий пункт списку на сайті"
          />
          <Textarea
            label="Ми пропонуємо (необов'язково)"
            rows={3}
            value={form.benefits}
            onChange={(e) => setForm({ ...form, benefits: e.target.value })}
            hint="Кожен рядок — окремий пункт списку на сайті"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Прийом заявок до (необов'язково)" type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-navy-600">Показувати на головній</label>
              <label className="flex h-[38px] items-center gap-2 text-sm text-navy-700">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-navy-300 text-brand-emerald-600"
                />
                Так, у блоці "Вакансії"
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="Контактна особа" required value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} />
            <Input label="Телефон" required value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="+380 97 123 45 67" />
            <Input label="Email (необов'язково)" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          </div>

          <div className="flex justify-end gap-2 border-t border-navy-100 pt-4">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Скасувати</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? 'Збереження...' : 'Зберегти'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} title="Видалити вакансію?" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} isLoading={isDeleting} />
    </div>
  );
}
