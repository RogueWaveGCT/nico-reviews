# Deploying Nico Reviews — Step by Step

This guide gets your review showcase live on the internet with a URL you can share. No coding knowledge required.

We'll use **Render.com** — it has a free tier that supports the database this app needs.

---

## What you'll need

- A computer with a web browser
- An email address (to create a Render account)
- A GitHub account (free — we'll create one if you don't have it)

---

## Part 1: Get the code onto GitHub

GitHub is where Render pulls your app code from. Think of it as cloud storage for code.

### Step 1 — Create a GitHub account

1. Go to **https://github.com** and click **Sign up**
2. Follow the prompts: enter your email, create a password, pick a username
3. Verify your email when the confirmation arrives

### Step 2 — Create a new repository

1. Once logged in, click the **+** button in the top-right corner and choose **New repository**
2. Fill in:
   - **Repository name:** `nico-reviews`
   - **Description:** `My review showcase page`
   - Leave it set to **Public**
   - Do NOT tick "Add a README file" (we already have one)
3. Click **Create repository**
4. You'll see a page with setup instructions — leave this tab open, you'll need it in a moment

### Step 3 — Upload the project files

The easiest way (no terminal needed):

1. On the repository page you just created, you should see a link that says **"uploading an existing file"** — click it
2. Open the `nico-reviews` folder on your computer in Finder/File Explorer
3. Select **all files and folders** inside `nico-reviews` (but NOT the `node_modules` folder or `.next` folder if they exist — skip those)
4. Drag them onto the GitHub upload area
5. The key files to include are:
   - `src/` (the whole folder)
   - `package.json`
   - `package-lock.json` (if it exists)
   - `next.config.ts`
   - `tailwind.config.ts`
   - `postcss.config.mjs`
   - `tsconfig.json`
   - `Dockerfile`
   - `.dockerignore`
   - `railway.json`
   - `render.yaml`
6. Scroll down and click **Commit changes**

> **Important:** If you can't drag folders, you may need to use GitHub Desktop (free app) or the terminal. See the "Alternative: Using GitHub Desktop" section at the bottom.

---

## Part 2: Deploy on Render

### Step 4 — Create a Render account

1. Go to **https://render.com** and click **Get Started for Free**
2. Choose **Sign up with GitHub** (easiest — links your accounts automatically)
3. Authorise Render to access your GitHub

### Step 5 — Create a new Web Service

1. From the Render dashboard, click **New** → **Web Service**
2. Choose **Build and deploy from a Git repository** → click **Next**
3. Find `nico-reviews` in the list and click **Connect**
4. Fill in the settings:
   - **Name:** `nico-reviews` (or whatever you like — this becomes part of your URL)
   - **Region:** Pick the one closest to you (e.g., Frankfurt for UK/Europe)
   - **Runtime:** **Docker** (this should auto-detect from the Dockerfile)
   - **Instance Type:** **Free**
5. Scroll down — you should see the Dockerfile detected automatically

### Step 6 — Add the persistent disk

This is critical — it's where your reviews database lives.

1. Scroll down to **Advanced** settings (or look for a **Disks** section)
2. Click **Add Disk**
3. Fill in:
   - **Name:** `sqlite-data`
   - **Mount Path:** `/data`
   - **Size:** `1 GB` (more than enough)

### Step 7 — Add the environment variable

1. In the same settings page, find **Environment Variables**
2. Click **Add Environment Variable**
3. Set:
   - **Key:** `DATABASE_PATH`
   - **Value:** `/data/reviews.db`

### Step 8 — Deploy

1. Click **Create Web Service**
2. Render will now build and deploy your app — this takes 3–5 minutes
3. Watch the build logs — you'll see it pulling dependencies and building
4. When you see **"Your service is live"**, you're done!

### Step 9 — Get your URL and load demo data

1. At the top of your Render service page, you'll see your URL — something like:
   `https://nico-reviews.onrender.com`
2. Open that URL in your browser — it should redirect to the admin page
3. Click the **"Load demo data"** button — this populates the app with sample reviews
4. Click the **public showcase link** shown on the admin page to see your reviews page
5. **Copy that showcase link** — that's the one you share with customers!

---

## Part 3: You're live!

Your review showcase is now on the internet. Share the showcase link with anyone.

**Things to know:**

- **Free tier sleep:** On Render's free tier, the app goes to sleep after 15 minutes of no traffic. The first visit after sleeping takes ~30 seconds to wake up. Paid plans ($7/month) keep it always on.
- **Your data persists:** The SQLite database is stored on the persistent disk, so your reviews survive restarts and redeployments.
- **Updating the app:** If you ever update the code on GitHub, Render automatically rebuilds and redeploys.

---

## Troubleshooting

**Build fails with "better-sqlite3" errors:**
This usually means the Dockerfile isn't being used. Check that Render detected the runtime as "Docker" not "Node".

**"Application error" when visiting the URL:**
Check the Render logs (click "Logs" in your service dashboard). Common causes:
- Missing `DATABASE_PATH` environment variable
- Disk not mounted (check the Disks section)

**Can't upload folders to GitHub:**
Use GitHub Desktop (see below) or ask someone technical to run these commands in the project folder:
```
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/nico-reviews.git
git push -u origin main
```

---

## Alternative: Using GitHub Desktop

If dragging files to GitHub doesn't work (it can be fiddly with folders):

1. Download **GitHub Desktop** from https://desktop.github.com
2. Install it and sign in with your GitHub account
3. Go to **File** → **Add Local Repository** → browse to the `nico-reviews` folder
4. If it says "this isn't a repository", click **create a repository** and follow the prompts
5. Click **Publish repository** in the top bar
6. Untick "Keep this code private" if you want it public
7. Click **Publish Repository**

Your code is now on GitHub. Continue from Step 4 above.

---

## Alternative: Railway (if Render doesn't suit)

Railway (https://railway.app) also works well:

1. Sign up at https://railway.app with GitHub
2. Click **New Project** → **Deploy from GitHub Repo**
3. Select `nico-reviews`
4. Once deployed, go to **Settings** → **Volumes** → **Add Volume**
   - Mount path: `/data`
5. Add environment variable: `DATABASE_PATH` = `/data/reviews.db`
6. Railway gives you a URL under **Settings** → **Networking** → **Generate Domain**

Railway gives you $5 of free credit per month (no credit card needed for trial).
