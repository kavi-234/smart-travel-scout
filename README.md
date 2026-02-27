# SmartTravelScout

AI-powered travel discovery app. Describe your ideal trip in plain English and Gemini AI instantly matches it against a curated destination inventory.

**Live demo:** [https://smart-travel-scout-five.vercel.app/](#https://smart-travel-scout-five.vercel.app/)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | Gemini 1.5 Flash 8B (Google) |
| Schema validation | Zod |
| Deploy | Vercel |

---

## Environment variables

Create a `.env.local` file in the project root:

```
GEMINI_API_KEY=your_key_here
```

Get a free API key at [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
    services/gemini.ts    # Gemini wrapper with retry backoff + local fallback
  shared/
    schema.ts             # Zod schemas shared between API and service layer
```

### AI guardrails

1. **Inventory-only results** — Gemini returns IDs; these are intersected with the real inventory before anything reaches the UI. The AI cannot invent destinations.
2. **Token budget** — only `id`, `title`, `location`, and `tags` are sent in the prompt. Responses are capped at `maxOutputTokens: 512`.
3. **Schema validation** — Zod rejects any response that doesn’t match the expected `{results:[{id,reason}]}` shape.
4. **Query guardrails** — queries are length-limited to 300 chars and stripped of HTML tags and prompt-injection patterns before forwarding.
5. **Fetch timeout** — Gemini calls abort after 15 seconds to protect server response time.
6. **Reason clamping** — AI-generated reason strings are clamped to 200 chars so card layout is never broken.
7. **Privacy** — the only data forwarded to the AI is the user’s search query string. No personal data, session data, or usage history is collected or stored.
8. **Rate-limit fallback** — if Gemini returns 429 after 3 retries with exponential backoff, the app automatically falls back to local keyword matching so users always get results.

---

## Submission Q&A

### 1. The “Under the Hood” Moment

**Hurdle:** The main challenge was persistent `429 Too Many Requests` errors from the Gemini API — even on the very first search after adding a fresh API key. Adding a new key didn’t help because the free-tier quota is shared across all keys on the same Google account.

**Debugging:** I confirmed the 429 was coming from the upstream Gemini API by logging the raw response status. I also found that the Next.js dev server caches `.env.local` at startup — so swapping API keys requires a full server restart, not just a hot reload.

**Fix:** Three-layer solution:
- Switched from `/v1/` to `/v1beta/` endpoint for broader model support
- Switched to `gemini-1.5-flash-8b` (smallest model, lowest token cost, highest free-tier tolerance)
- Added exponential backoff retry (up to 3×: 2 s → 4 s → 8 s) so transient quota blips recover silently
- Added local keyword-matching fallback so searches always return results even when the API quota is fully exhausted
- Added a server-side IP rate limiter (5 req / 60 s) to guard quota from rapid re-clicks

---

### 2. The Scalability Thought

With 5 items, sending the full inventory in every prompt is fine. At 50,000 items it would be ~2–5 MB per request — far beyond any LLM context window and prohibitively expensive.

**Approach I would take:**

1. **Pre-compute embeddings offline.** Run each inventory item’s `title + location + tags` through a text-embedding model (e.g. `text-embedding-004`) once, and store the resulting vectors in a vector database (e.g. Postgres + `pgvector`, Pinecone, or Weaviate).

2. **Top-k semantic retrieval at query time.** Embed the user’s query with the same model, then run a nearest-neighbour search to retrieve the top 20–30 candidates. This step is fast (<50 ms) and cheap — no LLM involved yet.

3. **Send only candidates to the LLM.** Forward just those 20–30 slim items (`id, title, location, tags`) to Gemini for re-ranking and reason generation. Prompt size stays constant regardless of inventory size.

4. **Additional cost controls:**
   - Cache prompt+response pairs for identical queries (Redis with a 5-minute TTL).
   - Keep a keyword pre-filter (e.g. “beach” → exclude mountain/city items) to short-circuit the vector search for obvious cases.
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

It inferred `id` as `z.string()` because it had seen `id` fields typed as strings in the surrounding codebase. But Gemini returns IDs as JSON numbers (e.g. `{"id": 3}`), so `z.string()` caused every response to fail schema validation silently — the array was always empty after parsing, but no error was thrown because Zod’s default is to strip unrecognised fields, not throw.

**How I caught it:** I added a `console.error` log inside the filter step (`inventory.some(inv => inv.id === r.id)`) and saw that the filter was receiving `{id: "3", reason: "..."}` — a string `"3"` that never matched the numeric inventory IDs. Tracing back, I confirmed the Zod coercion was the cause.

**Fix:** Changed to `z.number()` and added a targeted test:
```typescript
// Quick sanity check — paste in terminal during dev
const sample = JSON.parse('{"results":[{"id":1,"reason":"test"}]}')
console.log(GeminiResponseSchema.parse(sample)) // must not throw
```

**Live demo:** [https://smart-travel-scout-five.vercel.app/](#https://smart-travel-scout-five.vercel.app/)

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| AI | GPT-4o-mini (OpenAI) |
| Schema validation | Zod |
| Deploy | Vercel |

---

## Environment variables

Create a `.env.local` file in the project root:

```
OPENAI_API_KEY=your_key_here
```

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Architecture

```
src/
  app/
    page.tsx              # Homepage — all client state lives here
    providers.tsx         # Dark-mode ThemeContext
    layout.tsx            # Root layout + anti-flash dark mode script
    globals.css           # Tailwind v4 config + animations
    api/search/route.ts   # POST /api/search — validates query, calls OpenAI
    components/           # One file per UI component
  backend/
    data/inventory.ts     # Static destination list (add destinations here)
    services/openai.ts    # OpenAI wrapper with retry backoff + token cap
  shared/
    schema.ts             # Zod schemas shared between API and service layer
```

### AI guardrails

1. **Inventory-only results** — OpenAI returns IDs; these are intersected with the real inventory before anything reaches the UI. The AI cannot invent destinations.
2. **Token budget** — only `id`, `title`, `location`, and `tags` are sent in the prompt. Responses are capped at `maxOutputTokens: 512`.
3. **Schema validation** — Zod rejects any response that doesn't match the expected `{results:[{id,reason}]}` shape.
4. **Query guardrails** — queries are length-limited to 300 chars and stripped of HTML tags and prompt-injection patterns before forwarding.
5. **Fetch timeout** — OpenAI calls abort after 15 seconds to protect server response time.
6. **Reason clamping** — AI-generated reason strings are clamped to 200 chars so card layout is never broken.
7. **Privacy** — the only data forwarded to the AI is the user's search query string. No personal data, session data, or usage history is collected or stored.

---

## Submission Q&A

### 1. The "Under the Hood" Moment

**Hurdle:** After initially building with Gemini I migrated to OpenAI. The main challenge was persistent `429 Too Many Requests` errors — even on the very first search. Adding a new Gemini API key didn't help because the free-tier quota is shared across all keys on the same Google account.

**Debugging:** I confirmed the 429 was coming from the upstream API by logging the raw response status. I also found that the Next.js dev server caches `.env.local` at startup — so swapping API keys requires a full restart, not just a hot reload.

**Fix:** Migrated to the official `openai` npm SDK using `gpt-4o-mini`, which has true per-key quota and is cheaper than `gpt-3.5-turbo`. Using `response_format: { type: "json_object" }` guarantees valid JSON natively, eliminating the markdown-fence strip step that Gemini required. I also added exponential backoff retry (up to 3×: 2 s → 4 s → 8 s) and a local keyword-matching fallback so searches always return results even when the API quota is exhausted.

---

### 2. The Scalability Thought

With 5 items, sending the full inventory in every prompt is fine. At 50,000 items it would be ~2–5 MB per request — far beyond any LLM context window and prohibitively expensive.

**Approach I would take:**

1. **Pre-compute embeddings offline.** Run each inventory item's `title + location + tags` through a text-embedding model (e.g. `text-embedding-004`) once, and store the resulting vectors in a vector database (e.g. Postgres + `pgvector`, Pinecone, or Weaviate).

2. **Top-k semantic retrieval at query time.** Embed the user's query with the same model, then run a nearest-neighbour search to retrieve the top 20–30 candidates. This step is fast (<50 ms) and cheap — no LLM involved yet.

3. **Send only candidates to the LLM.** Forward just those 20–30 slim items (`id, title, location, tags`) to GPT-4o-mini for re-ranking and reason generation. Prompt size stays constant regardless of inventory size.

4. **Additional cost controls:**
   - Cache prompt+response pairs for identical queries (Redis with a 5-minute TTL).
   - Set `temperature: 0` for deterministic, repeatable output.
   - Keep a keyword pre-filter (e.g. "beach" → exclude mountain/city items) to short-circuit the vector search for obvious cases.
   - If the keyword filter alone returns ≤3 results, skip the LLM entirely and return them directly.

This hybrid retrieval pattern keeps token cost flat at O(k) regardless of inventory size, and improves precision because the LLM only sees semantically relevant candidates.

---

### 3. The AI Reflection

**Tool used:** GitHub Copilot (inside VS Code) throughout — for boilerplate, type definitions, and Tailwind class suggestions.

**Bad suggestion:** When writing the Zod validation for the OpenAI response, Copilot autocompleted the schema as:

```typescript
export const AIResponseSchema = z.object({
  results: z.array(z.object({
    id: z.string(),        // ← wrong type
    reason: z.string(),
  }))
})
```

It inferred `id` as `z.string()` because it had seen `id` fields typed as strings in the surrounding codebase. But OpenAI returns IDs as JSON numbers (e.g. `{"id": 3}`), so `z.string()` caused every response to fail schema validation silently — the array was always empty after parsing, but no error was thrown because Zod's default is to strip unrecognised fields, not throw.

**How I caught it:** I added a `console.error` log inside the filter step (`inventory.some(inv => inv.id === r.id)`) and saw that the filter was receiving `{id: "3", reason: "..."}` — a string `"3"` that never matched the numeric inventory IDs. Tracing back, I confirmed the Zod coercion was the cause.

**Fix:** Changed to `z.number()` and added a targeted test:
```typescript
// Quick sanity check — paste in terminal during dev
const sample = JSON.parse('{"results":[{"id":1,"reason":"test"}]}')
console.log(AIResponseSchema.parse(sample)) // must not throw
```
