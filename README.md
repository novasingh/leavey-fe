# Leavey Frontend

A comprehensive React-based employee leave management system with advanced role-based access control, multi-language support, and modern UI components. Built with Vite, React Bootstrap, Redux Toolkit, and custom SCSS theming.

## ✨ Key Features

- **🔐 Role-Based Access Control**: Dynamic sidebar navigation and permissions based on user roles (Employee, Manager, HR, Admin)
- **🌍 Internationalization (i18n)**: Complete support for English, Malay, and Chinese languages with persistent language selection
- **🔑 JWT Authentication**: Secure login system with automatic token refresh and session management
- **📱 Responsive Design**: Mobile-first responsive UI using React Bootstrap components
- **🎨 Modern UI Components**: Reusable components (Card, Table, StatusBadge) with custom SCSS styling
- **🛡️ Route Protection**: Comprehensive route guards redirecting unauthorized users
- **📊 Dashboard Analytics**: Interactive dashboard with stats, charts, and team overview
- **🔄 API Integration**: Complete HTTP client setup with interceptors for authentication
- **⚡ Fast Development**: Lightning-fast development with Vite and hot module replacement
- **🧪 Testing Utilities**: Built-in role testing helpers for development and debugging

## 📁 Project Structure

```
src/
  assets/
    images/         # Project images and illustrations
    style/          # SCSS/CSS files, variables, mixins, utilities
  components/       # Reusable React components
    Header/         # Application header with user menu & notifications
    Sidebar/        # Role-based navigation sidebar
    Card/           # Reusable card component
    Table/          # Data table component
    StatusBadge/    # Status display component
    ProtectedRoute/ # Route protection component
  hooks/            # Custom React hooks
  layouts/          # Layout components (BlankLayout, MainLayout)
  pages/
    auth/           # Authentication pages
      Login.jsx           # Login with language switcher
      ForgotPassword.jsx  # Password recovery
      UserVerification.jsx
      Password-Reset.jsx
    dashboard/      # Main dashboard with stats and overview
    calendar/       # Calendar view
    my-leaves/      # Employee leave management
    leaves-approval/# Manager leave approval (Manager role)
    leaves-history/ # Leave history view (Manager role)
    department/     # Department management (HR/Admin role)
    role/           # Role & permission management (HR/Admin role)
    leave-setting/  # Leave policy settings (HR/Admin role)
    employees/      # Employee management (HR/Admin role)
    team/           # Team overview
    leave-requests/ # Leave request management
    reports/        # Reports and analytics
    documents/      # Document management
    settings/       # Application settings
    faq/            # Frequently asked questions
    profile/        # User profile management
    notifications/  # Notification center
    status/         # Status pages (NotFound, etc.)
  services/         # API and authentication services
    axios.js        # HTTP client with interceptors
    authService.js  # Authentication & user management
  store/            # Redux store setup
  locales/          # Translation files
    en.json         # English translations
    ms.json         # Malay translations
    zh.json         # Chinese translations
  utility/          # Utility functions
    roleTestHelper.js # Role testing utilities
  i18n.js           # Internationalization configuration
  routes.jsx        # Application routing with protection
```

## 📦 Packages Used

### Core Dependencies
- **react** (v19.1.0) & **react-dom**: Latest React UI library with modern features
- **react-router-dom** (v7.6.0): Advanced client-side routing with protection and guards
- **react-bootstrap** (v2.10.10) & **bootstrap** (v5.3.6): Bootstrap components and responsive grid system
- **@reduxjs/toolkit** (v2.8.2) & **react-redux** (v9.2.0): Modern Redux state management
- **axios** (v1.9.0): HTTP client with request/response interceptors and auto-retry
- **react-hook-form** (v7.56.4) & **yup** (v1.6.1): Advanced form handling with validation schemas
- **react-i18next** (v15.5.2) & **i18next** (v25.2.0): Complete internationalization framework
- **i18next-browser-languagedetector** (v8.1.0): Automatic language detection from browser
- **@fontsource/montserrat** (v5.2.5): Modern Montserrat font family
- **react-icons** (v5.5.0): Comprehensive icon library with 10,000+ icons
- **vite** (v6.3.5): Next-generation fast build tool and development server

