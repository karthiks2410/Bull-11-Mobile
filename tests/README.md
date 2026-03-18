# Bull-11 QUnit Tests

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

This will install:
- `qunit` - Testing framework
- `esbuild` - Fast bundler
- `http-server` - Local test server

### 2. Run Tests
```bash
npm test
```

This will:
1. Build the test bundle (`tests/logout.test.bundle.js`)
2. Start a local server on port 8080
3. Open your browser to `http://localhost:8080/tests/test-runner.html`

### 3. View Results
The test runner will display:
- ✅ **24 tests** across **7 test modules**
- Real-time pass/fail status
- Detailed error messages for failures
- Total runtime

## Available Commands

| Command | Description |
|---------|-------------|
| `npm test` | Build tests and open in browser |
| `npm run test:build` | Build test bundle only |
| `npm run test:serve` | Start test server only |
| `npm run test:watch` | Auto-rebuild on file changes |

## Test Coverage

### 24 Tests Covering:
1. **Profile Logout** (2 tests) - Logout button functionality
2. **Auth State Clearing** (4 tests) - Token, session, and user state cleanup
3. **Route Protection** (3 tests) - AuthGuard redirect behavior
4. **Loading Prevention** (4 tests) - Prevent API calls when logged out
5. **Login Access** (2 tests) - Allow unauthenticated access to login
6. **Redirect Loops** (4 tests) - **Critical bug fix validation**
7. **Full Integration** (2 tests) - End-to-end logout flow

## Test Files

```
tests/
├── logout.test.ts              # 24 QUnit tests (main test file)
├── logout.test.bundle.js       # Generated bundle (git-ignored)
├── test-runner.html            # Browser test runner
├── qunit.config.js             # QUnit configuration
├── tsconfig.json               # TypeScript config for tests
├── QUNIT_SETUP_GUIDE.md        # Detailed setup instructions
└── README.md                   # This file
```

## What Changed from Jest?

### Before (Jest)
```bash
npm test                        # Run Jest tests
```

Files:
- `__tests__/logout.test.tsx`
- `jest.config.js`
- `jest.setup.js`

### After (QUnit)
```bash
npm test                        # Run QUnit tests in browser
```

Files:
- `tests/logout.test.ts`
- `tests/test-runner.html`
- `tests/qunit.config.js`

## Why QUnit?

✅ **Simpler** - No complex Jest/Babel configuration
✅ **Faster** - Lightweight framework with quick startup
✅ **Visual** - Browser-based testing with real-time feedback
✅ **Debuggable** - Use browser DevTools for debugging
✅ **No Mocking Frameworks** - Simple stub objects instead

## Browser Compatibility

Tested on:
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Development Workflow

### 1. Make Changes
Edit `tests/logout.test.ts` or source files

### 2. Rebuild Tests
```bash
npm run test:build
```

### 3. Refresh Browser
The test runner will automatically re-run tests

### 4. Or Use Watch Mode
```bash
npm run test:watch
```

Auto-rebuilds on file changes (manual browser refresh still needed)

## Debugging Tests

### Method 1: Browser DevTools
1. Open test runner: `http://localhost:8080/tests/test-runner.html`
2. Open DevTools (F12)
3. Go to Console tab
4. Add `debugger;` statements in test code
5. Refresh page

### Method 2: QUnit UI
1. Click test name to re-run individual test
2. Use "Hide passed tests" to focus on failures
3. Expand failed tests to see assertion details

### Method 3: Console Logging
Add `console.log()` statements in tests:
```typescript
QUnit.test('my test', async (assert) => {
  console.log('State before:', authState);
  await authState.logout();
  console.log('State after:', authState);
  assert.ok(true);
});
```

## Common Issues

### Issue: Test bundle not found
**Error**: `Failed to load resource: tests/logout.test.bundle.js`

**Solution**: Run `npm run test:build` first

### Issue: Module resolution errors
**Error**: `Cannot find module '@/src/...'`

**Solution**: Check `tests/tsconfig.json` paths configuration

### Issue: Tests hang or timeout
**Problem**: Async tests not completing

**Solution**: Ensure all async operations use `await`:
```typescript
QUnit.test('async test', async (assert) => {
  await someAsyncOperation(); // Don't forget await!
  assert.ok(true);
});
```

### Issue: Port already in use
**Error**: `EADDRINUSE: address already in use :::8080`

**Solution**: Kill existing server:
```bash
lsof -ti:8080 | xargs kill -9
```

Or use different port:
```bash
http-server . -p 9090 -o /tests/test-runner.html
```

## CI/CD Integration

### GitHub Actions
Add `.github/workflows/test.yml`:
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
      - run: npx qunit tests/logout.test.bundle.js
```

## Contributing

When adding new tests:

1. Follow existing test structure
2. Use descriptive test names
3. Keep tests isolated (independent)
4. Clean up state in `hooks.beforeEach()`
5. Use specific assertion methods
6. Add comments for complex scenarios

Example:
```typescript
QUnit.module('My Feature', (hooks) => {
  hooks.beforeEach(async () => {
    // Setup: Clean slate for each test
    await AsyncStorage.clear();
    mockRouter.reset();
  });

  QUnit.test('should do something specific', async (assert) => {
    // Arrange
    const initialState = { value: 0 };

    // Act
    const result = await myFunction(initialState);

    // Assert
    assert.strictEqual(result.value, 1, 'Value should increment by 1');
  });
});
```

## Resources

- [QUnit Documentation](https://qunitjs.com/)
- [QUnit API Reference](https://api.qunitjs.com/)
- [Esbuild Documentation](https://esbuild.github.io/)
- [Bull-11 QUNIT_SETUP_GUIDE.md](./QUNIT_SETUP_GUIDE.md)

## Support

Having issues? Check:
1. This README
2. [QUNIT_SETUP_GUIDE.md](./QUNIT_SETUP_GUIDE.md)
3. [QUnit Documentation](https://qunitjs.com/)
4. Project issues on GitHub

---

**Happy Testing!** 🚀

Run `npm test` to see your tests in action.
