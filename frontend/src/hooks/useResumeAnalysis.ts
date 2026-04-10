import { useState, useEffect } from 'react';
import api, { getErrorMessage } from '../api/axios';
import type { ResumeAnalysis, ApiResponse } from '../types';

export function useResumeAnalysis() {
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get<ApiResponse<ResumeAnalysis>>('/my-analysis')
      .then(r => setAnalysis(r.data.data))
      .catch(err => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  return { analysis, loading, error };
}