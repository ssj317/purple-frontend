# Purple M — Frontend

React SPA built with **Vite**, **Tailwind CSS**, and **React Router**.

## Tech Stack

- React 18 + Vite
- Tailwind CSS 3
- React Router v6
- Axios (with JWT interceptors)
- React Hot Toast

## Getting Started

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:5000`

### Install & Run

```bash
npm install
npm run dev
```

App starts on `http://localhost:3000`

### Environment Variables

Create a `.env` file in the root:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```



---

## Features

### Authentication
- JWT stored in `localStorage`
- Auto token refresh on 401 via Axios interceptor
- Redirect to `/login` on session expiry

### Role-Based UI
- Admin sees: full user table, create/edit/deactivate/reactivate buttons
- Manager sees: user table, edit non-admin users (no role change)
- User sees: own profile only

### User Table
- Search by name or email (debounced)
- Filter by role and status
- Paginated with prev/next controls
- Staggered row entrance animations
- Inactive users visually dimmed
- Toggle activate/deactivate inline

### Forms
- Create user modal (admin only)
- Edit user modal (admin + manager)
- Profile update form (name + password)

---

## Project Structure

```
src/
├── api/            # Axios instance + auth/users API calls
├── components/     # Navbar, Modal, Badge, Spinner, ProtectedRoute
├── context/        # AuthContext (login, logout, user state)
├── hooks/          # useAuth
└── pages/          # Login, Dashboard, Profile, UserList, UserDetails
```

---

## Auth Flow

1. User logs in → access token + refresh token stored in `localStorage`
2. Axios attaches `Authorization: Bearer <token>` to every request
3. On 401, interceptor calls `/auth/refresh` and retries the original request
4. On refresh failure, clears storage and redirects to `/login`
