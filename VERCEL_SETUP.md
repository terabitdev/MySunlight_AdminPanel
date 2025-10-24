# Vercel Deployment Setup Guide

## Environment Variables Configuration

Your application uses Firebase and requires the following environment variables to be set in Vercel.

### Required Environment Variables

Add these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

| Variable Name | Description | Example Value |
|--------------|-------------|---------------|
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Messaging Sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase App ID | `1:123456789012:web:abcdef123456` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase Analytics Measurement ID | `G-XXXXXXXXXX` |

### How to Get Firebase Configuration Values

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on the **Gear Icon** (Settings) → **Project Settings**
4. Scroll down to **Your apps** section
5. Click on the **Web app** (</> icon)
6. Copy the `firebaseConfig` object values

### Steps to Add Environment Variables in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project: **MySunlight_AdminPanel**
3. Go to **Settings** tab
4. Click on **Environment Variables** in the left sidebar
5. For each variable:
   - Enter the **Key** (e.g., `VITE_FIREBASE_API_KEY`)
   - Enter the **Value** (your actual Firebase value)
   - Select environments: **Production**, **Preview**, and **Development**
   - Click **Save**

6. After adding all variables, go to **Deployments** tab
7. Click on the latest deployment
8. Click **Redeploy** button
9. ✅ Check **"Use existing Build Cache"** can be UNCHECKED for the first deployment with new env vars

### Important Notes

- ⚠️ **Never commit `.env` or `.env.local` files to Git** (they're already in `.gitignore`)
- ✅ All environment variables in Vite must start with `VITE_` to be exposed to the client
- ✅ After adding/updating environment variables, you must redeploy for changes to take effect
- ✅ The `.env.example` file is safe to commit and shows the structure needed

### Verifying Environment Variables

After deployment, check the browser console. If you see:
- ❌ `Firebase: Error (auth/invalid-api-key)` → Environment variables are missing or incorrect
- ✅ App loads successfully → Environment variables are configured correctly

### Local Development

For local development, copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual Firebase configuration values.

## Build Configuration

The project uses:
- **Framework**: Vite + React + TypeScript
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

These should be automatically detected by Vercel.

## Troubleshooting

### Build Fails with TypeScript Errors
- Clear Vercel build cache
- Go to Deployments → Click on failed deployment → Redeploy with "Clear build cache"

### Firebase Error on Deployed Site
- Check all environment variables are set in Vercel
- Ensure variable names start with `VITE_`
- Redeploy after adding/updating environment variables

### App Works Locally but Not on Vercel
- Compare local `.env.local` with Vercel environment variables
- Check browser console for specific error messages
- Verify Firebase project allows your Vercel domain in Firebase Console → Authentication → Settings → Authorized domains
