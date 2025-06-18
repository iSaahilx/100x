import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables from .env if present
load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

SYSTEM_PROMPT = (
    "You are ChatGPT talking about yourself. "
    "Answer briefly, in first-person, and keep a friendly, conversational tone."
)


@app.post("/chat")
def chat():
    """Receive a user message and return the assistant's reply."""
    data = request.get_json(force=True)
    user_message = data.get("message", "")

    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message},
        ],
        temperature=0.7,
    )

    reply = completion.choices[0].message.content.strip()
    return jsonify({"reply": reply})


if __name__ == "__main__":
    # Allow overriding port via environment variable (e.g., for Render / Railway)
    port = int(os.getenv("PORT", 8080))
    app.run(host="0.0.0.0", port=port) 