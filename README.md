# Leavey Frontend

A modern React application using Vite, React Bootstrap, Redux Toolkit, and custom theming with Montserrat font and a custom color palette.

## Project Structure

```
src/
  assets/
    images/         # Project images and illustrations
    style/          # SCSS/CSS files, variables, mixins, utilities
    utility/        # JS utility functions
  components/       # Reusable React components (Header, Sidebar, Card, Table, StatusBadge, etc.)
  hooks/            # Custom React hooks
  layouts/          # Layout components (BlankLayout, MainLayout)
  pages/
    auth/           # Auth pages (Login, ForgotPassword, UserVerification, etc.)
    dashboard/      # Dashboard page
    calendar/       # Calendar page
    my-leaves/      # My Leaves page
    team/           # Team page
    leave-requests/ # Leave Requests page
    reports/        # Reports page
    documents/      # Documents page
    settings/       # Settings page
    faq/            # FAQ page
    profile/        # Profile page
    notifications/  # Notifications page
    status/         # Status pages (NotFound, etc.)
  services/         # API/axios setup
  store/            # Redux store, reducers, actions
  utility/          # Additional utility functions
  App.jsx           # Main App component
  main.jsx          # Entry point
  routes.jsx        # App routes
```

## Packages Used

- **react**: UI library
- **react-dom**: DOM bindings for React
- **react-router-dom**: Routing
- **react-bootstrap**: Bootstrap components for React
- **bootstrap**: Bootstrap CSS framework
- **@reduxjs/toolkit**: Redux state management
- **react-redux**: React bindings for Redux
- **axios**: HTTP client for API requests
- **react-hook-form**: Form state management
- **yup**: Form validation
- **@fontsource/montserrat**: Montserrat font
- **react-icons**: Icon library for React
- **vite**: Fast build tool and dev server

## Setup Instructions

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Environment variables:**
   - Edit `.env` and set your API base URL:
     ```env
     VITE_API_BASE_URL=https://api.example.com
     ```

3. **Run the development server:**
   ```sh
   npm run dev
   ```
   The app will be available at `http://localhost:5173` (or as shown in your terminal).

4. **Build for production:**
   ```sh
   npm run build
   ```

## Theming & Customization

- All global styles and theme variables are in `src/assets/style/` as SCSS.
- Montserrat font and your custom color palette are applied globally.
- You can add images to `src/assets/images/` and more SCSS utilities or variables in the style folder.

## Auth & API

- Login uses axios to call `/auth/login` (set your backend URL in `.env`).
- On successful login, a token is stored in `localStorage` and the user is redirected to the dashboard.
- On failure, an error message is shown.

## Folder Conventions

- **components/**: Reusable UI components (Header, Sidebar, Card, Table, StatusBadge, etc.)
- **layouts/**: Layout wrappers (e.g., with/without sidebar)
- **pages/**: Page-level components, grouped by feature (dashboard, calendar, my-leaves, team, leave-requests, reports, documents, settings, faq, profile, notifications, status)
- **store/**: Redux logic (actions, reducers, store setup)
- **services/**: API/axios logic
- **assets/**: Images, styles, fonts, and utilities

## Routing & Layouts

- **Protected routes** (dashboard, calendar, my-leaves, team, leave-requests, reports, documents, settings, faq, profile, notifications) are wrapped with `MainLayout` and require authentication (see `routes.jsx`).
- **Auth routes** (login, forgot password, etc.) use `BlankLayout` or no layout.
- **NotFound** page is shown for any undefined route.

---

For any questions or contributions, please refer to the code comments or open an issue.
