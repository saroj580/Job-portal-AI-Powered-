import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../api/axios';
import type { Job, ApiResponse } from '../types';

export function useJob(id: string | undefined) {
  const [job, setJob]         = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!id) return;
    api.get<ApiResponse<Job>>(`/jobs/${id}`)
      .then(r => setJob(r.data.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  return { job, loading, error };
}