# Vercel Deployment Guide

## Pre-Deployment Checklist

- [ ] All environment variables documented in `.env.example`
- [ ] `.env.local` is in `.gitignore` (never commit secrets)
- [ ] MongoDB Atlas IP whitelist includes Vercel IPs
- [ ] Cloudinary credentials configured
- [ ] SMTP credentials for email service ready
- [ ] Repository pushed to GitHub

## Quick Deployment Steps

1. **Connect Repository**
   ```
   Go to https://vercel.com/new
   Select your GitHub repository
   ```

2. **Configure Environment Variables**
   In Vercel Dashboard → Settings → Environment Variables, add:
   - `MONGODB_URL`
   - `SECRET_KEY`
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `SMTP_HOST`
   - `SMTP_USER`
   - `SMTP_PASSWORD`
   - `NEXT_PUBLIC_API_URL` (your production domain)

3. **Deploy**
   Click "Deploy" - Vercel will automatically:
   - Install dependencies
   - Run `npm run build`
   - Deploy to CDN

## Project Structure for Deployment

```
/
├── app/              # Next.js App Router
├── components/       # React components
├── lib/             # Utilities & helpers
├── models/          # Mongoose schemas
├── routes/          # Route constants
├── store/           # Redux store
├── public/          # Static assets
├── .env.example     # Environment template
├── .gitignore       # Git ignore rules
├── .eslintignore    # ESLint ignore
├── vercel.json      # Vercel config
├── next.config.mjs  # Next.js config
└── package.json     # Dependencies
```

## Key Configuration Files

### `vercel.json`
- Build command: `npm run build`
- Output: `.next`
- Environment variables references
- API function timeout: 30s

### `.env.example`
Template for all required environment variables - copy to `.env.local` locally, set in Vercel dashboard for production

### `.gitignore`
Prevents committing `.env.local`, `node_modules/`, `.next/`, etc.

## MongoDB Setup for Vercel

1. Go to MongoDB Atlas > Network Access
2. Add Vercel's IP ranges OR allow `0.0.0.0/0` (less secure, for testing)
3. Ensure connection string has correct database name: `nextjs-ecommerce`

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Build fails | Check build logs in Vercel Dashboard |
| API routes 500 error | Verify `MONGODB_URL` and `SECRET_KEY` env vars |
| Images not loading | Verify Cloudinary domain in `next.config.mjs` |
| Middleware not working | Clear browser cookies and restart build |
| Email not sending | Check SMTP credentials and Gmail app-specific password |

## Monitoring & Logs

- **Build Logs**: Vercel Dashboard → Deployments → View Details
- **Runtime Logs**: Vercel Dashboard → Functions
- **Error Tracking**: Check browser console and Vercel dashboard

## Rollback

To rollback to previous version:
1. Vercel Dashboard → Deployments
2. Find previous successful deployment
3. Click → Promote to Production

## Local Testing Before Deploy

```bash
npm run build
npm run start
# Test at http://localhost:3000
```

## Updates & Redeployments

- Push to main branch → automatic deployment
- Vercel cancels in-progress builds when new push detected
- Set up staging environment via git branches if needed
