/**
 * AdminGuard Component
 * Specialized guard for admin-only routes
 * Extends AuthGuard with requireAdmin=true
 */

import React from 'react';
import { AuthGuard } from './AuthGuard';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      {children}
    </AuthGuard>
  );
};
