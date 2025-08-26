# Anti-Fake News — Mock + Real Mix (Vue 3 + Vite + Tailwind + Router + Pinia)

- Home list with filters (All/Fake/Not Fake), page-size, pagination, search
- Detail page with summary, **Details (content[])**, **References (sources[])**, copy-link
- Sub-routes: `/news/:id/comments` (pagination, sort, like/edit/delete) and `/news/:id/vote` (instant tally + percent bar)
- Tailwind UI, responsive
- **Mix mock + real**: loads `public/real-news.json` and merges with mock data at runtime
- SPA mock rules: state in Pinia only; reload clears user-added comments/votes

## Run
```bash
npm i
npm run dev
```

## Build/Preview
```bash
npm run build
npm run preview
```

## Real news mix
- Update **public/real-news.json** to curate real articles (title, summary, content[], sources[], createdAt).
- If fetch fails, app falls back to mock only.

## Deploy (Vercel)
- Build command: `npm run build`
- Output: `dist`
- `vercel.json` included for SPA routing.
