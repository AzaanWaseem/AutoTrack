import os
import datetime

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
        
        # Parse existing dates
        first_applied = datetime.strptime(job["first_applied"], "%Y-%m-%d")
        latest_update_at = datetime.fromisoformat(job["latest_update_at"])

        # Step 2: Check for duplicate updates within a time window
        time_window = datetime.timedelta(hours=24)  # Configurable time window
        existing_updates = supabase.table("job_updates") \
            .select("*") \
            .eq("job_id", job_id) \
            .eq("stage", stage) \
            .execute()

        # Check for similar updates within time window
        for update in existing_updates.data:
            update_date = datetime.fromisoformat(update["received_at"])
            if abs(update_date - application_date) <= time_window:
                if update["description"] == description:
                    print(f"Similar update exists for {company} within {time_window}")
                    return

        # Compare and update application dates
        if application_date < first_applied:
            # Found an earlier application date
            print(f"Found an earlier application date for {company}")
            new_first_applied = application_date
        else:
            new_first_applied = first_applied

        # Update latest interaction date if newer
        if application_date > latest_update_at:
            print(f"Updating latest interaction date for {company}")
            new_latest_update_at = application_date
        else:
            new_latest_update_at = latest_update_at

        # Update job application
        supabase.table("job_applications").update({
            "first_applied": new_first_applied.date().isoformat(),
            "latest_update_at": new_latest_update_at.isoformat(),
            "current_status": stage,
            "position": position or job["position"]  # Keep existing position if new one is None
        }).eq("id", job_id).execute()

        print(f"Updated job application for {company}")
    else:
        # Insert new job
        response = supabase.table("job_applications").insert({
            "company": company,
            "position": position,
            "first_applied": application_date.date().isoformat(),
            "latest_update_at": application_date.isoformat(),
            "current_status": stage,
            "email_id": data.get("msg_id")  # Add this line
        }).execute()

        job_id = response.data[0]["id"]
        print(f"Inserted new job application for {company}")

    # Step 3: Insert job update if it doesn't exist
    supabase.table("job_updates").insert({
        "job_id": job_id,
        "company": company,
        "stage": stage,
        "description": description,
        "received_at": application_date.isoformat()
    }).execute()

    print(f"Inserted job update for {company} ({stage}) on {application_date_str}")
