# VEP AI+HI Orchestration Simulator

A working prototype demonstrating how Intuit's Virtual Expert Platform should orchestrate AI agents and human experts — built for the GPM VEP role (Job ID: 19602, Bangalore).

---

## 🚀 Deploy to Vercel (Fastest — 5 minutes)

### Prerequisites
- A GitHub account (https://github.com)
- A Vercel account (https://vercel.com — sign up free with your GitHub)

### Step-by-step

**Step 1: Create a GitHub repository**

1. Go to https://github.com/new
2. Repository name: `vep-orchestration-prototype`
3. Set to **Public** (so Intuit people can see the code too)
4. Click "Create repository"
5. You'll see instructions — keep this page open

**Step 2: Push this code to GitHub**

Open your terminal and run these commands one by one:

```bash
# Navigate to the project folder (wherever you unzipped it)
cd vep-prototype

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "VEP AI+HI Orchestration Prototype - Intuit GPM application"

# Connect to your GitHub repo (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/vep-orchestration-prototype.git

# Push
git branch -M main
git push -u origin main
```

**Step 3: Deploy on Vercel**

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `vep-orchestration-prototype`
4. Framework Preset will auto-detect as **Next.js**
5. Click "Deploy"
6. Wait ~60 seconds
7. ✅ You'll get a URL like: `https://vep-orchestration-prototype.vercel.app`

**Step 4: (Optional) Custom domain**

If you want a cleaner URL like `vep.yourdomain.com`:
1. Go to your Vercel project → Settings → Domains
2. Add your custom domain
3. Follow the DNS instructions

---

## 🖥️ Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

---

## 📁 Project Structure

```
vep-prototype/
├── app/
│   ├── layout.js          # Root layout + SEO metadata
│   ├── page.js            # Main page
│   ├── globals.css        # CSS reset
│   └── components/
│       └── VEPPrototype.jsx  # The entire prototype
├── package.json
├── next.config.js
└── .gitignore
```

---

## 📋 What This Prototype Demonstrates

| Section | What It Shows |
|---------|---------------|
| **The Problem** | Intuit's AI agents are shipping, but the AI+HI orchestration layer isn't. Uses real earnings data. |
| **VEP Simulator** | 4 Indian SMB scenarios with different routing decisions (AI-only, AI+Expert, Expert-required, Self-serve). Interactive step-by-step simulation. |
| **Architecture** | 6-layer platform architecture for VEP orchestration. Shows what the GPM builds. |
| **Metrics** | Day-1 success framework: Platform Health, Customer Outcomes, Business Impact, Learning Loop. |
| **Getting Hired** | Distribution strategy for the application itself. |
| **About Me** | JD-to-experience mapping. |

---

## 🎯 Where to Share This URL

1. **Intuit job application** (Job ID: 19602) — paste in "portfolio/additional links" field
2. **Email to TalentAcquisition@intuit.com** — include in body
3. **LinkedIn article** — embed as a link
4. **Employee referral requests** — send to Intuit PMs on LinkedIn
5. **Naukri application** — include in profile links

---

Built by Appu | March 2026