### Development Dependencies
- **eslint** (v9.25.0): Modern JavaScript/React linting with latest rules
- **sass-embedded** (v1.89.0): Dart Sass implementation for SCSS preprocessing
- **@vitejs/plugin-react** (v4.4.1): Vite plugin for React with Fast Refresh support
- Various ESLint plugins for React hooks and development best practices

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher recommended)
- **npm** or **yarn** package manager

### Installation & Development

1. **Clone the repository:**
   ```sh
   git clone <repository-url>
   cd leavey-fe
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   VITE_APP_NAME=Leavey
   VITE_APP_VERSION=1.0.0
   ```

4. **Start development server:**
   ```sh
   npm run dev
   ```
   🚀 Application available at `http://localhost:5173`

5. **Build for production:**
   ```sh
   npm run build
   ```

6. **Preview production build:**
   ```sh
   npm run preview
   ```

7. **Code quality check:**
   ```sh
   npm run lint
   ```

### Backend API Requirements
- Ensure backend API is running on `http://localhost:8000`
- Login endpoint: `POST /api/auth/login/`
- Expected user response format with role and permissions

## 🔐 Authentication & Authorization

### JWT Authentication Flow
- **🔑 Login Endpoint**: `POST /api/auth/login/` with email/password
- **💾 Token Management**: Access and refresh tokens stored securely in localStorage
- **🔄 Auto Refresh**: Automatic token refresh on API calls using axios interceptors
- **🛡️ Route Protection**: Unauthenticated users automatically redirected to login page
- **🚪 Logout**: Complete session cleanup clearing all tokens and user data
- **⚠️ Session Handling**: Expired sessions handled gracefully with automatic redirects

### Expected User Data Structure
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@company.com",
    "avatar": "/path/to/avatar.jpg",
    "role_details": {
      "role_name": "employee|manager|hr|admin",
      "permissions": ["dashboard", "my-leaves", "calendar", "faq"]
    }
  }
}
```

### Role-Based Permission System
- **👤 Employee**: 
  - Dashboard overview and personal stats
  - My Leaves (apply, view, edit own leaves)
  - Calendar view of team leaves
  - FAQ and help documentation

- **👔 Manager**: 
  - All Employee permissions
  - Leaves Approval (approve/reject team leaves)
  - Leaves History (view team leave history)
  - Team management features

- **🏢 HR**: 
  - All Manager permissions
  - Department Management (create, edit departments)
  - Role Management (manage user roles and permissions)
  - Leave Settings (configure leave policies)
  - Employee Management (add, edit, deactivate employees)

- **⚡ Admin**: 
  - Complete system access
  - All HR permissions
  - System configuration
  - Advanced reporting and analytics

### Authentication Service Features
```javascript
// Login with API integration
await authService.login(email, password)

// Check user permissions
authService.hasPermission('leaves-approval')

// Get current user role
authService.getUserRole() // 'employee' | 'manager' | 'hr' | 'admin'

