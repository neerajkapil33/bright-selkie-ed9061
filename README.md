# Neeraj Kapil — AI Career Coach (w3me.in) — Netlify build

## What's in here
- `src/App.jsx` — the whole voice coach app
- `netlify/functions/coach.js` — secure backend proxy that holds your API key
- `netlify.toml` — routes `/api/coach` calls to the Netlify function automatically
- Standard Vite + React scaffold around it

The frontend never talks to Anthropic directly. It calls `/api/coach`, which `netlify.toml`
redirects to the real function, which holds your API key server-side. This is required —
a browser-side call straight to Anthropic's API would be blocked and would expose your key.

## Step 1 — Put this on GitHub

1. Unzip this folder on your computer
2. Go to github.com → sign in → click the **+** in the top right → **New repository**
3. Name it something like `w3me-neeraj-coach`, leave it Public or Private (either works), do **not** check "Add a README" (we already have one)
4. Click **Create repository**
5. On the next page, click **uploading an existing file**
6. Drag the *contents* of the unzipped folder in (or the whole folder — GitHub accepts folder drag-and-drop in most browsers)
7. Scroll down, click **Commit changes**

(If you're comfortable with git instead: `git init && git add . && git commit -m "init" && git remote add origin <your-repo-url> && git push -u origin main`)

## Step 2 — Deploy on Netlify

1. In Netlify, click **Add new site → Import an existing project**
2. Click **GitHub**, authorize if asked, select the `w3me-neeraj-coach` repo
3. Netlify should auto-detect the build command (`npm run build`) and publish directory (`dist`) from `netlify.toml` — leave those as-is
4. Before deploying (or right after, in **Site settings → Environment variables**), add:
   - Key: `ANTHROPIC_API_KEY`
   - Value: your key from console.anthropic.com (starts with `sk-ant-`)
5. Click **Deploy site**
6. Once it's live, go to **Site settings → Domain management → Add a domain**, and point `w3me.in` at this site (this involves updating your domain's DNS records at wherever you bought w3me.in — Netlify will show you exactly what records to add)

## Testing locally before deploying

```bash
npm install
netlify dev
```

`netlify dev` (not `npm run dev`) is needed to simulate the `/api/coach` function locally.

## Costs to know about

Every follow-up question and category score is a real Claude API call — about 24 calls per
full 12-category session, billed per-token on your Anthropic account. Set a spend cap in
console.anthropic.com → Settings → Limits before this goes live and gets real traffic.

## If voice doesn't work after deploying

- Confirm the phone isn't on silent/vibrate and media volume is up (the #1 cause)
- Voice input requires HTTPS — Netlify serves HTTPS by default, so this should be fine
- Voice input is only supported in Chrome-based and Safari browsers; Firefox does not support the Web Speech API used here

