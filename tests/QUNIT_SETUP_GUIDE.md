# QUnit Testing Setup Guide

## Overview
This project uses **QUnit** for testing instead of Jest. QUnit is simpler, lighter, and better suited for React Native web testing.

## Why QUnit?
- ✅ Simpler configuration than Jest
- ✅ Browser-based testing (works great with React Native Web)
- ✅ No complex mocking frameworks needed
- ✅ Lightweight and fast
- ✅ Better debugging in browser DevTools
- ✅ No transform/babel configuration required

## Installation

### 1. Install QUnit Dependencies
```bash
npm install --save-dev qunit esbuild http-server
```

### 2. Remove Old Jest Files (Already Done)
The following files have been removed:
- `__tests__/logout.test.tsx`
- `__tests__/LOGOUT_TESTS_DOCUMENTATION.md`
- `jest.config.js`
- `jest.setup.js`

### 3. Remove Jest Dependencies
```bash
npm uninstall jest jest-expo @testing-library/react-native @testing-library/jest-native react-test-renderer @types/jest
```

## Project Structure

```
tests/
├── logout.test.ts           # QUnit test file (24 tests)
├── test-runner.html         # HTML test runner
├── tsconfig.json            # TypeScript config for tests
└── qunit.config.js          # QUnit configuration
```

## Running Tests

### Option 1: Quick Start (All-in-One)
```bash
npm run test:qunit
```

This will:
1. Build the test bundle
2. Start the test server
3. Open your browser to the test runner

### Option 2: Step-by-Step

#### Build the test bundle:
```bash
npm run test:build
```

#### Start the test server:
```bash
npm run test:serve
```

#### Open in browser:
```
http://localhost:8080/tests/test-runner.html
```

### Option 3: Watch Mode (Development)
```bash
npm run test:watch
```

This will automatically rebuild tests when files change.

## NPM Scripts

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "npm run test:qunit",
    "test:build": "esbuild tests/logout.test.ts --bundle --outfile=tests/logout.test.bundle.js --platform=browser --format=iife --external:react-native --external:expo-router",
    "test:serve": "http-server . -p 8080 -o /tests/test-runner.html",
    "test:qunit": "npm run test:build && npm run test:serve",
    "test:watch": "esbuild tests/logout.test.ts --bundle --outfile=tests/logout.test.bundle.js --platform=browser --format=iife --watch"
  }
}
```

## Test File Structure

### `tests/logout.test.ts`

The test file includes **24 comprehensive tests** organized into **6 test suites + 1 integration suite**:

#### Test Suite 1: Profile handleLogout functionality (2 tests)
- ✅ Clear auth state and redirect to /auth/login on logout
- ✅ Handle logout errors gracefully

#### Test Suite 2: useAuth logout() clears all auth data (4 tests)
- ✅ Clear token from storage
- ✅ End session
- ✅ Clear user state
- ✅ Clear all auth data atomically

#### Test Suite 3: Active Games redirects unauthenticated users (3 tests)
- ✅ Redirect to /auth/login when user is not authenticated
- ✅ Not show protected content when redirecting
- ✅ Show protected content when user is authenticated

#### Test Suite 4: Active Games returns null when not authenticated (4 tests)
- ✅ Return null immediately when isAuthenticated is false
- ✅ Transition to null state after logout
- ✅ Prevent loading games when not authenticated
- ✅ Handle logout during active games loading

#### Test Suite 5: AuthGuard allows access to /auth/login (2 tests)
- ✅ NOT redirect from /auth/login when not authenticated
- ✅ Allow unauthenticated users to see login screen

#### Test Suite 6: AuthGuard does NOT redirect during logout transition (4 tests)
- ✅ Complete logout flow without redirect loops
- ✅ Clear state before redirecting
- ✅ Handle rapid logout and navigation
- ✅ Prevent re-authentication checks during logout

#### Integration Suite: Full Logout Flow (2 tests)
- ✅ Complete full logout flow: authenticated -> logout -> login screen
- ✅ Prevent access to protected routes after logout

## Key Differences from Jest

### 1. Test Syntax
**Jest:**
```typescript
describe('Test Suite', () => {
  test('should do something', () => {
    expect(value).toBe(expected);
  });
});
```

**QUnit:**
```typescript
QUnit.module('Test Suite', () => {
  QUnit.test('should do something', (assert) => {
    assert.strictEqual(value, expected);
  });
});
```

### 2. Assertions
| Jest | QUnit |
|------|-------|
| `expect(x).toBe(y)` | `assert.strictEqual(x, y)` |
| `expect(x).toEqual(y)` | `assert.deepEqual(x, y)` |
| `expect(x).toBeTruthy()` | `assert.ok(x)` |
| `expect(x).toBeFalsy()` | `assert.notOk(x)` |
| `expect(x).toBeNull()` | `assert.strictEqual(x, null)` |

### 3. Hooks
**Jest:**
```typescript
beforeEach(() => {});
afterEach(() => {});
```

**QUnit:**
```typescript
QUnit.module('Suite', (hooks) => {
  hooks.beforeEach(() => {});
  hooks.afterEach(() => {});
});
```

### 4. Mocking
- **Jest**: Uses `jest.fn()`, `jest.mock()`
- **QUnit**: Uses simple stubs and manual mocks (see `tests/logout.test.ts` for examples)

## Mocking Strategy

QUnit tests use **simple stub objects** instead of complex mocking frameworks:

```typescript
// Mock router
const mockRouter = {
  replace: (path: string) => {
    mockRouter.replaceCalls.push(path);
  },
  replaceCalls: [] as string[],
  reset: () => {
    mockRouter.replaceCalls = [];
  },
};

