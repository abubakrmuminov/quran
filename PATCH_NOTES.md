# Quran App – Bug Fixes & Setup Notes

## What I fixed
1. **OAuth ready**: Added `app/lib/auth.ts` and upgraded `app/lib/quran.ts` to fetch and cache a Bearer token via the OAuth2 *client_credentials* flow **if** `QURAN_CLIENT_ID/SECRET` and `QURAN_OAUTH_TOKEN_BASE` are set. Fallback to `QURAN_API_TOKEN` or unauthenticated calls still works.
2. **Next.js config**: Removed `output: 'export'` from `next.config.js` (static export was breaking dynamic server fetching).
3. **Metadata import**: Fixed `app/layout.tsx` to import `Metadata` from `next` (was using an internal path).
4. **i18n/typo**: Fixed a broken string in the home page results counter (`...chapters` → proper localized label).
5. **.env hints**: Appended commented env vars for Quran.Foundation OAuth to `.env.local`.

## How to run
```bash
# 1) Install deps
npm install

# 2) Configure environment
cp .env.local .env
# In .env, either:
#   a) Use Quran.com API without auth (works for public endpoints)
# OR b) Enable OAuth (Quran.Foundation):
#      QURAN_OAUTH_TOKEN_BASE=https://prelive-oauth2.quran.foundation   # or https://oauth2.quran.foundation
#      QURAN_CLIENT_ID=your-client-id
#      QURAN_CLIENT_SECRET=your-client-secret
# (QURAN_API_BASE defaults to https://api.quran.com/api/v4; change if you use a different content API.)

# 3) Start dev
npm run dev
```

## Notes
- If you target full static export, you need to refactor to client-side fetching or add static generation and caching. For now the project is configured for SSR/ISR via Next.js app router.
- Reciters/translations lists are loaded from the API at runtime. You can pin or filter specific reciters in `app/components/settings-page-content.tsx` or via the API response.
