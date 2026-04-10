export interface User {
  id: number;
  name: string;
  role: 'user' | 'recruiter';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Job {
  id: number;
  title: string;
  company: string;
  description: string;
  skills_required: string;   // comma-separated string from DB
  salary: string | null;
  location: string | null;
  posted_by: number;
  recruiter_name: string;
  created_at: string;
}

export interface JobFormData {
  title: string;
  company: string;
  description: string;
  skills_required: string;
  salary: string;
  location: string;
}

export interface Application {
  id: number;
  user_id: number;
  job_id: number;
  resume_path: string;
  status: 'pending' | 'accepted' | 'rejected';
  applied_at: string;
  // joined fields
  title?: string;
  company?: string;
  location?: string;
  applicant_name?: string;
  applicant_email?: string;
  job_title?: string;
}

export interface ResumeAnalysis {
  id: number;
  user_id: number;
  score: number;
  missing_skills: string[];
  suggestions: string[];
  created_at: string;
}

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface ApiError {
  error: string;
}