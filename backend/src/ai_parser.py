import os
import json
import re
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL_NAME = "llama-3.3-70b-versatile"

def truncate_to_token_limit(text: str, max_tokens: int = 4000) -> str:
    """
    Intelligently truncate text to stay within Groq's token limit.
    """
    # Approximate character limit (4 chars per token)
    char_limit = max_tokens * 4
    
    if len(text) <= char_limit:
        return text

    # Split text into chunks
    chunks = text.split("\n")
    
    # Keep important parts
    header = "\n".join(chunks[:3])  # First 3 lines
    footer = "\n".join(chunks[-3:])  # Last 3 lines
    
    # Extract email body
    body = "\n".join(chunks[3:-3])
    body = body[:char_limit - len(header) - len(footer)]
    
    truncated_text = f"{header}\n{body}\n{footer}"
    print(f"Truncated email from {len(text)} to {len(truncated_text)} characters")
    
    return truncated_text

def ai_parse_email(email_text: str, received_date: str) -> dict:
    try:
        # Truncate email text before processing
        truncated_text = truncate_to_token_limit(email_text)
        
        prompt = f"""
        Analyze this email and return ONLY a JSON object with no additional text or formatting.
        Email received on: {received_date}

        Rules:
        1. Return EXACTLY this format if not job related:
        {{"job_related": false}}

        2. Return EXACTLY this format if job related:
        {{
            "job_related": true,
            "company": "<company name>",
            "position": "<job title>",
            "application_date": "{received_date}",
            "stage": "<one of: Application Received, Screen, Interview Scheduled, Technical Interview, Assessment, Offer, Rejection, Follow-up>",
            "description": "<brief summary>"
        }}

        Email text:
        {truncated_text}
        """

        chat_completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{
                "role": "user", 
                "content": prompt.strip()
            }],
            temperature=0.1,
            max_tokens=500
        )

        response_text = chat_completion.choices[0].message.content.strip()
        
        # Clean the response to ensure valid JSON
        json_str = re.search(r'\{.*\}', response_text, re.DOTALL)
        if not json_str:
            return {"job_related": False}
            
        result = json.loads(json_str.group())
        print(f"Parsed result: {result}")
        return result

    except Exception as e:
        print(f"Error in AI parsing: {str(e)}")
        print(f"Raw response: {response_text if 'response_text' in locals() else 'No response'}")
        return {"job_related": False}