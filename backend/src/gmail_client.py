import os

from .db import supabase
from supabase import Client
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from base64 import urlsafe_b64decode
from bs4 import BeautifulSoup
from datetime import datetime


def get_service():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", ["https://www.googleapis.com/auth/gmail.readonly"])
    
    if not creds:
        flow = InstalledAppFlow.from_client_secrets_file(
        "credentials.json", ["https://www.googleapis.com/auth/gmail.readonly"]
        )
        creds = flow.run_local_server(port=0)

        with open("token.json", "w") as token:
            token.write(creds.to_json())

    return build("gmail", "v1", credentials=creds)

def get_emails(service):

    query = "after:2025/07/01"
    response = service.users().messages().list(userId="me", q=query).execute()
    messages = response.get("messages", [])
    email_data = []

    for msg in messages:
        msg_id = msg["id"]

        if is_email_processed(supabase, msg_id):
            continue  

        full_msg = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
        body = extract_body(full_msg)
        
        timestamp_ms = int(full_msg.get("internalDate", 0))
        date = datetime.fromtimestamp(timestamp_ms / 1000.0).strftime("%Y-%m-%d %H:%M:%S")

        if body and is_possibly_job_related(body):
            email_data.append({
                "body": body,
                "date": date
            })
            mark_email_as_processed(supabase, msg_id)


    return email_data

def is_email_processed(supabase: Client, email_id: str) -> bool:
    response = supabase.table("processed_emails").select("id").eq("id", email_id).execute()
    return len(response.data) > 0

def mark_email_as_processed(supabase: Client, email_id: str):
    supabase.table("processed_emails").insert({"id": email_id}).execute()


def extract_body(full_msg):
    #payload stores the content
    payload = full_msg["payload"]
    html_fallback = None #incase there is no plain text

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

    # If there is no plain text
    if html_fallback:
        soup = BeautifulSoup(html_fallback, "html.parser")
        return soup.get_text(separator="\n")
    
    # No parts in the content
    data = payload["body"].get("data")
    if data:
        return urlsafe_b64decode(data).decode("utf-8")
    
    return None

def is_possibly_job_related(email_text: str) -> bool:
    # Lowercase for easy matching
    text = email_text.lower()

    job_keywords = [
        "interview", "application", "hiring", "recruiter", "position",
        "offer", "career", "opportunity", "schedule", "job", "resume",
        "cv", "linkedin", "talent acquisition", "we're excited", "next steps",
        "congratulations", "assessment", "apply", "move forward", "update", "applying",
        "internship", "thanks for applying"
    ]

    irrelevant_keywords = [
        "unsubscribe", "newsletter", "password", "receipt", "invoice", 
        "terms of service", "privacy policy", "sale", "promo", "limited time", 
        "your order", "shipping", "tracking number", "alert", "issue"
    ]

    if any(word in text for word in job_keywords) and not any(word in text for word in irrelevant_keywords):
        return True
    return False
