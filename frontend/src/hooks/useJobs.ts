import { useState, useEffect, useCallback } from 'react';
import api, { getErrorMessage } from '../api/axios';
import type { Job, ApiResponse } from '../types';

interface Filters {
  search: string;
  location: string;
  skill: string;
}

export function useJobs(filters: Filters) {
  const [jobs, setJobs]       = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const fetch = useCallback(async (overrideFilters: Partial<Filters> = {}) => {
    setLoading(true);
    setError('');
    try {
      const queryFilters = { ...filters, ...overrideFilters };
      const { data } = await api.get<ApiResponse<Job[]>>('/jobs', { params: queryFilters });
      setJobs(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setJobs([]);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filters.search, filters.location, filters.skill]);

  useEffect(() => { void fetch(); }, [fetch]);

  return { jobs, loading, error, refetch: fetch };
}