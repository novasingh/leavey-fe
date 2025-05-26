# Role-Based Sidebar Implementation

## Overview
The application now supports role-based sidebar navigation where different menu items are shown based on the user's role and permissions stored in localStorage.

## How It Works

### 1. User Data Structure
When a user logs in, the user data is stored in localStorage with the following structure:
```json
{
  "id": 1,
  "name": "User Name",
  "email": "user@company.com",
  "role_details": {
    "role_name": "employee|manager|hr|admin",
    "permissions": ["dashboard", "my-leaves", "calendar", "faq"]
  }
}
```

### 2. Role Permissions Mapping
- **Employee**: `['dashboard', 'my-leaves', 'calendar', 'faq']`
- **Manager**: `['dashboard', 'leaves-approval', 'leaves-history', 'calendar', 'faq']`
- **HR**: `['dashboard', 'department', 'role', 'leave-setting', 'employees', 'leaves-approval', 'leaves-history']`
- **Admin**: All permissions (can see all menu items)

### 3. AuthService Methods
New methods added to `authService.js`:
- `getUserPermissions()` - Returns array of user permissions
- `hasPermission(permission)` - Check if user has specific permission
- `getUserRole()` - Returns user's role name

### 4. Sidebar Component Updates
The `Sidebar.jsx` component now:
- Fetches user permissions from localStorage
- Filters menu items based on permissions
- Shows only authorized menu items for each role

## Files Modified/Created

### Core Files:
- `src/services/authService.js` - Added permission methods
- `src/components/Sidebar/Sidebar.jsx` - Implemented role-based filtering
- `src/pages/auth/Login.jsx` - Added redirect for authenticated users
- `src/pages/auth/ForgotPassword.jsx` - Added redirect for authenticated users
- `src/routes.jsx` - Updated with new pages and proper protection

### New Pages Created:
- `src/pages/leaves-approval/LeavesApproval.jsx`
- `src/pages/leaves-history/LeavesHistory.jsx`
- `src/pages/department/Department.jsx`
- `src/pages/role/Role.jsx`
- `src/pages/leave-setting/LeaveSetting.jsx`
- `src/pages/employees/Employees.jsx`

### Translation Files Updated:
- `src/locales/en.json` - Added new menu item translations
- `src/locales/ms.json` - Added Malay translations
- `src/locales/zh.json` - Added Chinese translations

### Test Utilities:
- `src/utility/roleTestHelper.js` - Helper functions for testing
- `src/components/RoleTestComponent.jsx` - UI component for testing roles

## Authentication Flow

1. **Login**: User credentials sent to `/api/auth/login/`
2. **Token Storage**: Access token, refresh token, and user data stored in localStorage
3. **Route Protection**: `ProtectedRoute` component checks authentication status
4. **Sidebar Filtering**: Sidebar shows only permitted menu items
5. **Logout**: Clears localStorage and redirects to login

## Next Steps

1. **Remove Test Component**: Remove `RoleTestComponent` from Dashboard in production
2. **API Integration**: Ensure your backend sends the correct user data structure
3. **Permission Validation**: Add server-side permission validation for routes
4. **Error Handling**: Add proper error handling for invalid permissions
5. **Loading States**: Add loading indicators during permission checks

## Troubleshooting

### Sidebar not updating after role change:
- Refresh the page or navigate to a different route
- Check localStorage for correct user data structure

### No menu items showing:
- Verify user has permissions array in role_details
- Check that permission names match exactly

### Authentication issues:
- Clear localStorage completely
- Check that access_token exists in localStorage
- Verify API endpoint is correct in axios.js
