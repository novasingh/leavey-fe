// Helper utility to test different user roles and permissions
// This can be used for testing purposes to simulate different user types

const ROLE_PERMISSIONS = {
  employee: ['dashboard', 'my-leaves', 'calendar', 'faq'],
  manager: ['dashboard', 'leaves-approval', 'leaves-history', 'calendar', 'faq'],
  hr: ['dashboard', 'department', 'role', 'leave-setting', 'employees', 'leaves-approval', 'leaves-history'],
  admin: ['dashboard', 'department', 'role', 'leave-setting', 'employees', 'leaves-approval', 'leaves-history', 'my-leaves', 'calendar', 'faq']
};

export const createMockUser = (role) => {
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.employee;
  
  return {
    id: 1,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    email: `${role}@company.com`,
    role_details: {
      role_name: role,
      permissions: permissions
    }
  };
};

export const setMockUserInStorage = (role) => {
  const mockUser = createMockUser(role);
  localStorage.setItem('user', JSON.stringify(mockUser));
  localStorage.setItem('access_token', 'mock_access_token');
  localStorage.setItem('refresh_token', 'mock_refresh_token');
  
  console.log(`Mock ${role} user set in localStorage:`, mockUser);
  return mockUser;
};

export const clearMockUser = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  console.log('Mock user cleared from localStorage');
};

// Example usage:
// setMockUserInStorage('employee'); // Will show: dashboard, my-leaves, calendar, faq
// setMockUserInStorage('manager');  // Will show: dashboard, leaves-approval, leaves-history, calendar, faq
// setMockUserInStorage('hr');       // Will show: dashboard, department, role, leave-setting, employees, leaves-approval, leaves-history
// setMockUserInStorage('admin');    // Will show all menu items
