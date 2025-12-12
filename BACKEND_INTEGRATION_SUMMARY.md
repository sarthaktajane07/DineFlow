# Backend Integration Summary

## ✅ Integration Completed
The frontend has been successfully migrated from Supabase to the custom Node.js/Express backend.

### Key Changes:
1.  **Proxied API Requests**:
    - Configured `vite.config.ts` to proxy `/api` requests to `http://localhost:5001`.
    - Changed backend port to **5001** to avoid conflict with macOS Control Center (AirPlay).

2.  **API Client**:
    - Created `src/lib/api.ts` configured with Axios and JWT token handling.

3.  **Authentication Migration**:
    - Updated `src/hooks/useAuth.tsx` to use the backend's `/api/auth` endpoints.
    - `SignIn` and `SignUp` now communicate with the MongoDB database via the backend.

4.  **Data Layer Migration**:
    - Rewrote `src/hooks/useRestaurantData.tsx` to fetch data from `/api/tables` and `/api/waitlist`.
    - Implemented Real-time updates using **Socket.IO** (replacing Supabase Realtime).
    - Mapped backend Mongoose models to frontend React interfaces.

### 🚀 How to Run
1.  **Start Backend**:
    ```bash
    cd backend
    npm run dev
    ```
    (Runs on port 5001)

2.  **Start Frontend**:
    ```bash
    npm run dev
    ```
    (Runs on port 3001)

### ⚠️ Notes
- Ensure MongoDB is running locally.
- The `supabase` client code is still present in `src/integrations` but is no longer used by the main application logic.
