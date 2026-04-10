import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../api/axios';
import type { Application, ApiResponse } from '../types';

export function useApplications(jobId?: number) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  const fetch = async (jid?: number) => {
    setLoading(true);
    try {
      const params = jid ? { job_id: jid } : {};
      const { data } = await api.get<ApiResponse<Application[]>>('/applications', { params });
      setApplications(data.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void fetch(jobId); }, [jobId]);

  return { applications, loading, error, refetch: fetch };
}