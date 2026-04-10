import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import type { ApiError } from '../types'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api',
})

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function getErrorMessage(err: unknown): string {
  const axiosErr = err as AxiosError<ApiError>
  return axiosErr.response?.data?.error ?? 'Something went wrong'
}

export default api