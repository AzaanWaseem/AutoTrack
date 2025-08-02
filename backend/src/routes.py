from fastapi import APIRouter, HTTPException, Request, status
from fastapi.responses import JSONResponse
from typing import Optional

from .db import supabase, insert_job
from .gmail_client import (
    get_service, 
    get_emails, 
    is_possibly_job_related, 
    mark_email_as_processed,  
    is_email_processed 
)
from .ai_parser import ai_parse_email

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

@router.post("/extract-emails")
async def extract_emails(request: Request):
    try:
        data = await request.json()
        start_date = data.get("startDate")
        end_date = data.get("endDate")
        token = request.headers.get("Authorization", "").replace("Bearer ", "")
        
        if not all([start_date, end_date, token]):
            raise HTTPException(status_code=400, detail="Missing required fields")

        service = get_service(token)
        processed_count = 0
        job_related_count = 0
        
        # Check for disconnection before starting
        if await request.is_disconnected():
            return JSONResponse(
                status_code=status.HTTP_200_OK,
                content={
                    "success": True,
                    "stopped": True,
                    "processed": processed_count,
                    "job_related": job_related_count
                }
            )
            
        # Process emails as they come in
        async for email in get_emails(service, start_date, end_date, request):
            try:
                # Check for disconnection after each email
                if await request.is_disconnected():
                    print("\nSearch stopped by user - stopping email processing")
                    await request.close()  # Force close the request
                    return JSONResponse(
                        status_code=status.HTTP_200_OK,
                        content={
                            "success": True,
                            "stopped": True,
                            "processed": processed_count,
                            "job_related": job_related_count
                        }
                    )

                # Step 4: AI Parse
                ai_data = ai_parse_email(email["body"], email["date"])
                processed_count += 1
                
                # Step 5: Add to database if job related
                if ai_data.get("job_related"):
                    if all(key in ai_data for key in ["company", "stage"]):
                        ai_data["msg_id"] = email["msg_id"]
                        insert_job(ai_data)
                        job_related_count += 1
                        print(f"Added job application for {ai_data['company']}")
                
            except Exception as e:
                print(f"Error processing email: {str(e)}")
                continue

        return {
            "success": True,
            "stopped": False,
            "processed": processed_count,
            "job_related": job_related_count
        }
        
    except Exception as e:
        print(f"Error in extract_emails: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/jobs/{job_id}")
def delete_job(job_id: str):
    try:
        # Delete job updates first (foreign key constraint)
        supabase.table("job_updates").delete().eq("job_id", job_id).execute()
        
        # Then delete the job
        supabase.table("job_applications").delete().eq("id", job_id).execute()
        
        return {"success": True, "message": "Job deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
