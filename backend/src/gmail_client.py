import os
import re
from datetime import datetime
from base64 import urlsafe_b64decode
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from bs4 import BeautifulSoup
from supabase import Client
from .db import supabase

def get_service(token: str):
    """Create Gmail API service instance"""
    creds = Credentials(token, scopes=["https://www.googleapis.com/auth/gmail.readonly"])
    return build("gmail", "v1", credentials=creds)

def extract_body(full_msg):
    """Extract email body from message payload"""
    payload = full_msg["payload"]
    html_fallback = None

    if "parts" in payload:
        for part in payload["parts"]:
            mime = part["mimeType"]
            data = part["body"].get("data")

            if data:
                decoded = urlsafe_b64decode(data).decode("utf-8")
                if mime == "text/plain":
                    return decoded
                elif mime == "text/html":
                    html_fallback = decoded

    if html_fallback:
        soup = BeautifulSoup(html_fallback, "html.parser")
        return soup.get_text(separator="\n")
    
    data = payload["body"].get("data")
    if data:
        return urlsafe_b64decode(data).decode("utf-8")
    
    return None

def mark_email_as_processed(db: Client, msg_id: str) -> None:
    """Track processed emails in the database"""
    try:
        # Check if already processed
        response = db.table("processed_emails").select("*").eq("id", msg_id).execute()
        if response.data:
            print(f"Email {msg_id} already processed")
            return

        # Insert new record
        result = db.table("processed_emails").insert({
            "id": msg_id,
            "processed_at": datetime.now().isoformat()
        }).execute()
        
        if not result.data:
            raise Exception("Failed to insert record")
            
        print(f"Successfully marked email {msg_id} as processed")
        
    except Exception as e:
        print(f"Error marking email as processed: {str(e)}")
        raise e

def is_email_processed(db: Client, msg_id: str) -> bool:
    """Check if an email has been processed"""
    try:
        response = db.table("processed_emails").select("id").eq("id", msg_id).execute()
        return len(response.data) > 0
    except Exception as e:
        print(f"Error checking processed email: {str(e)}")
        return False

def is_possibly_job_related(email_subject: str, email_text: str) -> bool:
    """Detect job-related emails with pattern matching"""
    text = (email_subject + " " + email_text).lower()
    
    # Exclude patterns for non-job emails
    exclude_patterns = [
        r"github\.com/.*/issues/\d+",  # GitHub issues
        r"lease\s+agreement",  # Housing
        r"rental\s+application",
        r"apartment\s+lease",
        r"password\s+reset",  # Security
        r"payment\s+confirmation",  # Financial
        r"job\s+alert\s+digest",  # Job alerts
        r"similar\s+jobs\s+for\s+you",
        r"weekly\s+job\s+matches",
        r"new\s+jobs\s+in\s+your\s+area"
    ]
    
    if any(re.search(pattern, text, re.IGNORECASE) for pattern in exclude_patterns):
        print(f"Excluded email - matched exclusion pattern")
        return False

    # Job application patterns
    application_patterns = [
        (r"thank.*for.*apply(ing|ication)", "application confirmation"),
        (r"application.*received|received.*application", "application received"),
        (r"interview.*schedule|schedule.*interview", "interview invitation"),
        (r"next.*steps.*application|application.*next.*steps", "next steps"),
        (r"offer.*letter|job\s+offer", "offer"),
        (r"unfortunately.*not.*moving.*forward|regret.*inform", "rejection"),
        (r"coding.*assessment|technical.*challenge", "assessment"),
        (r"background.*check|employment.*verification", "background check"),
        (r"application.*status|status.*update", "status update"),
        (r"moved.*forward|advance.*next.*round", "advancing"),
        (r"welcome.*team", "offer acceptance"),  
        (r"internship", "internship"),       
    ]
    
    for pattern, category in application_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            print(f"Matched job pattern: {category}")
            return True

    # Check ambiguous cases
    if ("application" in text or "applied" in text) and \
       not any(word in text for word in ["lease", "rental", "credit", "loan"]) and \
       any(word in text for word in ["position", "role", "opportunity", "candidacy", "hiring"]):
        print("Matched job application context")
        return True

    return False

async def get_emails(service, start_date: str, end_date: str, request=None):
    """Fetch emails one by one within date range"""
    try:
        start_date_formatted = start_date.replace('-', '/')
        end_date_formatted = end_date.replace('-', '/')
        query = f"after:{start_date_formatted} before:{end_date_formatted}"
        
        print(f"\nSearching emails with query: {query}")
        next_page_token = None
        
        while True:
            # Check for disconnection before fetching batch
            if request and await request.is_disconnected():
                print("\nSearch stopped by user during email fetching")
                await request.close()  # Force close the request
                return

            response = service.users().messages().list(
                userId="me", 
                q=query,
                maxResults=500,
                pageToken=next_page_token,
            ).execute()
            
            messages = response.get("messages", [])
            
            for msg in messages:
                # Check for disconnection before processing each email
                if request and await request.is_disconnected():
                    print("\nSearch stopped by user during email processing")
                    await request.close()  # Force close the request
                    return

                msg_id = msg["id"]
                
                # Step 2: Check if already processed
                if is_email_processed(supabase, msg_id):
                    print(f"Skipping already processed email: {msg_id}")
                    continue
                
                try:
                    # Step 1: Get full email content
                    full_msg = service.users().messages().get(
                        userId="me", 
                        id=msg_id, 
                        format="full"
                    ).execute()
                    
                    # Get headers
                    headers = full_msg.get("payload", {}).get("headers", [])
                    subject = next((h["value"] for h in headers if h["name"].lower() == "subject"), "")
                    message_id = next((h["value"] for h in headers if h["name"].lower() == "message-id"), None)
                    
                    # Clean message ID
                    if message_id:
                        message_id = message_id.strip("<>")
                    else:
                        message_id = msg_id
                    
                    # Step 3: Quick filter check
                    if is_possibly_job_related(subject, ""):
                        body = extract_body(full_msg)
                        if body and is_possibly_job_related(subject, body):
                            timestamp_ms = int(full_msg.get("internalDate", 0))
                            date = datetime.fromtimestamp(timestamp_ms / 1000.0).strftime("%Y-%m-%d")
                            
                            # Yield each email immediately
                            yield {
                                "body": body,
                                "date": date,
                                "subject": subject,
                                "msg_id": message_id
                            }
                    
                    # Check for disconnection after processing each email
                    if request and await request.is_disconnected():
                        print("\nSearch stopped by user after email processing")
                        await request.close()  # Force close the request
                        return
                        
                    # Mark as processed only if not disconnected
                    mark_email_as_processed(supabase, msg_id)
                    
                except Exception as e:
                    print(f"Error processing message {msg_id}: {str(e)}")
                    if request and await request.is_disconnected():
                        return
                    continue
            
            next_page_token = response.get("nextPageToken")
            if not next_page_token:
                break

    except Exception as e:
        print(f"Error fetching emails: {str(e)}")
        return
