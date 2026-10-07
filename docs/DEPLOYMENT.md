# haul: Deployment Guide

Step-by-step instructions for putting haul online with free tiers:

| Piece | Platform |
|---|---|
| Database | MongoDB Atlas (M0 free cluster) |
| API (`backend/`) | Render web service |
| Web app (`frontend/`) | Vercel |
| Payments | Razorpay (test mode first, then live) |

Deploy in this order: **database → API → web app → connect them**. Each step needs a value from the one before.

---

## 1. MongoDB Atlas

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas) and create an **M0** cluster (pick the region closest to your Render region, for example Mumbai `ap-south-1` or Singapore).
2. **Database Access → Add New Database User.** Use password authentication and give it *Read and write to any database*. Save the password.
3. **Network Access → Add IP Address → Allow access from anywhere (`0.0.0.0/0`).** Render's free tier has no fixed outbound IP, so this is required. The database is still protected by the user and password.
4. **Connect → Drivers** and copy the connection string. Add the database name `shopkart` before the `?`:

   ```
   mongodb+srv://<user>:<password>@<cluster>.mongodb.net/shopkart?retryWrites=true&w=majority
   ```

   If the password has special characters (`@ : / ? #`), URL-encode them.

This is your `MONGO_URL`.

## 2. Razorpay keys

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com). Test mode works immediately, with no KYC.
2. With **Test Mode** on, go to **Account & Settings → API Keys → Generate Key**.
3. Copy the **Key ID** (`rzp_test_…`) and the **Key Secret** (shown once).

These are `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Test mode never moves real money; use Razorpay's [test cards and UPI IDs](https://razorpay.com/docs/payments/payments/test-card-details/).

## 3. API on Render

1. Push the repo to GitHub.
2. In [Render](https://render.com) choose **New → Web Service** and connect the repository.
3. Settings:

   | Setting | Value |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
   | Instance Type | Free (or Starter to avoid cold starts) |
   | Health Check Path | `/health` (under Advanced) |

4. **Environment variables:**

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URL` | from step 1 |
   | `JWT_SECRET` | a long random string, e.g. output of `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `CLIENT_URL` | leave as `http://localhost:5173` for now; you'll update it in step 5 |
   | `RAZORPAY_KEY_ID` | from step 2 |
   | `RAZORPAY_KEY_SECRET` | from step 2 |

   Do not set `PORT`; Render provides it.

5. **Create Web Service.** When the deploy finishes, open `https://<your-service>.onrender.com/health`. You should see:

   ```json
   { "status": "ok", "db": "connected" }
   ```

   If the deploy fails with a MongoDB error, check the Atlas network access rule and the password encoding in `MONGO_URL`. The API exits on purpose if it can't reach the database.

Copy the service URL. This is your API URL.

## 4. Web app on Vercel

