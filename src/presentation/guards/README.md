# Authentication Guards Documentation

## Overview

The Bull-11 app uses authentication guards (Higher-Order Components) to protect routes from unauthorized access. These guards prevent users from accessing protected content without proper authentication and admin privileges.

## Available Guards

### 1. AuthGuard

**Location**: `/Users/I757930/Documents/Projects/bull-11-app/src/presentation/guards/AuthGuard.tsx`

**Purpose**: Protects routes that require authentication.

**Features**:
- Checks if user is authenticated before rendering children
- Shows loading spinner during authentication check
- Redirects to login page if not authenticated
- Updates session activity on navigation
- Prevents flash of protected content
- Supports both auth-only and admin-required modes

**Props**:
```typescript
interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;      // Default: true
  requireAdmin?: boolean;      // Default: false
}
```

**Usage**:
```tsx
import { AuthGuard } from '@/src/presentation/guards';

export default function ProtectedLayout() {
  return (
    <AuthGuard>
      {/* Protected content */}
    </AuthGuard>
  );
}
```

**With Admin Requirement**:
```tsx
<AuthGuard requireAdmin={true}>
  {/* Admin-only content */}
</AuthGuard>
```

### 2. AdminGuard

**Location**: `/Users/I757930/Documents/Projects/bull-11-app/src/presentation/guards/AdminGuard.tsx`

**Purpose**: Specialized guard for admin-only routes. Shorthand for `<AuthGuard requireAdmin={true}>`.

**Features**:
- All AuthGuard features
- Automatically requires both authentication AND admin role
- Redirects non-admin users to home page

**Usage**:
```tsx
import { AdminGuard } from '@/src/presentation/guards';

export default function AdminLayout() {
  return (
    <AdminGuard>
      {/* Admin-only content */}
    </AdminGuard>
  );
}
```

## Implementation Details

### Guard Behavior

1. **Initial Load**:
   - Shows loading spinner
   - Checks authentication status via `useAuth` hook
   - Verifies token validity
   - Fetches current user data

2. **Not Authenticated**:
   - Continues showing loading spinner
   - Redirects to `/auth/login`
   - No flash of protected content

3. **Authenticated but Not Admin** (AdminGuard only):
   - Continues showing loading spinner
   - Redirects to `/(tabs)/` (home page)
   - No flash of protected content

4. **Authenticated (and Admin if required)**:
   - Renders children
   - Updates session activity
   - Monitors navigation for session timeout

### Session Management Integration

Guards automatically integrate with the session management system:

- **Activity Tracking**: Updates `SessionManager` on every navigation
- **Timeout Detection**: Triggers logout after 30 minutes of inactivity
- **App State Monitoring**: Pauses/resumes session timer based on app state
- **Role Verification**: Re-verifies admin role on app resume

### Security Features

1. **Privilege Escalation Detection**:
   - Re-verifies admin role when app returns to foreground
   - Logs out user if role has been tampered with
   - Audit logs all privilege escalation attempts

2. **No Content Flash**:
   - Shows loading spinner until auth check completes
   - Redirects happen before children render
   - Prevents unauthorized users from seeing protected UI

3. **Automatic Redirects**:
   - Non-authenticated users → Login page
   - Non-admin users → Home page
   - Expired sessions → Login page with timeout message

## Protected Routes

### User Routes (AuthGuard)

**File**: `/Users/I757930/Documents/Projects/bull-11-app/app/(tabs)/_layout.tsx`

Protected screens:
- Active Games (`/`)
- New Game (`/new-game`)
- History (`/history`)
- Profile (`/profile`)
- Admin Tab (conditional, only shown to admins)

### Admin Routes (AdminGuard)

**File**: `/Users/I757930/Documents/Projects/bull-11-app/app/(admin)/_layout.tsx`

Protected screens:
- Admin Dashboard (`/(admin)/dashboard`)
- User Management (`/(admin)/users`)
- User Details (`/(admin)/users/[id]`)
- Kite Integration (`/(admin)/kite-setup`)

### Public Routes (No Guard)

**File**: `/Users/I757930/Documents/Projects/bull-11-app/app/auth/_layout.tsx`

Unprotected screens:
- Login (`/auth/login`)

## Testing the Guards

### Test Cases

1. **Unauthenticated Access**:
   ```
   - Start app without authentication
   - Should redirect to /auth/login
   - Should show loading spinner during check
   - Should not flash protected content
   ```

2. **Authenticated Access**:
   ```
   - Login as regular user
   - Should access /(tabs)/ routes
   - Should NOT see Admin tab
   - Should NOT access /(admin)/ routes
   ```

3. **Admin Access**:
   ```
   - Login as admin user
   - Should access all /(tabs)/ routes
   - Should see Admin tab
   - Should access /(admin)/ routes
   ```

4. **Privilege Escalation Attempt**:
   ```
   - Login as regular user
   - Try to manually navigate to /(admin)/ routes
   - Should redirect to /(tabs)/
   - Should not see admin content
   ```

