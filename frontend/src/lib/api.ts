const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!response.ok) {
      let errorDetail = "API Request failed";
      try {
        const rawText = await response.text();
        try {
          const errJson = JSON.parse(rawText);
          errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
        } catch {
          errorDetail = rawText;
        }
      } catch {
        errorDetail = `HTTP Error ${response.status}`;
      }
      throw new Error(errorDetail);
    }

    return await response.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[fetchApi] Backend request failed for ${endpoint}. Error:`, message);
    throw err;
  }
}

// Agent interfaces
export interface HunarAgent {
  id: string;
  name: string;
  voice_persona: string;
  persona_name: string;
  language: string;
  summary?: string;
  status: string;
  logo?: string;
  agent_code?: string;
  custom_variables: string[];
  result_schema: Record<string, unknown>;
  result_variables: string[];
  required_variables: string[];
  agent_prompt?: string;
  introduction?: string;
  objective?: string;
  created_at?: string;
}

// Call interfaces
export interface HunarCall {
  id: string;
  callee_name: string;
  mobile_number: string;
  status: string;
  lifecycle_status?: string;
  agent_id: string;
  language?: string;
  duration_minutes?: number;
  duration_seconds?: number;
  recording_url?: string;
  custom_data?: Record<string, unknown>;
  result?: Record<string, unknown>;
  created_at?: string;
  started_at?: string;
  ended_at?: string;
}

// Candidate search interfaces
export interface Candidate {
  id: string;
  full_name: string;
  title: string;
  company: string;
  location: string;
  email: string;
  mobile_number: string;
  skills: string[];
  experience_years: number;
  avatar_url: string;
  linkedin: string;
  summary: string;
  match_score?: number;
  provider?: string;
}

// Attendance interfaces
export interface AttendanceLocation {
  id: string;
  name: string;
  region: string;
  total_workers: number;
  present_workers: number;
  absent_workers: number;
  status: "COMPLETED" | "PARTIAL" | "PENDING";
  last_call_time: string;
}

export interface AttendanceLog {
  timestamp: string;
  emp_id: string;
  worker_name: string;
  location_id: string;
  location_name: string;
  speech_transcript: string;
  verified_by_llm: boolean;
  status: string;
  telecom_node: string;
  confirmation_sms: string;
}