// Logout and cleanup
authService.logout()
```

## 🌍 Internationalization (i18n)

### Supported Languages
- **🇺🇸 English (en)**: Default application language
- **🇲🇾 Malay/Bahasa Malaysia (ms)**: Complete Malaysian language support
- **🇨🇳 Chinese Simplified (zh)**: Full Chinese language support

### Language Features
- **🔄 Dynamic Switching**: Language switcher in header and login page
- **💾 Persistent Storage**: Language preference saved in localStorage
- **🌐 Complete Coverage**: All UI text, messages, and labels are translatable
- **🔍 Browser Detection**: Automatic language detection from browser settings
- **📝 Translation Files**: Organized JSON files in `src/locales/`

### Translation Structure
```javascript
// Example translation keys
{
  "common": {
    "login": "Login",
    "logout": "Logout",
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "sidebar": {
    "dashboard": "Dashboard",
    "myLeaves": "My Leaves",
    "calendar": "Calendar"
  },
  "auth": {
    "loginTitle": "Welcome Back",
    "emailPlaceholder": "Enter your email",
    "passwordPlaceholder": "Enter your password"
  }
}
```

### Adding New Languages
1. **Create translation file**: Add new JSON file in `src/locales/` (e.g., `fr.json` for French)
2. **Configure i18n**: Import and add language in `src/i18n.js`
3. **Update language switcher**: Add option to Header and Login components
4. **Test translations**: Verify all keys are translated properly

### Translation Best Practices
- Use nested keys for better organization
- Keep translation keys descriptive and consistent
- Include context for translators when needed
- Test UI layout with longer text (German, Russian)

## 🏗️ Architecture & Development

### Component Architecture
- **🧩 Reusable Components**: Modular UI components in `components/` with SCSS styling
- **📄 Layout System**: `MainLayout` (with sidebar) and `BlankLayout` (auth pages)
- **📱 Page Components**: Feature-based organization in `pages/` directory
- **🔧 Custom Hooks**: Reusable React hooks in `hooks/` directory
- **🎨 SCSS Styling**: Organized stylesheets with variables, mixins, and utilities

### State Management
- **🏪 Redux Toolkit**: Modern Redux with simplified boilerplate
- **🔄 API Integration**: Centralized axios service with interceptors
- **💾 Local Storage**: Persistent authentication and user preferences
- **⚡ React Context**: i18n context for language management

### Code Organization Principles
- **📁 Feature-based Structure**: Related files grouped by functionality
- **🔄 Barrel Exports**: Clean imports using `index.js` files
- **📚 Component Libraries**: Reusable components with consistent props
- **🎯 Single Responsibility**: Each component has a clear, focused purpose

## 🛣️ Routing & Navigation

### Route Protection System
```javascript
// Protected routes wrapped with authentication
<Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

// Public routes for authentication
<Route path="/login" element={<Login />} />
```

### Layout Configuration
- **🏠 MainLayout**: Dashboard and app pages with sidebar and header
- **📋 BlankLayout**: Clean layout for authentication flows
- **🔐 ProtectedRoute**: HOC component handling authentication checks
- **🚫 NotFound**: 404 page for undefined routes

### Navigation Flow
1. **Unauthenticated**: Redirected to `/login`
2. **Authenticated**: Access to role-based pages
3. **Invalid Routes**: Fallback to NotFound component
4. **Role Restrictions**: Sidebar items filtered by permissions

## 🧪 Development & Testing

### Development Workflow
```powershell
# Start development server
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

### Role Testing Utilities
```javascript
// Test different user roles
import { setTestUserRole } from '@/utility/roleTestHelper';

// Switch to different roles during development
setTestUserRole('admin');    // Full access
setTestUserRole('manager');  // Management features
setTestUserRole('employee'); // Basic access
```

### Code Quality Standards
- **📏 ESLint**: Modern JavaScript/React linting rules
- **🎨 Prettier**: Consistent code formatting (configure as needed)
- **📝 JSDoc**: Document complex functions and components
- **🔍 TypeScript**: Consider migration for better type safety

## 🚀 Production Deployment

### Build Optimization
- **⚡ Vite**: Lightning-fast builds with tree-shaking
- **📦 Code Splitting**: Automatic route-based code splitting
- **🗜️ Asset Optimization**: Minification and compression
- **🖼️ Image Optimization**: WebP and modern format support

### Environment Configuration
```env
# Production environment variables
VITE_API_BASE_URL=https://api.yourcompany.com/api
VITE_APP_NAME=Leavey
VITE_APP_VERSION=1.0.0
VITE_ENVIRONMENT=production
```

### Deployment Checklist
- [ ] Update API endpoints for production
- [ ] Configure CORS settings on backend
- [ ] Set up SSL certificates
- [ ] Configure proper caching headers
- [ ] Test all role-based permissions
- [ ] Verify i18n translations
- [ ] Test responsive design on all devices

## 📚 API Integration

### HTTP Client Configuration
```javascript
// Axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for authentication
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshToken();
      return apiClient.request(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Authentication Endpoints
- **POST** `/api/auth/login/` - User login with email/password
- **POST** `/api/auth/refresh/` - Refresh access token
- **POST** `/api/auth/logout/` - User logout
- **POST** `/api/auth/forgot-password/` - Request password reset
- **POST** `/api/auth/reset-password/` - Reset password with token

### Expected API Response Format
```javascript
// Successful login response
{
  "success": true,
  "data": {
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@company.com",
      "role_details": {
        "role_name": "manager",
        "permissions": ["dashboard", "leaves-approval", "leaves-history"]
      }
    }
  }
}

