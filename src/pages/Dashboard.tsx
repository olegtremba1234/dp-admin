import { useEffect, useState } from 'react';
import { Package, FolderTree, FileText, Newspaper, Gavel, Briefcase, Mail, MessageSquareText, ClipboardList } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import {
  listingsApi,
  categoriesApi,
  documentsApi,
  newsApi,
  tendersApi,
  vacanciesApi,
  contactApi,
  listingRequestsApi,
  vacancyApplicationsApi,
} from '../api/resources';

interface Stat {
  label: string;
  value: number;
  icon: typeof Package;
  color: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stat[] | null>(null);

  useEffect(() => {
    async function load() {
      const [listingsRes, categories, documents, news, tenders, vacancies, contacts, requests, vacancyApplications] =
        await Promise.all([
          listingsApi.listAll(1, 1).catch(() => ({ total: 0 })),
          categoriesApi.list().catch(() => []),
          documentsApi.list().catch(() => []),
          newsApi.list().catch(() => []),
          tendersApi.list().catch(() => []),
          vacanciesApi.list().catch(() => []),
          contactApi.list().catch(() => []),
          listingRequestsApi.list().catch(() => []),
          vacancyApplicationsApi.list().catch(() => []),
        ]);

      setStats([
        { label: 'Оголошення', value: listingsRes.total, icon: Package, color: 'bg-brand-emerald-100 text-brand-emerald-700' },
        { label: 'Категорії', value: categories.length, icon: FolderTree, color: 'bg-navy-100 text-navy-700' },
        { label: 'Документи', value: documents.length, icon: FileText, color: 'bg-amber-100 text-amber-700' },
        { label: 'Новини', value: news.length, icon: Newspaper, color: 'bg-blue-100 text-blue-700' },
        { label: 'Тендери', value: tenders.length, icon: Gavel, color: 'bg-purple-100 text-purple-700' },
        {
          label: 'Відкриті вакансії',
          value: vacancies.filter((v) => v.status === 'open').length,
          icon: Briefcase,
          color: 'bg-indigo-100 text-indigo-700',
        },
        {
          label: 'Нових звернень',
          value: contacts.filter((c) => !c.isResolved).length,
          icon: Mail,
          color: 'bg-red-100 text-red-700',
        },
        {
          label: 'Нових заявок',
          value: requests.filter((r) => !r.isResolved).length,
          icon: MessageSquareText,
          color: 'bg-teal-100 text-teal-700',
        },
        {
          label: 'Нових відгуків на вакансії',
          value: vacancyApplications.filter((a) => !a.isResolved).length,
          icon: ClipboardList,
          color: 'bg-pink-100 text-pink-700',
        },
      ]);
    }
    load();
  }, []);

  return (
    <div>
      <PageHeader title="Огляд" description="Загальна статистика по сайту ДП «Монастириське»" />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(stats || Array.from({ length: 9 })).map((stat: any, idx) => (
          <div key={idx} className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm">
            {stat ? (
              <>
                <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon size={18} />
                </span>
                <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
                <p className="text-xs text-navy-500">{stat.label}</p>
              </>
            ) : (
              <div className="h-16 animate-pulse rounded-lg bg-navy-50" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
