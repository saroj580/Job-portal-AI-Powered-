import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useJobs } from '../hooks/useJobs';
import Badge   from '../components/Badge';
import Spinner from '../components/Spinner';
import Alert   from '../components/Alert';

export default function Jobs() {
  const [search,   setSearch]   = useState('');
  const [location, setLocation] = useState('');
  const [skill,    setSkill]    = useState('');
  const [submitted, setSubmitted] = useState({ search: '', location: '', skill: '' });

  const { jobs, loading, error } = useJobs(submitted);
  const safeJobs = Array.isArray(jobs) ? jobs : [];

  const handleSearch = (): void => {
    setSubmitted({ search, location, skill });
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Job listings</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          style={{ minWidth: '180px' }}
          placeholder="Search title or keyword…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <input
          className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Location"
          value={location}
          onChange={e => setLocation(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <input
          className="w-36 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Skill"
          value={skill}
          onChange={e => setSkill(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-indigo-700 transition"
        >
          Search
        </button>
      </div>

      {loading && <Spinner text="Fetching jobs…" />}
      {error   && <Alert type="error" message={error} />}

      {!loading && !error && safeJobs.length === 0 && (
        <p className="text-center text-gray-400 py-12">No jobs found.</p>
      )}

      <div className="space-y-4">
        {safeJobs.map(job => (
          <Link key={job.id} to={`/jobs/${job.id}`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold text-gray-800">{job.title}</h2>
                  <p className="text-gray-500 text-sm mt-0.5">
                    {job.company}
                    {job.location && ` · ${job.location}`}
                  </p>
                </div>
                {job.salary && (
                  <span className="text-emerald-600 text-sm font-medium whitespace-nowrap">
                    {job.salary}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(job.skills_required ?? '').split(',').filter(Boolean).map((s, i) => (
                  <Badge key={i} label={s.trim()} />
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}