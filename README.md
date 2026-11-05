# DebateLab

DebateLab is a practice tool for debating. You pick a motion and a side, research it with real data and news, debate an AI opponent round by round, and then get feedback from an AI coach.

## Features

- **Setup:** enter a motion, choose For or Against, the number of rounds (3–6) and the time per round (2–5 minutes). The AI takes the other side. The "For" side always speaks first.
- **Research:** search World Bank indicators (for example GDP growth or literacy rate) for any country, search Guardian news articles, and write notes.
- **Arena:** debate the AI opponent with a timer for each round. When the timer runs out, whatever you have typed is sent automatically. Your notes are shown next to the debate.
- **AI opponent:** argues the other side, rebuts your points, and can look up World Bank data and recent news to check your facts or support its own arguments.
- **Debrief:** an AI coach reviews the debate. It lists your strengths, weaknesses and logical fallacies, evidence you could have used, how well you used your notes, a model answer and tips. It does not pick a winner or give a score.
- **Past debates:** finished debates and their reports are saved in your browser. You can export them to a JSON file, import them again, or clear everything.

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS, Zustand, React Router. Data is stored in the browser with IndexedDB.
- **Backend:** Node.js and Express. It is stateless: it has no database and only forwards requests to the external APIs.
- **External services:**
  - Groq for the AI model (default `openai/gpt-oss-120b`)
  - World Bank API (no key needed)
  - The Guardian Open Platform for news

## Running it locally

You need Node.js 18 or newer, a [Groq API key](https://console.groq.com) and a [Guardian API key](https://open-platform.theguardian.com/access/).

**Backend**

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Open `.env` and fill in `GROQ_API_KEY` and `GUARDIAN_API_KEY`. `PORT`, `FRONTEND_URL` and `GROQ_MODEL` already have working defaults.

**Frontend**

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

`VITE_API_URL` must point to the backend (default `http://localhost:5000`).

If a key is missing, the app shows a yellow banner at the top. You can also open `http://localhost:5000/api/health` to see what is configured.

## How the AI opponent uses data

For each reply, the opponent can make **at most 3 lookups** and has a time budget of about 30 seconds for them. It has two tools:

- `get_world_bank_data`: finds a matching World Bank indicator for a topic and returns its recent values for a country. If the model knows the exact indicator code, it can pass that instead. The result also lists other close matches, so the model can correct a wrong pick.
- `search_news`: searches Guardian articles from the last two years.

The prompt tells the opponent to use World Bank data for long-term statistics and news for recent events, and to never invent figures. If a lookup fails, it argues without numbers.

## Known limitations and problems

We want to be clear about what does not work perfectly yet.

1. **The opponent only remembers the last 8 messages.** In long debates (5–6 rounds), it can forget arguments from the first rounds.

2. **"Never invent figures" is a prompt rule, not a guarantee.** Nothing in the code checks that the numbers in a reply came from a tool result. The model can still misread or misquote data.

3. **Free-tier limits.** Groq's free tier has rate limits, so the AI can be temporarily unavailable when busy. The app shows a message when this happens.

## Privacy

Your motion, arguments and notes are sent to Groq to generate the opponent's replies and the coach report. Your search terms are sent to the World Bank and The Guardian. The DebateLab backend itself stores nothing.