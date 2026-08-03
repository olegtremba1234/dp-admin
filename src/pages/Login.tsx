import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { Wheat, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function Login() {
  const { admin, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (admin) return <Navigate to="/" replace />;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Не вдалося увійти. Перевірте дані.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-950 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-xl">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-emerald-600 text-white">
            <Wheat size={24} />
          </span>
          <h1 className="text-lg font-bold text-navy-900">ДП «Монастириське»</h1>
          <p className="text-xs text-navy-500">Вхід до адмін-панелі</p>
        </div>

        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2.5 text-xs text-red-700">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@dp-monastyryske.gov.ua"
              className="w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm outline-none focus:border-brand-emerald-500 focus:ring-1 focus:ring-brand-emerald-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-navy-600">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-navy-200 px-3 py-2.5 text-sm outline-none focus:border-brand-emerald-500 focus:ring-1 focus:ring-brand-emerald-500"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            <LogIn size={16} /> {isLoading ? 'Вхід...' : 'Увійти'}
          </Button>
        </form>
      </div>
    </div>
  );
}
