import { useState, FormEvent } from 'react';
import api, { getErrorMessage } from '../api/axios';
import { useApplications } from '../hooks/useApplications';
import { useJobs } from '../hooks/useJobs';
import Alert   from '../components/Alert';
import Spinner from '../components/Spinner';
import Badge   from '../components/Badge';
import type { JobFormData, Application } from '../types';

const EMPTY_FORM: JobFormData = {
  title: '', company: '', description: '',
  skills_required: '', salary: '', location: '',
};

const statusStyles: Record<Application['status'], string> = {
  pending:  'bg-amber-50  text-amber-700',
  accepted: 'bg-green-50  text-green-700',
  rejected: 'bg-red-50    text-red-700',
};

export default function RecruiterDashboard() {
  const [form, setForm]           = useState<JobFormData>(EMPTY_FORM);
  const [posting, setPosting]     = useState(false);
  const [postError, setPostError] = useState('');
  const [postOk, setPostOk]       = useState('');

  const [selectedJobId, setSelectedJobId] = useState<number | undefined>();

  const { jobs, loading: jobsLoading, error: jobsError, refetch: refetchJobs }
    = useJobs({ search: '', location: '', skill: '' });

  const { applications, loading: appsLoading, refetch: refetchApps }
    = useApplications(selectedJobId);

  const handlePost = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setPosting(true); setPostError(''); setPostOk('');
    try {
      await api.post('/jobs', form);
      setPostOk('Job posted successfully!');
      setForm(EMPTY_FORM);
      void refetchJobs();
    } catch (err) {
      setPostError(getErrorMessage(err));
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (jobId: number): Promise<void> => {
    if (!confirm('Delete this job permanently?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      void refetchJobs();
      if (selectedJobId === jobId) setSelectedJobId(undefined);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const handleStatusChange = async (appId: number, status: Application['status']): Promise<void> => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      void refetchApps(selectedJobId);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const fields: Array<{ key: keyof JobFormData; label: string; required?: boolean }> = [
    { key: 'title',           label: 'Job title',                   required: true },
    { key: 'company',         label: 'Company name',                required: true },
    { key: 'skills_required', label: 'Skills (comma-separated)',    required: true },
    { key: 'salary',          label: 'Salary (e.g. $80k–$100k)' },
    { key: 'location',        label: 'Location' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">Recruiter dashboard</h1>

      {/* Post job form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Post a new job</h2>

        {postError && <div className="mb-3"><Alert type="error"   message={postError} /></div>}
        {postOk   && <div className="mb-3"><Alert type="success" message={postOk}    /></div>}

        <form onSubmit={handlePost} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map(({ key, label, required }) => (
              <input
                key={key}
                required={required}
                placeholder={label}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
              />
            ))}
          </div>
          <textarea
            required
            rows={4}
            placeholder="Job description"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={form.description}
            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          />
          <button
            type="submit" disabled={posting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm font-medium transition"
          >
            {posting ? 'Posting…' : 'Post job'}
          </button>
        </form>
      </div>

      {/* Job list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-4">Your posted jobs</h2>

        {jobsLoading && <Spinner text="Loading jobs…" />}
        {jobsError   && <Alert type="error" message={jobsError} />}

        {!jobsLoading && jobs.length === 0 && (
          <p className="text-gray-400 text-sm">No jobs posted yet.</p>
        )}

        <div className="divide-y divide-gray-100">
          {jobs.map(job => (
            <div key={job.id} className="py-3 flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800">{job.title}</p>
                <p className="text-xs text-gray-400">{job.company}{job.location && ` · ${job.location}`}</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {job.skills_required.split(',').slice(0, 3).map((s, i) => (
                    <Badge key={i} label={s.trim()} />
                  ))}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => setSelectedJobId(job.id)}
                  className={`text-xs px-3 py-1 rounded-full transition ${
                    selectedJobId === job.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  Applicants
                </button>
                <button
                  onClick={() => handleDelete(job.id)}
                  className="text-xs px-3 py-1 rounded-full bg-red-50 text-red-500 hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Applicants panel */}
      {selectedJobId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-700 mb-4">
            Applicants for job #{selectedJobId}
          </h2>

          {appsLoading && <Spinner text="Loading applicants…" />}

          {!appsLoading && applications.length === 0 && (
            <p className="text-gray-400 text-sm">No applicants yet.</p>
          )}

          <div className="divide-y divide-gray-100">
            {applications.map(app => (
              <div key={app.id} className="py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium text-gray-800">{app.applicant_name}</p>
                  <p className="text-xs text-gray-400">{app.applicant_email}</p>
                  <a
                    href={`${import.meta.env.VITE_API_URL?.replace('/api', '')}/${app.resume_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-500 hover:underline"
                  >
                    View resume →
                  </a>
                </div>
                <div className="flex gap-2">
                  {(['pending', 'accepted', 'rejected'] as Application['status'][]).map(s => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(app.id, s)}
                      className={`text-xs px-3 py-1 rounded-full capitalize transition ${
                        app.status === s
                          ? `${statusStyles[s]} font-semibold`
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}