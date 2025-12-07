# Test Capacitor Setup

## ✅ Your Capacitor is Configured to Use Live Server

Your app is configured to load from your deployed Firebase URL:
`https://studio--studio-7712678722-d9e3d.us-central1.hosted.app`

This means:
- ✅ No need to build static files
- ✅ App always shows latest deployed version
- ✅ Updates automatically when you deploy

## Steps to Build & Test Android App

### 1. Ensure Firebase App is Deployed
Make sure your web app is live and working at the URL above.

### 2. Sync Capacitor
```bash
npx cap sync android
```

### 3. Open in Android Studio
```bash
npx cap open android
```

### 4. Run on Emulator/Device
In Android Studio:
- Click the green "Run" button (▶️)
- Select an emulator or connected device
- App will launch and load your deployed web app

### 5. Build APK
In Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- Find APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

## Verify It Works

1. **Check Android Studio opens**: `npx cap open android`
2. **Check Gradle sync completes** (wait 2-3 minutes first time)
3. **Run on emulator** to test
4. **Build APK** for distribution

## Troubleshooting

**If Android Studio doesn't open:**
- Install Android Studio: https://developer.android.com/studio
- Install Java JDK 17+

**If Gradle sync fails:**
- Wait for it to complete (can take 5-10 minutes first time)
- Check internet connection

**If app shows blank screen:**
- Check your Firebase deployment is live
- Check the URL in `capacitor.config.ts` is correct

## Current Configuration

- **App ID**: com.nalanda.goldfinance
- **App Name**: Gold Finance
- **Server URL**: https://studio--studio-7712678722-d9e3d.us-central1.hosted.app
- **Platform**: Android (ready)
