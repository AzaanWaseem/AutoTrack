# AutoTrack

AutoTrack is a fullstack job application tracker powered by FastAPI (Python) and Vite/React (TypeScript). It automatically parses job-related emails, tracks application status, and provides a modern dashboard for managing your job search.

## Features
- Gmail integration for automatic job email parsing
- AI-powered extraction of job details (company, position, stage, etc.)
- Supabase database for persistent tracking
- Modern React dashboard with timeline and filtering
- Secure Google OAuth login

## Tech Stack
- **Backend:** FastAPI, Uvicorn, Supabase, Groq AI, Python-dotenv
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Axios, React Router DOM

## Setup Instructions

### Prerequisites
- Python 3.12
- Node.js >= 18, npm >= 9
- Supabase project (get your URL and API key)
- Groq API key

### Backend Setup
1. Clone the repo and navigate to `backend`:
	```sh
	cd backend
	python3.12 -m venv venv
	source venv/bin/activate
	pip install -r requirements.txt
	```
2. Create a `.env` file in `backend`:
	```env
	SUPABASE_URL=your_supabase_url
	SUPABASE_KEY=your_supabase_key
	GROQ_API_KEY=your_groq_api_key
	```
3. Run the backend server:
	```sh
	uvicorn main:app --reload
	```

### Frontend Setup
1. Navigate to `frontend`:
	```sh
	cd frontend
	npm install
	```
2. Create a `.env` file in `frontend` (see `requirements.md` for details):
	```env
	VITE_API_URL=http://localhost:8000
	VITE_GOOGLE_CLIENT_ID=your_google_client_id
	```
3. Start the frontend:
	```sh
	npm run dev
	```

## Usage
- Log in with Google
- Search for jobs by date range
- View and manage your job application timeline

## Troubleshooting
- If you see model decommission errors, update the Groq model in `src/ai_parser.py` to a supported one (see [Groq docs](https://console.groq.com/docs/deprecations)).
- Ensure all environment variables are set in `.env` files.
- For dependency issues, check `requirements.txt` for compatible versions.

## License
MIT