// Error response format
{
  "success": false,
  "message": "Invalid credentials",
  "errors": {
    "email": ["This field is required"],
    "password": ["Password is too short"]
  }
}
```

## 🎨 UI Components & Styling

### Component Library
- **📄 Card**: Flexible container with header, body, and footer
- **📊 Table**: Data table with sorting, filtering, and pagination
- **🏷️ StatusBadge**: Status indicators with color coding
- **🚪 Header**: Application header with user menu and notifications
- **📋 Sidebar**: Role-based navigation with collapsible menu

### SCSS Architecture
```scss
// Variables (_variables.scss)
$primary-color: #007bff;
$secondary-color: #6c757d;
$font-family: 'Montserrat', sans-serif;

// Mixins (_mixins.scss)
@mixin button-style($bg-color, $text-color) {
  background-color: $bg-color;
  color: $text-color;
  border: none;
  border-radius: 4px;
}

// Utilities (utility.scss)
.text-center { text-align: center; }
.mb-3 { margin-bottom: 1rem; }
.p-4 { padding: 1.5rem; }
```

### Responsive Design Breakpoints
- **📱 Mobile**: < 768px (sm)
- **📲 Tablet**: 768px - 992px (md)
- **💻 Desktop**: 992px - 1200px (lg)
- **🖥️ Large Desktop**: > 1200px (xl)

## 🔧 Configuration Files

### Vite Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/assets/style/variables";`
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
```

### ESLint Configuration
```javascript
// eslint.config.js
export default [
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      'react/jsx-no-target-blank': 'off',
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];
```

## 🚨 Troubleshooting

### Common Issues & Solutions

**🔴 Authentication Issues**
```javascript
// Clear corrupted tokens
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
localStorage.removeItem('user');
window.location.reload();
```

**🔴 CORS Errors**
- Ensure backend CORS settings allow frontend origin
- Check API endpoint URLs in environment variables
- Verify authentication headers are properly set

**🔴 Build Errors**
```powershell
# Clear node_modules and reinstall
Remove-Item node_modules -Recurse -Force
Remove-Item package-lock.json -Force
npm install
```

**🔴 Role Permission Issues**
```javascript
// Debug user permissions
console.log('User Role:', authService.getUserRole());
console.log('User Permissions:', authService.getUserPermissions());
console.log('Has Permission:', authService.hasPermission('dashboard'));
```

### Performance Optimization Tips
- Use React.memo for expensive components
- Implement lazy loading for large pages
- Optimize images and use WebP format
- Enable gzip compression on server
- Use React DevTools for performance profiling

---

## 📖 Additional Resources

- **React Documentation**: [reactjs.org](https://reactjs.org/)
- **Vite Guide**: [vitejs.dev](https://vitejs.dev/)
- **React Bootstrap**: [react-bootstrap.github.io](https://react-bootstrap.github.io/)
- **Redux Toolkit**: [redux-toolkit.js.org](https://redux-toolkit.js.org/)
- **React i18next**: [react.i18next.com](https://react.i18next.com/)

## 🤝 Contributing

1. **🍴 Fork the repository**
2. **🌟 Create feature branch**: `git checkout -b feature/amazing-feature`
3. **💫 Commit changes**: `git commit -m 'Add amazing feature'`
4. **🚀 Push to branch**: `git push origin feature/amazing-feature`
5. **📝 Open Pull Request**

### Code Style Guidelines
- Follow ESLint rules and fix all warnings
- Use meaningful component and variable names
- Add JSDoc comments for complex functions
- Keep components small and focused
- Write descriptive commit messages

For questions, suggestions, or bug reports, please open an issue on the repository.
