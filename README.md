# TaxFlow - Professional ITR Processing Platform

TaxFlow is a professional client onboarding and ITR processing platform designed for taxpayers and tax professionals. It features a secure dashboard, real-time filing tracking, and AI-powered query assistance.

## 🚀 Deployment Guide (Vercel)

If you have forked this repository and want to deploy it to Vercel, follow these steps:

### 1. Firebase Setup
This application requires a Firebase project for authentication and database services.

1.  Go to the [Firebase Console](https://console.firebase.google.com/).
2.  Create a new project (e.g., `taxflow-app`).
3.  **Authentication**: 
    - Go to **Build > Authentication**.
    - Click **Get Started**.
    - Enable the **Google** sign-in provider.
4.  **Firestore Database**:
    - Go to **Build > Firestore Database**.
    - Click **Create database**.
    - Choose a location and start in **Production Mode**.
5.  **Project Settings**:
    - Click the gear icon next to "Project Overview" and select **Project settings**.
    - Under "Your apps", click the `</>` icon to add a Web App.
    - Register the app and copy the `firebaseConfig` object.

### 2. Deploy to Vercel
1.  Push your code to a GitHub repository.
2.  Log in to [Vercel](https://vercel.com/) and click **Add New > Project**.
3.  Import your repository.
4.  In the **Environment Variables** section, add the following keys using the values from your Firebase config:

| Variable | Value |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Your `apiKey` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your `authDomain` |
| `VITE_FIREBASE_PROJECT_ID` | Your `projectId` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your `storageBucket` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your `messagingSenderId` |
| `VITE_FIREBASE_APP_ID` | Your `appId` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Your `measurementId` |
| `GEMINI_API_KEY` | Your Google AI Studio API Key |

5.  Click **Deploy**.

### 3. Security Rules
To protect your data, you must deploy the Firestore security rules:
1.  Install Firebase CLI: `npm install -g firebase-tools`
2.  Login: `firebase login`
3.  Deploy rules: `firebase deploy --only firestore:rules` (Ensure you are in the project root where `firestore.rules` is located).

## 🛠 Local Development

1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Create a `.env` file based on `.env.example` and fill in your credentials.
4.  Start the dev server: `npm run dev`

## 📄 License
This project is licensed under the Apache-2.0 License.
