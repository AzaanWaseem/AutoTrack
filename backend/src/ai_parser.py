import os
import json
import re
import time
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MODEL_NAME = "llama3-70b-8192"

def ai_parse_email(email_text: str, received_date: str) -> dict:
    prompt = f"""
    You are a helpful assistant that analyzes emails to determine if they are related to job applications, interviews, or offers.

    This email was received on **{received_date}**.

    Respond with ONLY valid JSON. Do not include any extra text, markdown, or commentary.

    If the email is NOT job-related, respond with:
    {{ "job_related": false }}

    If it IS job-related, respond with a JSON object in this format:
    {{
    "job_related": true,
    "company": "Company Name",
    "position": "Job Title",
    "application_date": "YYYY-MM-DD",  ← You can use the received_date if it's the application date
    "description": "Short summary of the email with next steps, if any"
    }}

    Email:
    \"\"\"
    {email_text}
    \"\"\"

    Respond ONLY with JSON and nothing else.
    """
    try:
        chat_completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}]
        )

        raw_text = chat_completion.choices[0].message.content.strip()
        match = re.search(r'\{[\s\S]*\}', raw_text)

        if match:
            return json.loads(match.group(0))
        else:
            print("Groq response is not in JSON format")
            return {"job_related": False}

    except Exception as e:
        print("Error during Groq parsing:", e)
        return {"job_related": False}
