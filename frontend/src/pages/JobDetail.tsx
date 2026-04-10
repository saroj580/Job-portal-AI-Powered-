import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useJob } from '../hooks/useJob';
import { useAuth } from '../context/AuthContext';
import api, { getErrorMessage } from '../api/axios';
import Badge   from '../components/Badge';
import Spinner from '../components/Spinner';
import Alert   from '../components/Alert';

export default function JobDetail() {
  const { id }       = useParams<{ id: string }>();
  const { job, loading, error } = useJob(id);
  const { user }     = useAuth();
  const navigate     = useNavigate();

  const [applying, setApplying] = useState(false);
  const [applyMsg, setApplyMsg] = useState('');
  const [applyErr, setApplyErr] = useState('');

  const handleApply = async (): Promise<void> => {
    if (!user) { navigate('/login'); return; }
    setApplying(true); setApplyMsg(''); setApplyErr('');
    try {
      await api.post('/apply', { job_id: Number(id) });
      setApplyMsg('Application submitted successfully!');
    } catch (err) {
      setApplyErr(getErrorMessage(err));
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Spinner text="Loading job…" />;
  if (error || !job) return <Alert type="error" message={error || 'Job not found'} />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
            <p className="text-gray-500 mt-1">
              {job.company}
              {job.location && ` · ${job.location}`}
            </p>
          </div>
          {job.salary && (
            <span className="text-emerald-600 font-semibold text-lg">{job.salary}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5 mt-4">
          {job.skills_required.split(',').map((s, i) => (
            <Badge key={i} label={s.trim()} />
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-3">Job description</h2>
        <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
          {job.description}
        </p>
      </div>

      {/* Apply */}
      {user?.role === 'user' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-3">
          {applyMsg && <Alert type="success" message={applyMsg} />}
          {applyErr && <Alert type="error"   message={applyErr} />}
          <button
            onClick={handleApply}
            disabled={applying || !!applyMsg}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition"
          >
            {applying ? 'Submitting…' : applyMsg ? 'Applied ✓' : 'Apply now'}
          </button>
          <p className="text-xs text-gray-400 text-center">
            Your saved resume will be attached automatically.
          </p>
        </div>
      )}

      {!user && (
        <p className="text-center text-sm text-gray-500">
          <button onClick={() => navigate('/login')} className="text-indigo-600 hover:underline">
            Sign in
          </button>{' '}
          to apply for this job.
        </p>
      )}
    </div>
  );
}