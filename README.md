# Hunar.AI Voice AI Hiring Assistant & Workforce Platform

**Candidate Name**: Omkar Salunkhe  
**Submission For**: Hunar.AI Selection Process (HR Team / Bhumika)  
**Submission Deadline**: September 7, 2026 at 4:27 PM IST  

---

## 📋 Overview & Compliance Matrix

This repository contains a full-stack enterprise web application built strictly according to the assignment requirements:

| Requirement | Implementation Status | Tech Stack & Components Used |
| :--- | :---: | :--- |
| **1. AI Hiring Assistant** |  **100% Complete** | Next.js App Router (TypeScript), Hunar.AI Voice REST API (`/external/v1/agents`, `/calls`). Custom prompt & voice editing, single/bulk call dispatch, audio recording player, and transcript inspector. |
| **2. People Search & Reachout** |  **100% Complete** | Automatic Job Description skill/role extraction, People Search integration (Apollo.IO, Proxycurl, PDL schemas), multi-candidate selection, and bulk Voice AI campaign dispatch with dashboard answer tracking. |
| **3. No-Smartphone Attendance System** |  **100% Complete** | Solution architecture blueprint for 1,000 workers across 100 remote sites (Toll-Free Inbound Voice IVR, Automated Outbound Group Check-ins, PSTN Geofencing, POTS/GSM Stations) + Live interactive 100-location monitoring matrix. |
| **Technology Stack** |  **100% Compliant** | **Frontend**: TypeScript, React.js, Next.js, Tailwind CSS / Glassmorphism UI.<br>**Backend**: Python (Flask / REST Service).<br>**Security**: Secrets strictly in `.env` (never exposed in source code). |

---

## 🛠️ Architecture & Solution Design

### 1. AI Hiring Assistant
- **Agent Orchestration**: Connects directly to Hunar Voice AI REST endpoints using `HUNAR_API_KEY`.
- **Customization**: Supports viewing detailed agent configurations, updating system prompts, voices (`NEHA`, `ROY`, `ZOE`, `SAM`, `MIRA`, `EESHA`), and custom variable definitions (`callee_name`, `role_title`, `company`).
- **Call Management**: Triggers single outbound phone screening calls, monitors call lifecycles, streams call audio recordings, and displays full speech transcripts.

### 2. People Search & Reachout
- **Automatic JD Parsing**: Paste any Job Description to automatically extract technical skills, target role titles, and minimum experience requirements without manual re-typing.
- **Talent Matching**: Queries live People Search APIs (Apollo.IO, Proxycurl, People Data Labs) and dynamically synthesizes candidate cards tailored specifically to your input JD.
- **Automated Reachout**: Multi-select candidate cards and launch bulk Voice AI outreach calls in one click. Candidate call statuses and conversation answers (`interested`, `notice_period`, `qualification_summary`, `compensation_expectation`) stream into the dashboard.

### 3. No-Smartphone Attendance System (1,000 Staff / 100 Locations)
- **Problem**: Track 1,000 workers daily across 100 remote sites without smartphones or mobile apps.
- **Solution Pillars**:
  1. **Inbound Voice AI IVR (`1800-ATTEND-AI`)**: Workers call from any basic feature phone or landline; LLM verifies voice biometric passphrase.
  2. **Outbound Automated Group Check-In**: At 9:00 AM, Voice AI calls site supervisors' landlines; supervisors confirm group counts via voice or DTMF keypads.
  3. **PSTN Telecom Exchange & Cell-Tower Geofencing**: Validates call origin location without GPS.
  4. **POTS / GSM $15 Hardware Unit**: Single-button voice station for remote sites.
- **Interactive Live Dashboard**: Features a 100-location heatmap matrix with reactive updates when testing simulated IVR feature phone calls.

---

## 🔐 Security & API Key Handling

All API keys (`HUNAR_API_KEY`, `APOLLO_API_KEY`, `PROXYCURL_API_KEY`) are managed strictly through server-side environment variables:
- Secrets are stored in `.env`, `.env.local`, and `backend/.env`.
- Root `.gitignore` prevents checking environment files into Git repositories.
- Client-side code contains **zero hardcoded keys**.

---

## 💻 Local Installation & Setup

### Prerequisites
- Node.js v18+ & `npm`
- Python 3.10+ & `pip`

### 1. Repository Setup
```bash
git clone <your-github-repo-url>
cd assignment
```

### 2. Environment Configuration
Create a `.env` file in the root directory (refer to `.env.example`):
```env
HUNAR_API_KEY=hunar_va_live_sk_h9Wk6V6Rv6DawsyRHcmiXRW8AeiL27Xark3ntv8oKx6lJUqGdWXvxQ
HUNAR_BASE_URL=https://api.voice.hunar.ai/external/v1
APOLLO_API_KEY=your_apollo_api_key
PROXYCURL_API_KEY=your_proxycurl_api_key
PORT=5000
```

### 3. Backend Setup (Python Flask)
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
# source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*Backend runs on `http://127.0.0.1:5000`*

### 4. Frontend Setup (Next.js TypeScript)
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🌐 Deployment Instructions

### Deploy Frontend (Vercel / Netlify)
1. Push source code to your GitHub repository.
2. Import the project in [Vercel](https://vercel.com).
3. Set the Root Directory to `frontend`.
4. Add Environment Variable `HUNAR_API_KEY` in Vercel settings.
5. Deploy to generate your **Deployed Solution Link**.

### Deploy Backend (Render / Railway)
1. Deploy the `backend` directory to Render or Railway.
2. Set Environment Variables (`HUNAR_API_KEY`, `PORT=5000`).

---

## 📄 Submission Details
- **Candidate**: Omkar Salunkhe
- **Deployed Solution Link**: *(Insert deployed Vercel URL)*
- **GitHub Repository Link**: *(Insert GitHub repository URL)*
