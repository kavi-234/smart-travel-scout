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
7. **Privacy** — the only data forwarded to the AI is the user's search query string. No personal data, session data, or usage history is collected or stored.

---

## Submission Q&A

### 1. The "Under the Hood" Moment

**Hurdle:** When I first wired up the Gemini API using the official `@google/generative-ai` npm SDK, every request returned a `403 Forbidden` even though the API key was valid and tested in Google AI Studio. The error body was unhelpful — it just said the model was not found.

**Debugging:** I enabled full response logging and noticed the SDK was hitting `v1beta/models/gemini-pro` — not `v1`. I cross-checked the [REST API docs](https://ai.google.dev/api/rest) and confirmed that the `v1` endpoint uses a different model namespace (`gemini-2.0-flash`) and that some API key tiers only have access to `v1`, not `v1beta`.

**Fix:** I dropped the SDK entirely and wrote a minimal `callGemini()` function that hits the `v1` REST endpoint directly with a plain `fetch`. This also removed a dependency and gave me full control over request shape — which made it easy to add `maxOutputTokens`, `AbortController` timeout, and the `generationConfig` block that the SDK was quietly overriding.

A second related issue: Gemini occasionally wrapped its JSON response in markdown code fences (` ```json ... ``` `), which broke `JSON.parse`. I added a regex strip step (`replace(/^```(?:json)?\s*/i, "")`) as a belt-and-suspenders fallback, and tightened the prompt instruction to `Return ONLY a raw JSON object — no markdown, no explanation`.

---

### 2. The Scalability Thought

With 5 items, sending the full inventory in every prompt is fine. At 50,000 items it would be ~2–5 MB per request — far beyond any LLM context window and prohibitively expensive.

**Approach I would take:**

1. **Pre-compute embeddings offline.** Run each inventory item's `title + location + tags` through a text-embedding model (e.g. `text-embedding-004`) once, and store the resulting vectors in a vector database (e.g. Postgres + `pgvector`, Pinecone, or Weaviate).

2. **Top-k semantic retrieval at query time.** Embed the user's query with the same model, then run a nearest-neighbour search to retrieve the top 20–30 candidates. This step is fast (<50 ms) and cheap — no LLM involved yet.

3. **Send only candidates to the LLM.** Forward just those 20–30 slim items (`id, title, location, tags`) to Gemini for re-ranking and reason generation. Prompt size stays constant regardless of inventory size.

4. **Additional cost controls:**
   - Cache prompt+response pairs for identical queries (Redis with a 5-minute TTL).
   - Set `temperature: 0` for deterministic, repeatable output.
   - Keep a keyword pre-filter (e.g. "beach" → exclude mountain/city items) to short-circuit the vector search for obvious cases.
   - If the keyword filter alone returns ≤3 results, skip the LLM entirely and return them directly.

This hybrid retrieval pattern keeps token cost flat at O(k) regardless of inventory size, and improves precision because the LLM only sees semantically relevant candidates.

---

### 3. The AI Reflection

**Tool used:** GitHub Copilot (inside VS Code) throughout — for boilerplate, type definitions, and Tailwind class suggestions.

**Bad suggestion:** When writing the Zod validation for the Gemini response, Copilot autocompleted the schema as:

```typescript
export const GeminiResponseSchema = z.object({
  results: z.array(z.object({
    id: z.string(),        // ← wrong type
    reason: z.string(),
  }))
})
```

It inferred `id` as `z.string()` because it had seen `id` fields typed as strings in the surrounding codebase. But Gemini returns IDs as JSON numbers (e.g. `{"id": 3}`), so `z.string()` caused every response to fail schema validation silently — the array was always empty after parsing, but no error was thrown because Zod's default is to strip unrecognised fields, not throw.

**How I caught it:** I added a `console.error` log inside the filter step (`inventory.some(inv => inv.id === r.id)`) and saw that the filter was receiving `{id: "3", reason: "..."}` — a string `"3"` that never matched the numeric inventory IDs. Tracing back, I confirmed the Zod coercion was the cause.

**Fix:** Changed to `z.number()` and added a targeted test:
```typescript
// Quick sanity check — paste in terminal during dev
const sample = JSON.parse('{"results":[{"id":1,"reason":"test"}]}')
console.log(GeminiResponseSchema.parse(sample)) // must not throw
```

Lesson: Copilot suggestions for schema types need manual verification against the actual API contract — it patterns-matches from context, not from the real data shape.
