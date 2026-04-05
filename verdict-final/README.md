# The Verdict — Setup Guide

## What This Is
A web app (works on mobile browser) where users can:
- Create an account and log in
- Add businesses / service providers
- Submit structured evaluations
- Get a clear outcome: Clear / Caution / Risk / High Risk
- See key points explaining why

---

## Outcome Logic
| Rule | Condition | Outcome |
|------|-----------|---------|
| 1 | 2+ critical risk signals | 🔴 High Risk |
| 2 | 1 critical risk signal | 🟠 Risk (score capped at 65) |
| 3 | No critical + 1+ risk signals | 🟡 Caution |
| 4 | No critical + no risk signals | 🟢 Clear |

Outcomes are based on signals, not scores. The score is secondary.

---

## To Run Locally (Optional)

1. Install Node.js from nodejs.org (v18+)
2. Open terminal in this folder
3. Run: `npm install`
4. Run: `npm start`
5. App opens at http://localhost:3000

The `.env` file already has your Supabase credentials — no setup needed.

---

## To Deploy to the Web (Recommended)

### Step 1 — Push to GitHub
1. Create a free account at github.com
2. Create a new repository called `the-verdict`
3. Upload all these files to the repository

### Step 2 — Deploy on Vercel
1. Create a free account at vercel.com
2. Click "New Project" → import your GitHub repo
3. Add these Environment Variables:
   - `REACT_APP_SUPABASE_URL` = https://zohdscuaasnxqaigdvmv.supabase.co
   - `REACT_APP_SUPABASE_ANON_KEY` = (your anon key from .env file)
4. Click Deploy

You'll have a live URL in ~2 minutes that works on any phone or computer.

---

## Turn Off Email Confirmation (For Testing)
1. Go to supabase.com → your project
2. Authentication → Settings
3. Turn off "Enable email confirmations"
4. Users can now sign up and log in immediately