5. **Session Timeout**:
   ```
   - Login and wait 30 minutes of inactivity
   - Should auto-logout
   - Should redirect to /auth/login
   - Should show "Session expired" message
   ```

### Manual Testing

1. **Test unauthenticated access**:
   ```bash
   # Clear app storage
   # Restart app
   # Verify redirect to login
   ```

2. **Test authenticated access**:
   ```bash
   # Login as regular user
   # Try to access admin routes
   # Verify redirect to home
   ```

3. **Test admin access**:
   ```bash
   # Login as admin
   # Access admin routes
   # Verify access granted
   ```

## Console Logs

Guards log their behavior for debugging:

```
[AuthGuard] Rendering: {
  isAuthenticated: true,
  isAdmin: false,
  loading: false,
  segments: ['(tabs)', 'index'],
  requireAuth: true,
  requireAdmin: false
}

[AuthGuard] Auth check passed, rendering children
```

Logs help debug:
- Authentication state
- Admin status
- Current route segments
- Guard requirements
- Redirect decisions

## Integration with useAuth Hook

Guards use the `useAuth` hook from `/Users/I757930/Documents/Projects/bull-11-app/src/presentation/hooks/useAuth.ts`:

```tsx
const {
  isAuthenticated,  // true if user is logged in
  isAdmin,          // true if user has ADMIN role
  loading,          // true during initial auth check
  updateActivity,   // updates session activity timestamp
} = useAuth();
```

## Best Practices

1. **Always use guards on layouts, not individual screens**:
   ```tsx
   // ✅ Good - protects entire section
   export default function TabLayout() {
     return (
       <AuthGuard>
         <Tabs>{/* screens */}</Tabs>
       </AuthGuard>
     );
   }

   // ❌ Bad - guards on each screen (redundant)
   export default function HomeScreen() {
     return <AuthGuard>{/* content */}</AuthGuard>;
   }
   ```

2. **Use AdminGuard for admin sections**:
   ```tsx
   // ✅ Good - clear intent
   <AdminGuard>{/* admin content */}</AdminGuard>

   // ❌ Less clear
   <AuthGuard requireAdmin={true}>{/* admin content */}</AuthGuard>
   ```

3. **Don't nest guards**:
   ```tsx
   // ❌ Bad - redundant nesting
   <AuthGuard>
     <AdminGuard>{/* content */}</AdminGuard>
   </AuthGuard>

   // ✅ Good - single guard
   <AdminGuard>{/* content */}</AdminGuard>
   ```

4. **Trust the guards - don't duplicate checks**:
   ```tsx
   // ❌ Bad - redundant check
   export default function ProfileScreen() {
     const { isAuthenticated } = useAuth();
     if (!isAuthenticated) return <Redirect href="/auth/login" />;
     return <View>{/* content */}</View>;
   }

   // ✅ Good - let guard handle it
   export default function ProfileLayout() {
     return (
       <AuthGuard>
         <Stack>{/* screens */}</Stack>
       </AuthGuard>
     );
   }
   ```

## File Structure

```
/Users/I757930/Documents/Projects/bull-11-app/
├── src/
│   └── presentation/
│       └── guards/
│           ├── index.ts           # Exports all guards
│           ├── AuthGuard.tsx      # Base authentication guard
│           └── AdminGuard.tsx     # Admin-only guard
└── app/
    ├── (tabs)/
    │   └── _layout.tsx            # Protected with AuthGuard
    ├── (admin)/
    │   └── _layout.tsx            # Protected with AdminGuard
    └── auth/
        └── _layout.tsx            # No guard (public)
```

## Troubleshooting

### Issue: "Infinite redirect loop"
**Cause**: Guard is applied to auth layout
**Solution**: Remove guard from `/app/auth/_layout.tsx`

### Issue: "Flash of protected content before redirect"
**Cause**: Guard not wrapping layout properly
**Solution**: Ensure guard wraps the entire navigator, not just screens

### Issue: "Admin can't access admin routes"
**Cause**: Token or role not saved properly
**Solution**: Check TokenService and ensure user.role === 'ADMIN'

### Issue: "Session expires too quickly"
**Cause**: SessionManager timeout too short
**Solution**: Adjust timeout in SessionManager (currently 30 minutes)

## Related Files

- **useAuth Hook**: `/Users/I757930/Documents/Projects/bull-11-app/src/presentation/hooks/useAuth.ts`
- **TokenService**: `/Users/I757930/Documents/Projects/bull-11-app/src/core/security/TokenService.ts`
- **SessionManager**: `/Users/I757930/Documents/Projects/bull-11-app/src/core/security/SessionManager.ts`
- **RoleValidator**: `/Users/I757930/Documents/Projects/bull-11-app/src/core/security/RoleValidator.ts`
- **User Entity**: `/Users/I757930/Documents/Projects/bull-11-app/src/domain/entities/User.ts`

## Summary

Auth guards provide a clean, declarative way to protect routes in the Bull-11 app. They handle:
- Authentication checks
- Admin privilege verification
- Session management
- Automatic redirects
- Security logging
- No content flash

By wrapping layouts (not individual screens), guards provide app-wide protection with minimal code duplication.
