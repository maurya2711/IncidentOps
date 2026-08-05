# 🚀 IncidentOps Deployment Guide

This guide walks you through deploying **IncidentOps** to production using **Vercel** (Frontend) and **Render** (Backend API).

---

## 📋 Prerequisites

1. Your repository pushed to GitHub (`master` or `main` branch).
2. A free account on [Vercel](https://vercel.com).
3. A free account on [Render](https://render.com) (or [Railway](https://railway.app)).
4. Your MongoDB Atlas connection string.

---

## 🛠️ Step 1: Deploy Backend API to Render

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → Select **Web Service**.
3. Connect your GitHub repository (`IncidentOps`).
4. Fill out the service configuration:
   - **Name**: `incidentops-api`
   - **Region**: Select closest to your users (e.g. Singapore / US East).
   - **Root Directory**: `apps/api`
   - **Environment**: `Node`
   - **Build Command**: `pnpm install && pnpm --filter api build`
   - **Start Command**: `node dist/main.js` (or `node apps/api/dist/main.js` if running from root)

5. **Environment Variables**: Add the following under **Environment**:

   | Key                           | Value / Example                                                                                            |
   | ----------------------------- | ---------------------------------------------------------------------------------------------------------- |
   | `NODE_ENV`                    | `production`                                                                                               |
   | `PORT`                        | `10000`                                                                                                    |
   | `API_PREFIX`                  | `api`                                                                                                      |
   | `MONGODB_URI`                 | `mongodb+srv://maurya2711:Sharad2711@cluster0.8jmdh2j.mongodb.net/incidentops?retryWrites=true&w=majority` |
   | `FRONTEND_URL`                | `https://your-app-name.vercel.app` (Set this after creating Vercel app)                                    |
   | `JWT_ACCESS_SECRET`           | `generate-a-strong-secret-key-min-32-chars`                                                                |
   | `JWT_REFRESH_SECRET`          | `generate-another-strong-secret-key-min-32-chars`                                                          |
   | `JWT_ACCESS_EXPIRY`           | `15m`                                                                                                      |
   | `JWT_REFRESH_EXPIRY`          | `7d`                                                                                                       |
   | `JWT_REFRESH_REMEMBER_EXPIRY` | `30d`                                                                                                      |
   | `SMTP_HOST`                   | `smtp-relay.brevo.com`                                                                                     |
   | `SMTP_PORT`                   | `587`                                                                                                      |
   | `SMTP_USER`                   | `b3eab5001@smtp-brevo.com`                                                                                 |
   | `SMTP_PASS`                   | `your_brevo_smtp_key_here`                                                                                 |
   | `SMTP_FROM`                   | `dev.frontend1997@gmail.com`                                                                               |

6. Click **Create Web Service**. Render will build and deploy the NestJS API.
   - Once deployed, copy your backend URL (e.g. `https://incidentops-api.onrender.com`).

---

## ⚡ Step 2: Deploy Frontend to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository (`IncidentOps`).
4. Configure Project:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: Click _Edit_ and select `apps/web`.
   - **Build Command**: `pnpm --filter web build` (or default Next.js build)
   - **Output Directory**: `.next`

5. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL` = `https://incidentops-api.onrender.com` (Your Render API URL from Step 1)

6. Click **Deploy**. Vercel will build and assign a domain (e.g. `https://incident-ops.vercel.app`).

---

## 🔄 Step 3: Link CORS & Cookies

1. Go back to Render Dashboard → **`incidentops-api`** → **Environment**.
2. Update `FRONTEND_URL` to match your exact Vercel URL (e.g. `https://incident-ops.vercel.app`).
3. Click **Save Changes**. Render will automatically redeploy the backend with updated CORS origins.

---

## ✅ Step 4: Verification

1. Open your Vercel URL (`https://incident-ops.vercel.app`).
2. Sign in with your Super Admin credentials (`dev.frontend1997@gmail.com`).
3. Verify live metrics, incident creation, status page (`/status`), and user invitation features (`/dashboard/admin/users`).