1. In [Vercel](https://vercel.com) choose **Add New → Project** and import the repository.
2. Settings:

   | Setting | Value |
   |---|---|
   | Root Directory | `frontend` |
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. **Environment Variables:** add `VITE_API_URL` = your Render URL, e.g. `https://shopkart-api.onrender.com` (no trailing slash).

   Vite bakes this value into the build. If you change it later, redeploy.

4. **Deploy.** `frontend/vercel.json` already sends every route to `index.html`, so refreshing `/products/…` or `/orders/…` works, and it adds long-term caching for hashed assets.

Copy the production URL, e.g. `https://shopkart.vercel.app`.

## 5. Connect the two

1. In Render, set `CLIENT_URL` to the Vercel URL, e.g. `https://shopkart.vercel.app`. To allow preview deployments or a custom domain too, separate origins with commas:

   ```
   https://shopkart.vercel.app,https://shop.example.com
   ```

2. Save. Render redeploys automatically.
3. Open the Vercel URL, sign up, add a product to the cart and complete a test payment.

## 6. Add products

There is no admin screen yet, so add products through the API:

```bash
API=https://shopkart-api.onrender.com

curl -X POST "$API/products" \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Headphones","description":"Over-ear, 30h battery","price":2499,"category":"Electronics","image":"https://example.com/headphones.jpg","stock":10}'
```

Use categories `Electronics`, `Fashion`, `Books` or `Home` so they appear in the category filters. `image` must be a publicly reachable URL (Cloudinary, ImageKit, an S3 bucket or any image host).

> `POST /products` is not protected yet. Until admin-only access ships, don't publish the API URL beyond your frontend, and check the catalogue for unexpected products.

## 7. Custom domains (recommended)

On the default domains, the web app (`*.vercel.app`) and API (`*.onrender.com`) are different sites, so the login cookie is a third-party cookie. Safari and some privacy settings block those, and login won't stick.

Fix it by putting both on the same parent domain:

| | Domain | Where |
|---|---|---|
| Web app | `shop.example.com` | Vercel → Project → Settings → Domains |
| API | `api.example.com` | Render → Service → Settings → Custom Domains |

Then update:

- Vercel `VITE_API_URL=https://api.example.com` and redeploy
- Render `CLIENT_URL=https://shop.example.com`

Both platforms issue HTTPS certificates automatically.

## 8. Going live with Razorpay

1. Complete KYC in the Razorpay dashboard and get live mode activated.
2. Switch the dashboard to **Live Mode** and generate live API keys (`rzp_live_…`).
3. Replace `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in Render. No frontend change is needed, because the key ID is sent by the API at checkout.
4. Make one small real payment and refund it from the dashboard.
5. Until the webhook ships, check **Payments** in the Razorpay dashboard daily for captured payments whose haul order is still PENDING (the receipt field is the haul order ID).

## 9. Operations

| Task | How |
|---|---|
| Health monitoring | Point UptimeRobot or Better Stack at `/health`. A 5-minute ping also keeps the free Render instance awake |
| Logs | Render → Logs. Search for `Stock conflict` and `Razorpay order creation failed` |
| Backups | Atlas M0 has no automated backups. Use `mongodump` on a schedule, or upgrade to M10+ for continuous backups |
| Rotate `JWT_SECRET` | Change it in Render. All shoppers are logged out |
| Rotate Razorpay keys | Generate new keys in the dashboard, update Render, then revoke the old ones |

## 10. Pre-launch checklist

- [ ] `/health` returns `{"status":"ok","db":"connected"}`
- [ ] `NODE_ENV=production` on Render
- [ ] `CLIENT_URL` exactly matches the frontend origin (scheme included, no trailing slash)
- [ ] `VITE_API_URL` points at the API and the frontend was redeployed after setting it
- [ ] Sign up, log out, log back in on desktop **and** mobile Safari
- [ ] Refreshing a deep link (e.g. `/orders`) loads the page, not a 404
- [ ] Test payment succeeds, stock drops, cart empties, order shows in Orders
- [ ] Failed test payment leaves the cart unchanged
- [ ] `.env` files are not in the Git history (`git log --all -- '*.env'`)
- [ ] Live Razorpay keys are set only after test mode passes

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Browser console shows a CORS error | `CLIENT_URL` doesn't match the page origin | Copy the exact origin from the address bar into `CLIENT_URL` |
| Login succeeds but the next page sends you back to login | Cookie not stored: `NODE_ENV` isn't `production`, or the browser blocks third-party cookies | Set `NODE_ENV=production`; use custom domains (section 7) |
| "Unable to start payment" at checkout | Missing or wrong Razorpay keys | Check `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in Render; look for `Razorpay order creation failed` in logs |
| "Invalid payment signature" | Key secret doesn't match the key ID (e.g. test ID with live secret) | Use a matching pair from the same mode |
| First request takes ~40 seconds | Render free instance was asleep | Expected; use an uptime ping or a paid instance |
| 404 when refreshing a page on Vercel | Root directory isn't `frontend`, so `vercel.json` is ignored | Set Root Directory to `frontend` and redeploy |
