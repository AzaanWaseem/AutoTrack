from fastapi import APIRouter, HTTPException
from .db import supabase

router = APIRouter()

@router.get("/jobs")
def get_jobs():
    response = supabase.table("job_applications").select("*").order("first_applied", desc=True).execute()
    return response.data

@router.get("/job-updates/{job_id}")
def get_job_updates(job_id: str):
    response = supabase.table("job_updates") \
        .select("*") \
        .eq("job_id", job_id) \
        .order("received_at", desc=True) \
        .execute()
    return response.data
