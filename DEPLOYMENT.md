# MMDrive Deployment Guide (Production & Stores)

This guide provides instructions for deploying the **MMDrive Super App & Admin Management Portal** to live web hosting and packaging it for the **Google Play Store** and **Apple App Store**.

---

## 🏗️ Architecture Summary

MMDrive is architected as an interconnected ecosystem:
1. **Unified Mobile App (Play Store & App Store):**
   - Single sign-in with role switching:
     - 👤 **Passenger / Customer:** Rides fare negotiation, Cargo delivery, Food ordering, Marketplace.
     - 🚕 **Driver / Transporter:** Radar feed, quick inDrive counter offers (`+5`, `+10`, `+15` ZMW), live turn-by-turn navigation, 4-digit safety PIN verification, earnings ledger.
     - 🏪 **Business Owner / Seller & Food Partner:** Product listings, live kitchen order management, courier dispatches.
2. **Admin Operations Website (Desktop Web Portal):**
   - RTSA PSV Driver compliance verification & White Book vehicle registration inspections.
   - Business KYC approvals.
   - Dynamic platform take-rate slider (5% – 25%).
   - Dispute resolution mediation & ZRA-compliant tax transaction ledgers.

---

## 🚀 Option 1: Instant 1-Click Web Deployment (Recommended)

### Method A: Deploy with Vercel (Easiest & Fastest)
1. Push this repository to GitHub, GitLab, or Bitbucket.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Vercel automatically detects the Vite framework settings from [`vercel.json`](./vercel.json):
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Click **"Deploy"**. Your live production URL (e.g. `https://mmdrive-zambia.vercel.app`) will be active in ~45 seconds with worldwide CDN acceleration.

### Method B: Deploy with Netlify
1. Go to [netlify.com](https://netlify.com) and click **"Add new site"** -> **"Import an existing project"**.
2. Select your repository.
3. Netlify will automatically detect configuration from [`netlify.toml`](./netlify.toml):
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
4. Click **"Deploy Site"**.

### Method C: Deploy with Firebase Hosting
1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase init hosting
   ```
   - Select `dist` as your public directory.
   - Configure as a single-page app: `Yes`.
3. Deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

---

## 📱 Option 2: Deploying to Google Play Store & Apple App Store

To package this web codebase into native iOS and Android binaries for the App Store and Google Play:

### Using Capacitor (Recommended Hybrid Native Runtime)
1. Install Capacitor in this project:
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios
   npx cap init MMDrive com.mmdrive.zambia --web-dir=dist
   ```
2. Build the production web bundle:
   ```bash
   npm run build
   ```
3. Add the native Android and iOS platforms:
   ```bash
   npx cap add android
   npx cap add ios
   ```
4. Sync web assets:
   ```bash
   npx cap sync
   ```
5. Open in Android Studio / Xcode:
   - **For Google Play (Android):**
     ```bash
     npx cap open android
     ```
     In Android Studio, select **Build > Generate Signed Bundle / APK**, choose **Android App Bundle (.aab)**, sign with your release keystore, and upload to the [Google Play Console](https://play.google.com/console).
   - **For Apple App Store (iOS):**
     ```bash
     npx cap open ios
     ```
     In Xcode, select your Team under **Signing & Capabilities**, select **Product > Archive**, and submit via TestFlight / Transporter to [App Store Connect](https://appstoreconnect.apple.com).

---

## 🧪 Local Production Verification

To test the production build locally before uploading:

```bash
# 1. Run strict TypeScript check and production bundle build
npm run build

# 2. Preview the compiled production build locally
npm run preview
```
Visit the local preview URL displayed in your terminal (usually `http://localhost:4173`).
