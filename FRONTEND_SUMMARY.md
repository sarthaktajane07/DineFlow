# Frontend Project Summary

## 🎨 Overview
DineFlow Frontend is a modern, responsive React application built with **Vite** and styled using **Tailwind CSS**. It serves as the user interface for the Restaurant Management System, offering specialized dashboards for hosts, managers, and detailed table/waitlist management.

## 🛠 Tech Stack
-   **Framework**: [React](https://react.dev/) (v18) with [Vite](https://vitejs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Animations**: Tailwind Animate & Custom Keyframes (Fade-in, Slide-in, Pulse-glow)
-   **State Management**: React Hooks (Context API, Custom Hooks)
-   **Routing**: [React Router](https://reactrouter.com/) (v6)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **HTTP Client**: [Axios](https://axios-http.com/)
-   **Real-time**: [Socket.IO Client](https://socket.io/)

## 🏗 Project Structure

```
src/
├── components/         # Reusable UI components (Buttons, Cards, Dialogs)
│   ├── ui/             # Shadcn/Base UI components
│   └── ...             # Feature-specific components
├── hooks/              # Custom React Hooks
│   ├── useAuth.tsx     # Authentication logic (Login/Signup)
│   └── ...
├── lib/                # Utilities and libraries
│   └── api.ts          # Axios instance & API configuration
├── pages/              # Application Routes/Screens
│   ├── Index.jsx       # Landing Page
│   ├── Login.jsx       # Auth Page
│   ├── Dashboard.jsx   # Main Dashboard
│   └── ...
└── App.jsx             # Main Application Component & Routing
```

## 🔑 Key Features
1.  **Authentication**:
    -   Integrated with custom Backend API (`/api/auth`).
    -   JWT token storage in localStorage.
    -   Protected routes for Host/Manager dashboards.

2.  **Dashboard**:
    -   **Host View**: Real-time table status (Free/Occupied/Cleaning), Waitlist management.
    -   **Manager View**: Analytics, Staff performance, Historical data.

3.  **Real-time Updates**:
    -   Connects via `socket.io-client` to receive instant updates on:
        -   Table status changes.
        -   New waitlist entries.
        -   Reservations.

4.  **Design System**:
    -   **Theme**: Dark mode prioritized with "Amber" and "Gold" accents.
    -   **Font**: *DM Sans* (Body) and *Playfair Display* (Headings).
    -   **Components**: Modular, reusable components based on Radix UI primitives.

## 🚀 How to Run

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Start Development Server**:
    ```bash
    npm run dev
    ```
    -   The app will run at `http://localhost:3001`.
    -   API requests are proxied to the backend at `http://localhost:5001`.

3.  **Build for Production**:
    ```bash
    npm run build
    ```

## 🌐 API Integration
-   **Base URL**: `/api` (Proxied to backend)
-   **Auth Header**: `Authorization: Bearer <token>` automatically attached via interceptors in `src/lib/api.ts`.

## 🧹 Cleanup Note
-   Supabase integration has been **removed**. The `src/integrations/supabase` folder and related dependencies have been deleted to streamline the project.
