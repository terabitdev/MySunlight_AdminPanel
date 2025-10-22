// Admin configuration with predefined credentials
export const ADMIN_CONFIG = {
  email: 'admin@mysunlight.com',
  password: 'MySunlight@2024',
  displayName: 'System Administrator',
  type: 'Admin'
} as const;

// Validate admin credentials
export const validateAdminCredentials = (email: string, password: string): boolean => {
  return email === ADMIN_CONFIG.email && password === ADMIN_CONFIG.password;
};

// Get admin user data for Firestore
export const getAdminUserData = () => ({
  email: ADMIN_CONFIG.email,
  displayName: ADMIN_CONFIG.displayName,
  type: ADMIN_CONFIG.type,
  createdAt: new Date(),
  lastLogin: new Date(),
  isActive: true
});