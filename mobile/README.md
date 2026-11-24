# DineFlow Pro — Mobile App (Expo & React Native)

Cross-platform mobile application (iOS & Android) for DineFlow restaurant hosts, managers, and staff built with **Expo SDK 51, TypeScript, NativeWind, TanStack Query, and STOMP WebSocket**.

---

## 📱 Features & Screens
1. **Login:** Role-based authentication using JWT stored in `expo-secure-store`.
2. **Dashboard:** Live floor metrics (occupancy, wait time, active queue, table counts) and audit logs.
3. **Tables:** Visual interactive floor plan with zone filtering (`Indoor`, `Outdoor`, `Bar`, `VIP`) and quick-status switcher modal (`Free`, `Occupied`, `Reserved`, `Cleaning`).
4. **Waitlist:** Live queue management, party size tracking, Add Guest form, SMS/WhatsApp table notifications, seating assignment modal, and cancellation.
5. **Analytics (Manager only):** Daily & shift revenue, turn time duration, and waiter performance metrics.
6. **Settings:** Profile viewer, role verification, and secure logout.

---

## 🚀 Running with Expo Go

### 1. Install Dependencies
```bash
cd mobile
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
* If testing on **iOS Simulator**: `http://localhost:5000/api`
* If testing on **Android Emulator**: `http://10.0.2.2:5000/api`
* If testing on a **Physical Device**: use your computer's local Wi-Fi IP (e.g. `http://192.168.1.50:5000/api`)

### 3. Start Development Server
```bash
npx expo start
```
* Press `i` to open in iOS Simulator.
* Press `a` to open in Android Emulator.
* Scan the QR code with Expo Go on your mobile phone.

---

## 📦 Building Standalone APK / AAB with EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build Android APK for direct testing
eas build --platform android --profile preview

# Build for Google Play (AAB) & Apple App Store (IPA)
eas build --platform all --profile production
```
