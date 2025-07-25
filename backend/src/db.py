from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def insert_job(data: dict):
    company = data.get("company")
    if not company:
        print("No company name found in data.")
        return

    # Check if this company already exists
    existing = supabase.table("job_applications").select("*").eq("company", company).execute()

    if existing.data:
        # Update existing row
        response = supabase.table("job_applications").update(data).eq("company", company).execute()
        print(f"Updated job entry for: {company}")
    else:
        # Insert new row
        response = supabase.table("job_applications").insert(data).execute()
        print(f"Inserted new job entry for: {company}")
