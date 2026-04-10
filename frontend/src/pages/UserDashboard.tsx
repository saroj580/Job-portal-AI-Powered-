import { useApplications } from '../hooks/useApplications';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import Alert   from '../components/Alert';
import type { Application } from '../types';

const statusStyles: Record<Application['status'], string> = {
  pending:  'bg-amber-50  text-amber-700  border-amber-200',
  accepted: 'bg-green-50  text-green-700  border-green-200',
  rejected: 'bg-red-50    text-red-700    border-red-200',
};

export default function UserDashboard() {
  const { user } = useAuth();
  const { applications, loading, error } = useApplications();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        My applications
        {user && <span className="text-gray-400 font-normal text-base ml-2">— {user.name}</span>}
      </h1>

      {loading && <Spinner text="Loading applications…" />}
      {error   && <Alert type="error" message={error} />}

      {!loading && !error && applications.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📋</p>
          <p>You haven't applied to any jobs yet.</p>
        </div>
      )}

      <div className="space-y-4">
        {applications.map(app => (
          <div
            key={app.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-semibold text-gray-800">{app.title}</p>
              <p className="text-sm text-gray-500">{app.company}{app.location && ` · ${app.location}`}</p>
              <p className="text-xs text-gray-400 mt-1">
                Applied {new Date(app.applied_at).toLocaleDateString()}
              </p>
            </div>
            <span className={`text-xs font-medium px-3 py-1 rounded-full border capitalize ${statusStyles[app.status]}`}>
              {app.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}