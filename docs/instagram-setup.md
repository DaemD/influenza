# Instagram OAuth setup (Meta)

Influence uses **Instagram API with Instagram Login** (Business Login).  
Creators must have a **Business** or **Creator** Instagram account.

Personal accounts cannot authorize Graph API access.

## 1. Convert to Professional account

On Instagram mobile:

1. Settings → Account type and tools  
2. Switch to Professional Account  
3. Choose **Creator** or **Business**

## 2. Create a Meta app

1. Go to [developers.facebook.com](https://developers.facebook.com/)
2. Create App → type **Business**
3. Add product: **Instagram** → **API setup with Instagram Login**
4. Under Valid OAuth Redirect URIs, add:

```
http://localhost:3000/api/instagram/callback
```

For production, also add:

```
https://YOUR_DOMAIN/api/instagram/callback
```

5. Copy **Instagram App ID** and **Instagram App Secret**  
   (from Instagram → API setup with Instagram Login — not only the Facebook App ID if Meta shows a separate Instagram App ID)

## 3. Permissions

Request (at least):

| Permission | Why |
|---|---|
| `instagram_business_basic` | Username, photo, followers, media |
| `instagram_business_manage_insights` | Reel views / deeper insights (needs App Review for live users) |

In **Development** mode, only Meta app roles / Instagram testers can connect.  
Add your Instagram tester under App Roles → Instagram Testers and accept the invite on Instagram.

## 4. Environment variables

Add to `.env`:

```env
META_APP_ID="your_instagram_app_id"
META_APP_SECRET="your_instagram_app_secret"
META_REDIRECT_URI="http://localhost:3000/api/instagram/callback"
TOKEN_ENCRYPTION_KEY="64-char-hex-from-openssl-or-node"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

Generate an encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Restart `npm run dev` after editing `.env`.

## 5. Flow in the product

1. Creator signs up → `/onboarding/creator`
2. Clicks **Connect Instagram**
3. Redirects to Instagram OAuth (`/api/instagram/connect`)
4. Callback exchanges code → long-lived token (≈60 days)
5. We fetch profile + recent media, compute engagement, store:
   - encrypted access token on `SocialAccount`
   - current `SocialMetric`
   - snapshot `SocialPost` rows
6. Account gets **Verified Analytics**

Reconnect / sync anytime from **Creator → Settings**.

## 6. Without Meta credentials

If `META_APP_ID` / `META_APP_SECRET` are empty, onboarding falls back to **demo connect** so UI development still works. Demo data is marked without a real OAuth token (`hasRealToken: false`).

## Troubleshooting

| Error | Fix |
|---|---|
| OAuth not configured (503) | Set Meta env vars + `TOKEN_ENCRYPTION_KEY`, restart server |
| Invalid platform app | Use Instagram App ID from Instagram Login setup |
| Redirect URI mismatch | Exact match with `META_REDIRECT_URI` in Meta dashboard |
| Unsupported request / works only for you | Add the creator as an Instagram tester while app is in Development |
| Insights / reel views missing | `instagram_business_manage_insights` often needs App Review; engagement still works from likes/comments |
