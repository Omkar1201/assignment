const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Fallback Mock Data in case backend server is unreachable
const MOCK_AGENTS_FALLBACK = {
  count: 6,
  results: [
    {
      id: "78b52fa2-ff7d-4e56-9d86-47af9b1006b4",
      name: "Workforce AI — Hiring Screener",
      voice_persona: "NEHA",
      persona_name: "Neha",
      language: "ENGLISH",
      status: "ACTIVE",
      summary: "The AI recruiter, Neha, conducts efficient initial phone screenings for job candidates, assessing interest and qualifications.",
      custom_variables: ["role_title", "company"],
      result_schema: {
        interest_level: "string",
        qualification_summary: "string",
        notice_period: "string",
        compensation_expectation: "string"
      },
      result_variables: ["interest_level", "qualification_summary", "notice_period", "compensation_expectation"],
      required_variables: ["callee_name", "mobile_number"]
    },
    {
      id: "8da3f952-8f61-4427-bbc4-7e9189c3533e",
      name: "Workforce AI — Talent Reachout",
      voice_persona: "ROY",
      persona_name: "Roy",
      language: "ENGLISH",
      status: "ACTIVE",
      summary: "Roy is an AI recruiter facilitating outreach to passive candidates in tech, assessing their interest in job opportunities.",
      custom_variables: ["role_title", "company"],
      result_schema: {
        open_to_opportunity: "string",
        current_status: "string",
        notice_period: "string"
      },
      result_variables: ["open_to_opportunity", "current_status", "notice_period"],
      required_variables: ["callee_name", "mobile_number"]
    },
    {
      id: "f1705017-3fcf-4699-9b32-9b776a4a0c9d",
      name: "Workforce AI — Tech Screener (Zoe)",
      voice_persona: "ZOE",
      persona_name: "Zoe",
      language: "ENGLISH",
      status: "ACTIVE",
      summary: "Zoe is an AI sourcing recruiter conducting warm/cold outreach to gauge passive candidates' suitability.",
      custom_variables: ["role_title", "company"],
      result_schema: {
        interested: "boolean",
        years_experience: "integer",
        notice_period: "string"
      },
      result_variables: ["interested", "years_experience", "notice_period"],
      required_variables: ["callee_name", "mobile_number"]
    }
  ]
};

const MOCK_CALLS_FALLBACK = {
  count: 0,
  results: []
};

const MOCK_ATTENDANCE_ARCH_FALLBACK = {
  title: "Voice-First Voice AI & PSTN Telephony Attendance Engine for 1,000 Staff across 100 Locations",
  problem: "Track daily attendance of 1,000 employees spread across 100 remote locations with ZERO smartphone dependency and NO mobile apps.",
  core_pillars: [
    {
      name: "1. Inbound Voice AI Toll-Free IVR Check-In",
      description: "Each worker calls a dedicated local toll-free number (e.g. 1800-ATTEND-AI) from any basic feature phone (Nokia/JioPhone) or location landline. The Hunar LLM Voice Agent greets them in their regional language, verifies identity via voice passphrase + voice acoustic signature, and logs shift start."
    },
    {
      name: "2. Outbound Automated Location Group Check-In",
      description: "At shift start time (e.g., 9:00 AM), the Hunar Voice AI Agent automatically calls the landline / feature phone of the site supervisor at all 100 locations. The supervisor confirms total workers present via spoken voice response or DTMF keypads, which the LLM parses into structured attendance records."
    },
    {
      name: "3. PSTN Caller ID & Cell-Tower Location Geofencing",
      description: "Every call captures PSTN telecom exchange metadata or Cell Tower LAC/CID to verify caller physical location, preventing remote clock-in fraud without GPS."
    },
    {
      name: "4. Low-Cost POTS / GSM Hardware Voice Station",
      description: "At remote sites without phones, install a $15 rugged 2G/4G voice hardware unit with single-button press to connect directly to the LLM attendance agent."
    }
  ]
};

const MOCK_LOCATIONS_FALLBACK = Array.from({ length: 24 }, (_, i) => ({
  id: `LOC-${(i + 1).toString().padStart(3, '0')}`,
  name: `Site #${i + 1} - ${['Bengaluru', 'Mumbai', 'Delhi', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'][i % 7]}`,
  region: ['South', 'West', 'North', 'East', 'Central'][i % 5],
  total_workers: 10,
  present_workers: 8 + (i % 3),
  absent_workers: 2 - (i % 3),
  status: (i % 3 === 0 ? "COMPLETED" : "PARTIAL") as "COMPLETED" | "PARTIAL" | "PENDING",
  last_call_time: `08:${45 + (i % 15)} AM`
}));

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
  } catch (err: any) {
    console.warn(`[fetchApi] Network fetch failed for ${endpoint}. Error:`, err.message);

    if (endpoint.includes("/api/health") || endpoint === "/") {
      return { status: "online", service: "Fallback Mode" } as unknown as T;
    }
    if (endpoint.includes("/api/agents")) {
      return MOCK_AGENTS_FALLBACK as unknown as T;
    }
    if (endpoint.includes("/api/calls") && !endpoint.includes("bulk")) {
      return MOCK_CALLS_FALLBACK as unknown as T;
    }
    if (endpoint.includes("/api/search/candidates")) {
      return { count: 0, candidates: [] } as unknown as T;
    }
    if (endpoint.includes("/api/search/parse-jd")) {
      return { suggested_role: "Software Engineer", required_experience: 5, extracted_skills: ["React", "Python", "FastAPI"] } as unknown as T;
    }
    if (endpoint.includes("/api/attendance/architecture")) {
      return MOCK_ATTENDANCE_ARCH_FALLBACK as unknown as T;
    }
    if (endpoint.includes("/api/attendance/locations")) {
      return MOCK_LOCATIONS_FALLBACK as unknown as T;
    }
    if (endpoint.includes("/api/attendance/logs")) {
      return [] as unknown as T;
    }
    if (endpoint.includes("/api/attendance/simulate-checkin")) {
      return {
        timestamp: "09:00:00 AM",
        emp_id: "EMP-9021",
        worker_name: "Ramesh Kumar",
        location_id: "LOC-001",
        location_name: "Site #1 - Bengaluru North",
        speech_transcript: "Present sir",
        verified_by_llm: true,
        status: "PRESENT",
        telecom_node: "PSTN-BGLR-EXCHANGE-4",
        confirmation_sms: "Confirmed! Attendance marked for Ramesh Kumar (EMP-9021) at Site #1."
      } as unknown as T;
    }
    if (endpoint.includes("/api/calls/bulk") || endpoint === "/api/calls") {
      return { id: `call-${Date.now()}`, status: "IN_PROGRESS" } as unknown as T;
    }

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
  result_schema: Record<string, any>;
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
  custom_data?: Record<string, any>;
  result?: Record<string, any>;
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
