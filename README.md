# ChatGPT Voice Bot

A minimal web application that lets anyone talk to ChatGPT through their microphone and hear its answers out loud.

## Demo

Open the deployed site and click **🎙️ Speak**. Ask things like:

- "What should we know about your life story in a few sentences?"
- "What's your #1 superpower?"

…and the bot will answer in first-person.

![screenshot](docs/screenshot.png)

## Local development

```bash
# 1. clone and install
python -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt

# 2. export your OpenAI key
export OPENAI_API_KEY=sk-...

# 3. run
python backend/server.py  # http://127.0.0.1:8080
```

Then open `frontend/index.html` in your browser (or serve the folder with any static file server).

## Deployment (Render)

1. Push this repo to GitHub.
2. On Render: **New Web Service → GitHub repo**
   * Build command: `pip install -r backend/requirements.txt`
   * Start command: `python backend/server.py`
3. In **Environment** add `OPENAI_API_KEY`.
4. In **Static Sites** tab create one pointing to `voice-bot/frontend/`.

That's all—share the public URL with anyone.

---
MIT License 