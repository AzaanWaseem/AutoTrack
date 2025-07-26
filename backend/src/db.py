import os

from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_job(data: dict):
    company = data.get("company")
    position = data.get("position")
    application_date_str = data.get("application_date")
    stage = data.get("stage")
    description = data.get("description")

    if not company or not application_date_str:
        print("Missing company or application date.")
        return

    # Parse date string to datetime
    application_date = datetime.strptime(application_date_str, "%Y-%m-%d")

    # Step 1: Check if job already exists
    existing = supabase.table("job_applications").select("*").eq("company", company).execute()
    
    if existing.data:
        # Job exists
        job = existing.data[0]
        job_id = job["id"]
        first_applied = datetime.strptime(job["first_applied"], "%Y-%m-%d")
        latest_update_at = datetime.fromisoformat(job["latest_update_at"])

        # Compare and update if needed
        new_first_applied = min(first_applied, application_date)
        new_latest_update_at = max(latest_update_at, application_date)

        supabase.table("job_applications").update({
            "first_applied": new_first_applied.date().isoformat(),
            "latest_update_at": new_latest_update_at.isoformat(),
            "current_status": stage
        }).eq("id", job_id).execute()

        print(f"Updated job application for {company}")
    else:
        # Insert new job
        response = supabase.table("job_applications").insert({
            "company": company,
            "position": position,
            "first_applied": application_date.date().isoformat(),
            "latest_update_at": application_date.isoformat(),
            "current_status": stage
        }).execute()

        job_id = response.data[0]["id"]
        print(f"Inserted new job application for {company}")

    # Step 2: Insert job update
    supabase.table("job_updates").insert({
        "job_id": job_id,
        "company": company,
        "stage": stage,
        "description": description,
        "received_at": application_date.isoformat()
    }).execute()

    print(f"Inserted job update for {company} ({stage}) on {application_date_str}")
