# QUnit Installation & Setup Instructions

## Quick Install (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

This installs:
- `qunit@2.20.0` - Testing framework
- `esbuild@0.20.0` - Fast bundler
- `http-server@14.1.1` - Test server

### 2. Run Tests
```bash
npm test
```

This will:
1. Build test bundle: `tests/logout.test.bundle.js`
2. Start server on `http://localhost:8080`
3. Open browser to test runner

### 3. View Results
Browser opens automatically showing:
- ✅ 24 tests across 7 modules
- Real-time pass/fail status
- Detailed error messages
- Total runtime

---

## Detailed Installation

### Step 1: Clean Install (Recommended)

If you had Jest installed before:

```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Fresh install
npm install
```

### Step 2: Verify Installation

```bash
# Check QUnit is installed
npm list qunit
# Should show: qunit@2.20.0

# Check esbuild is installed
npm list esbuild
# Should show: esbuild@0.20.0

# Check http-server is installed
npm list http-server
# Should show: http-server@14.1.1
```

### Step 3: Build Tests

```bash
npm run test:build
```

You should see:
```
✓ tests/logout.test.bundle.js  [X] kb
Done in [X]ms
```

### Step 4: Run Test Server

```bash
npm run test:serve
```

Browser should open to:
```
http://localhost:8080/tests/test-runner.html
```

---

## Verification

### Check Files Exist

```bash
ls -la tests/
```

Should show:
```
✓ logout.test.ts              # Source test file
✓ logout.test.bundle.js       # Generated bundle
✓ test-runner.html            # Browser test runner
✓ qunit.config.js             # QUnit config
✓ tsconfig.json               # TypeScript config
✓ README.md                   # Quick start
✓ QUNIT_SETUP_GUIDE.md        # Detailed guide
✓ MIGRATION_SUMMARY.md        # Migration docs
✓ .gitignore                  # Git ignore rules
```

### Check Old Files Removed

```bash
ls -la __tests__/ 2>&1
ls -la jest.config.js 2>&1
ls -la jest.setup.js 2>&1
```

Should show:
```
✓ No such file or directory (all removed)
```

### Check package.json

```bash
cat package.json | grep -A5 '"test"'
```

Should show:
```json
"test": "npm run test:qunit",
"test:build": "esbuild tests/logout.test.ts...",
"test:serve": "http-server . -p 8080...",
"test:qunit": "npm run test:build && ...",
"test:watch": "esbuild ... --watch"
```

---

## Troubleshooting

### Issue 1: Port Already in Use

**Error:**
```
EADDRINUSE: address already in use :::8080
```

**Solution:**
```bash
# Kill process using port 8080
lsof -ti:8080 | xargs kill -9

# Or use different port
http-server . -p 9090 -o /tests/test-runner.html
```

### Issue 2: Bundle Not Found

**Error:**
```
Failed to load resource: tests/logout.test.bundle.js
```

**Solution:**
```bash
# Build the bundle first
npm run test:build

# Then refresh browser
```

### Issue 3: Module Resolution Errors

**Error:**
```
Cannot find module '@/src/...'
```

**Solution:**
Check `tests/tsconfig.json`:
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

### Issue 4: Dependencies Not Installing

**Error:**
```
npm ERR! peer dependency issues
```

**Solution:**
```bash
# Force clean install
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## Running Tests

### Option 1: Full Test Run
```bash
npm test
```
Builds bundle + starts server + opens browser

### Option 2: Development Mode
```bash
# Terminal 1: Watch mode (auto-rebuild)
npm run test:watch

# Terminal 2: Test server
npm run test:serve
```
Edit tests → auto-rebuild → refresh browser

### Option 3: CI/CD Mode
```bash
# Build tests
npm run test:build

# Run tests (Node.js CLI)
npx qunit tests/logout.test.bundle.js
```

---

## IDE Setup

### VS Code

Install extensions:
- **ESLint** - Code linting
- **TypeScript** - Language support
- **QUnit Snippets** - Test snippets

Add to `.vscode/settings.json`:
```json
{
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.associations": {
    "*.test.ts": "typescript"
  }
}
```

### WebStorm

1. Open `tests/` folder
2. Right-click `test-runner.html`
3. Select "Open in Browser"
4. Tests run automatically

---

## Next Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run tests**
   ```bash
   npm test
   ```

3. **Explore documentation**
   - `tests/README.md` - Quick reference
   - `tests/QUNIT_SETUP_GUIDE.md` - Detailed guide
   - `tests/MIGRATION_SUMMARY.md` - Migration notes

4. **Start testing!**
   - All 24 tests should pass
   - Tests validate logout flow
   - No Jest configuration needed

---

## Commands Reference

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm test` | Build + serve + open browser |
| `npm run test:build` | Build test bundle only |
| `npm run test:serve` | Start test server only |
| `npm run test:watch` | Auto-rebuild on changes |

---

## Support

Need help?

1. Check `tests/README.md`
2. Check `tests/QUNIT_SETUP_GUIDE.md`
3. Check [QUnit Docs](https://qunitjs.com/)
4. Open GitHub issue

---

**Ready to go!** Run `npm install && npm test` to start testing. 🚀
