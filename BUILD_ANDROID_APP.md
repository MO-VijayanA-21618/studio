# Build Android App

## Prerequisites
- Install Android Studio: https://developer.android.com/studio
- Install Java JDK 17 or higher

## Steps to Build APK

### 1. Build Next.js App
```bash
npm run build
```

### 2. Sync Capacitor
```bash
npx cap sync android
```

### 3. Open in Android Studio
```bash
npx cap open android
```

### 4. Build APK in Android Studio
1. Wait for Gradle sync to complete
2. Go to: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
3. Wait for build to complete
4. Click "locate" in the notification to find APK

### 5. APK Location
```
android/app/build/outputs/apk/debug/app-debug.apk
```

## For Release APK (Production)
1. In Android Studio: **Build → Generate Signed Bundle / APK**
2. Select **APK**
3. Create or use existing keystore
4. Choose **release** build variant
5. APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

## Install APK on Device
1. Enable "Install from Unknown Sources" on Android device
2. Transfer APK file to device
3. Open APK file to install

## Note
The app loads your deployed web app URL. Make sure your Firebase deployment is live.
