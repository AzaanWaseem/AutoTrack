import os
import json
import re
import time
import tiktoken
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

MAX_TOKENS = 5500

MODEL_NAME = "llama3-70b-8192"

def ai_parse_email(email_text: str, received_date: str) -> dict:
    email_text = truncate_to_token_limit(email_text)

    prompt = f"""
    You are a helpful assistant that extracts structured job application updates from emails.

    This application was date is {received_date}.

    Respond ONLY with valid JSON. Do not include any extra text, commentary, or formatting.

    If the email is NOT related to a job application update, respond with:
    {{ "job_related": false }}

    If the email IS related to a job application update, respond with the following JSON format:

    {{
    "job_related": true,
    "company": "Name of the company",
    "position": "Job title (assume a relevant title)",
    "application_date": "YYYY-MM-DD",
    "stage": "Current stage of the application (e.g. interview, assessment, offer, rejection, etc)",
    "description": "Brief summary or next steps mentioned in the email"
    }}

    Email:
    \"\"\"{email_text}\"\"\"

    Respond ONLY with the JSON object. No explanations or extra content.
    """

    max_retries = 3
    for attempt in range(max_retries):
        try:
            chat_completion = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[{"role": "user", "content": prompt}]
            )

            raw_text = chat_completion.choices[0].message.content.strip()
            
            match = re.search(r'\{[\s\S]*\}', raw_text)

            if match:
                result = json.loads(match.group(0))
                return result
            else:
                print("Groq response is not in JSON format")
                return {"job_related": False}

        except Exception as e:
            if "rate_limit" in str(e).lower() or "429" in str(e):
                wait_time = 65  # seconds
                print(f"Rate limit hit. Waiting {wait_time}s before retrying... (Attempt {attempt + 1})")
                time.sleep(wait_time)
            else:
                print("Error during Groq parsing:", e)
                return {"job_related": False}

    print("Failed after retries.")
    return {"job_related": False}


def truncate_to_token_limit(text: str, max_tokens: int = MAX_TOKENS) -> str:
    encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")  # closest supported
    tokens = encoding.encode(text)
    if len(tokens) > max_tokens:
        print(f"Truncating from {len(tokens)} to {max_tokens} tokens")
        tokens = tokens[:max_tokens]
    return encoding.decode(tokens)