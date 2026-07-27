# Project Prompt: Neeraj Kapoor — AI Career Diagnostic Coach Platform

Use this prompt with a coding agent (e.g., Claude Code, Cursor, or a full-stack dev team) to scaffold and build the product. It's written as a project brief you can hand off directly.

---

## 1. Project Overview

Build a responsive website + companion mobile app for **Neeraj Kapoor**, an AI-powered career diagnostic coach. The platform should let visitors:
- Learn about Neeraj's coaching background (portfolio)
- Interact with an AI agent modeled on Neeraj (voice + text)
- Get their resume/CV analyzed (ATS score)
- Take a dynamic career-challenge assessment
- Receive a visual diagnostic report of strengths/gaps
- Book a live session via Calendly
- Optionally have a live voice call with the AI agent

**Stack recommendation:** Next.js (App Router) + Tailwind CSS, deployed on Vercel. Backend via Vercel serverless functions / Edge functions, database on Supabase or Postgres (Neon), file storage on Vercel Blob or S3.

---

## 2. Website Design & Layout

- Clean, modern, trustworthy "executive coach" aesthetic — navy/charcoal + warm accent color, generous whitespace, large confident portrait imagery.
- Sections: Hero (Neeraj intro + CTA "Talk to my AI Coach"), Portfolio/About, Services, Assessment tool, ATS Checker, Testimonials, Calendar booking, Footer with contact.
- Sticky floating chat bubble (bottom-right) labeled "Ask Neeraj AI" that expands into the voice/text agent.
- Fully responsive; mobile app can reuse the same design system (React Native or Flutter, sharing API endpoints with the web app).

---

## 3. Portfolio Section (AI Coach Credentials)

- Bio, career history, coaching philosophy, certifications
- Success stories / before-after client outcomes
- Media: photos, video intro
- Clear positioning: "Career Diagnostic Coach helping professionals fix [resume gaps / interview readiness / positioning] issues."

---

## 4. AI Voice Agent — "Neeraj Kapoor AI"

- **Voice cloning**: Use a licensed voice-cloning API (e.g., ElevenLabs, Play.ht, or Resemble AI) with Neeraj's own recorded voice samples (consent required — his own voice, used with his authorization).
- **Conversational brain**: LLM-backed (Claude API) with a knowledge base built from Neeraj's coaching content + real-time web search for current career/industry info.
- **Interaction modes**: text chat bubble + real-time voice call (using a voice orchestration layer like ElevenLabs Conversational AI, Vapi, or Retell AI, which handle speech-to-text, LLM response, and text-to-speech in one pipeline).
- Auto-responds to visitor queries 24/7, cites Neeraj's coaching frameworks where relevant.

---

## 5. Dynamic Career Assessment

- Multi-step diagnostic flow identifying root causes of poor career outcomes:
  - No proper CV/resume
  - Low ATS score
  - Weak interview positioning
  - Unclear career direction
  - Networking/visibility gaps
- Format: multiple-choice question screens, branching logic based on answers (dynamic — next question depends on previous answer).

---

## 6. ATS Resume Checker

- Resume upload (PDF/DOCX)
- Parse resume text, run ATS-compatibility scoring (keyword match, formatting issues, section completeness) — can use an open-source ATS scoring library or a custom scoring model via LLM prompt.
- Return numeric score (0–100) + specific fix suggestions.

---

## 7. Visual Diagnostic Report

- After assessment + resume check, generate a visual report:
  - Radar/spider chart of category scores (Resume, ATS, Interview Readiness, Positioning, Networking)
  - Overall score gauge
  - Prioritized "what to work on next" list
- Deliver in-app and as a downloadable PDF.

---

## 8. Calendar Integration

- Embed Calendly widget connected to **[email protected]** (confirm correct email spelling before going live)
- CTA after report: "Book a 1:1 session with Neeraj"

---

## 9. Notes / Things to Confirm Before Build

- Voice cloning requires Neeraj's explicit consent and clean voice recordings (this is his own voice, so straightforward, but the chosen voice API's terms must be reviewed).
- Live voice-call AI agents (Vapi/Retell/ElevenLabs Conversational AI) have per-minute usage costs — factor into budget.
- Confirm the exact Calendly email (there's a typo risk: "recreationeeraj@gmail.com" — please confirm intended address).
- Decide mobile app approach: React Native/Flutter native app vs. installable PWA (faster, cheaper, often sufficient).

---

## 10. Suggested Build Order

1. Static site (design, portfolio, layout) → deploy on Vercel
2. Resume upload + ATS scoring backend
3. Assessment flow + visual report generation
4. Calendly embed
5. Text-based AI chat agent (Claude API + knowledge base)
6. Voice cloning + live voice agent (most complex — build last)
7. Mobile app wrapping the same APIs