// Mock container
const mockContainer = {
  logoutUseCase: {
    execute: async () => undefined,
    calls: [] as any[],
  },
  reset: () => {
    mockContainer.logoutUseCase.calls = [];
  },
};
```

## Browser Testing

### Advantages
1. **Visual Feedback**: See test results in real-time
2. **DevTools**: Use browser DevTools for debugging
3. **No Configuration**: No complex Jest/Babel setup
4. **Fast**: Quick reload and re-run

### Running in Different Browsers
```bash
# Chrome (default)
npm run test:serve

# Firefox
firefox http://localhost:8080/tests/test-runner.html

# Safari
open -a Safari http://localhost:8080/tests/test-runner.html
```

## Debugging Tests

### 1. Browser DevTools
- Open DevTools (F12)
- Go to Console tab
- Click on test names to expand details
- Use `debugger;` statements in test code

### 2. QUnit UI
- Click on test names to re-run individual tests
- Use "Hide passed tests" checkbox to focus on failures
- Check module names to navigate test suites

### 3. Test Isolation
Each test runs in isolation with:
- Fresh `AsyncStorage`
- Cleared `TokenService`
- Reset `SessionManager`
- Clean mocks

## CI/CD Integration

### GitHub Actions Example
```yaml
name: QUnit Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install
      - run: npm run test:build
      - run: npm run test:ci
```

Add this script to `package.json`:
```json
{
  "scripts": {
    "test:ci": "qunit tests/logout.test.bundle.js"
  }
}
```

## Code Coverage

QUnit can integrate with coverage tools like `c8`:

```bash
npm install --save-dev c8
```

Add to `package.json`:
```json
{
  "scripts": {
    "test:coverage": "c8 qunit tests/logout.test.bundle.js"
  }
}
```

## Common Issues

### Issue 1: Module Not Found
**Error**: `Cannot find module '@/src/...'`

**Solution**: Update `tsconfig.json` paths:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue 2: React Native Modules
**Error**: `Cannot resolve 'react-native'`

**Solution**: Add external flag to esbuild:
```bash
esbuild tests/logout.test.ts --external:react-native
```

### Issue 3: Async Tests Not Completing
**Problem**: Test hangs or times out

**Solution**: Ensure all async operations use `await`:
```typescript
QUnit.test('async test', async (assert) => {
  await someAsyncOperation();
  assert.ok(true);
});
```

## Best Practices

### 1. Test Isolation
Always reset state in `beforeEach`:
```typescript
hooks.beforeEach(async () => {
  await AsyncStorage.clear();
  await TokenService.clearToken();
  mockRouter.reset();
});
```

### 2. Descriptive Test Names
Use clear, descriptive names:
```typescript
// ✅ Good
QUnit.test('should clear token from storage after logout', ...);

// ❌ Bad
QUnit.test('test logout', ...);
```

### 3. Single Responsibility
Each test should verify one behavior:
```typescript
// ✅ Good
QUnit.test('should clear token', async (assert) => {
  await logout();
  assert.strictEqual(await TokenService.getToken(), null);
});

// ❌ Bad - testing multiple things
QUnit.test('should logout', async (assert) => {
  await logout();
  assert.strictEqual(await TokenService.getToken(), null);
  assert.notOk(authState.isAuthenticated);
  assert.strictEqual(authState.user, null);
  // Too many assertions
});
```

### 4. Clear Assertions
Use specific assertion methods:
```typescript
// ✅ Good
assert.strictEqual(value, null);
assert.deepEqual(obj1, obj2);

// ❌ Bad
assert.ok(value === null);
assert.ok(JSON.stringify(obj1) === JSON.stringify(obj2));
```

## Resources

- [QUnit Official Documentation](https://qunitjs.com/)
- [QUnit API Reference](https://api.qunitjs.com/)
- [QUnit Cookbook](https://qunitjs.com/cookbook/)
- [Esbuild Documentation](https://esbuild.github.io/)

## Migration from Jest

If you need to migrate other Jest tests to QUnit:

1. **Replace test syntax**:
   - `describe()` → `QUnit.module()`
   - `test()` → `QUnit.test()`
   - `beforeEach()` → `hooks.beforeEach()`

2. **Replace assertions**:
   - `expect().toBe()` → `assert.strictEqual()`
   - `expect().toEqual()` → `assert.deepEqual()`
   - `expect().toBeTruthy()` → `assert.ok()`

3. **Replace mocks**:
   - `jest.fn()` → Simple stub functions
   - `jest.mock()` → Manual mock objects

4. **Update imports**:
   - Add `import QUnit from 'qunit'`
   - Remove Jest-specific imports

## Support

For questions or issues:
1. Check the [QUnit documentation](https://qunitjs.com/)
2. Review test examples in `tests/logout.test.ts`
3. Open an issue on the project repository

---

**Ready to test!** 🚀

Run `npm run test:qunit` to see your tests in action.
