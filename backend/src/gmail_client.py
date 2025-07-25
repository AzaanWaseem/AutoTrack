import os

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
    response = service.users().messages().list(userId="me", maxResults=10).execute()
    messages = response.get("messages", [])
    email_data = []

    for msg in messages:
        msg_id = msg["id"]
        full_msg = service.users().messages().get(userId="me", id=msg_id, format="full").execute()
        body = extract_body(full_msg)
        
        timestamp_ms = int(full_msg.get("internalDate", 0))
        date = datetime.fromtimestamp(timestamp_ms / 1000.0).strftime("%Y-%m-%d %H:%M:%S")

        if body:
            email_data.append({
                "body": body,
                "date": date
            })

    return email_data

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