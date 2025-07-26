from src.gmail_client import get_service, get_emails
from src.ai_parser import ai_parse_email
from src.db import insert_job

def main():
    service = get_service()
    emails = get_emails(service)

    for email in emails:
        body = email["body"]
        date = email["date"]
        ai_data = ai_parse_email(body, date)

        if ai_data.get("job_related"):
            insert_job(ai_data)
    

if __name__ == "__main__":
    main()
