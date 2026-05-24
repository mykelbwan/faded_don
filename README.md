## Faded DON

AI-powered Discord bot for the Faded NFT community.

## How to run

Clone the repo first:

```bash
git clone https://github.com/mykelbwan/faded_don.git
cd faded_don
```

This project has two parts:

1. `don/` runs the AI API on `http://127.0.0.1:3003`
2. `discord_bot/` listens for Discord messages and forwards them to the API

Start the API first, then start the Discord bot.

### Prerequisites

- Python `3.12+`
- Node.js
- `pnpm`
- A Google Gemini API key
- A Discord bot token

### 1. Start the AI API

Go to the Python app:

```bash
cd don
```

Create the env file:

```bash
cp .env.example .env
```

Set this variable in `.env`:

```env
GOOGLE_API_KEY="your gemini api key"
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the API:

```bash
python main.py
```

The API starts on port `3003`.

Verify it is running:

```bash
curl http://127.0.0.1:3003/health
```

Expected response:

```json
{"status":"ok"}
```

### 2. Start the Discord bot

Open a second terminal and go to the bot app:

```bash
cd discord_bot
```

Create the env file:

```bash
cp .env.example .env
```

Set these variables in `.env`:

```env
DISCORD_API_KEY="your bot api key"
DON_API_URL="http://127.0.0.1:3003/don"
```

Install dependencies:

```bash
pnpm install
```

Run in development:

```bash
pnpm dev
```

Or build and run production output:

```bash
pnpm build
pnpm start
```

### 3. Use the bot

In Discord, trigger the bot in either of these ways:

1. Mention the bot in a message
2. Reply to a previous message sent by the bot

The bot sends your message to the `don` API and replies with a short generated response.

### Troubleshooting

- If the bot exits on startup, check that `DISCORD_API_KEY` and `DON_API_URL` are set.
- If the API fails, check that `GOOGLE_API_KEY` is valid.
- If Discord replies do not appear, make sure the API is still running on port `3003`.
