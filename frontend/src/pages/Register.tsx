import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getErrorMessage } from '../api/axios';
import Alert from '../components/Alert';
import type { User } from '../types';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  role: User['role'];
}

export default function Register() {
  const [form, setForm]     = useState<RegisterForm>({
    name: '', email: '', password: '', role: 'user',
  });
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate            = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await api.post('/register', form);
      setSuccess('Registered! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Create account</h1>

        {error   && <div className="mb-4"><Alert type="error"   message={error} /></div>}
        {success && <div className="mb-4"><Alert type="success" message={success} /></div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {(['name', 'email', 'password'] as const).map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                {field}
              </label>
              <input
                type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                required minLength={field === 'password' ? 6 : 1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">I am a…</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={form.role}
              onChange={e => setForm(f => ({ ...f, role: e.target.value as User['role'] }))}
            >
              <option value="user">Job seeker</option>
              <option value="recruiter">Recruiter</option>
            </select>
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition"
          >
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}