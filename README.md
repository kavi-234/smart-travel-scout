# SmartTravelScout

AI-powered travel discovery app. Describe your ideal trip in plain English and Gemini AI instantly matches it against a curated destination inventory.

**Live demo:** [Deploy to Vercel](#deploy-to-vercel)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Gemini 2.0 Flash (Google AI Studio) |
| Schema validation | Zod |
| Deploy | Vercel |

---

## Environment variables

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_key_here
```

Get a free API key at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

> `.env*` is excluded by `.gitignore` — your key is never committed.

---

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → import the repo.
3. Under **Environment Variables**, add `GEMINI_API_KEY`.
4. Click **Deploy**.

`vercel.json` is already configured with a 15 s function timeout for the `/api/search` route.

---

## Architecture

```
src/
  app/
    page.tsx              # Homepage — all client state lives here
    providers.tsx         # Dark-mode ThemeContext
    layout.tsx            # Root layout + anti-flash dark mode script
    globals.css           # Tailwind v4 config + animations
    api/search/route.ts   # POST /api/search — validates query, calls Gemini
    components/           # One file per UI component
  backend/
    data/inventory.ts     # Static destination list (add destinations here)
    services/gemini.ts    # Gemini REST wrapper with timeout + token cap
  shared/
    schema.ts             # Zod schemas shared between API and service layer
```

### AI guardrails

1. **Inventory-only results** — Gemini returns IDs; these are intersected with the real inventory before anything reaches the UI. The AI cannot invent destinations.
2. **Token budget** — only `id`, `title`, `location`, and `tags` are sent in the prompt. Responses are capped at `maxOutputTokens: 512`.
3. **Schema validation** — Zod rejects any response that doesn't match the expected `{results:[{id,reason}]}` shape.
4. **Query guardrails** — queries are length-limited to 300 chars and stripped of HTML tags and prompt-injection patterns before forwarding.
5. **Fetch timeout** — Gemini calls abort after 10 seconds to protect server response time.
6. **Reason clamping** — AI-generated reason strings are clamped to 200 chars so card layout is never broken.


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
