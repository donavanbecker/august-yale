# August-Yale Library

August-Yale is a TypeScript Node.js library for interacting with August smart locks. It provides API methods for locking, unlocking, getting status, and subscribing to events from August smart locks connected via WiFi.

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Prerequisites

- Requires Node.js version 20 or 22 (as specified in package.json engines)
- Uses ES modules (package.json has "type": "module")
- All builds and tests are extremely fast (under 5 seconds each)

### Bootstrap, Build, and Test

Run these commands to get started:

```bash
# Install dependencies
npm install
# Takes ~40 seconds, includes some deprecation warnings that are safe to ignore

# Build the project (TypeScript compilation)
npm run build
# Takes ~3 seconds - NEVER CANCEL (but it's very fast anyway)

# Run all tests
npm test
# Takes ~1.4 seconds - NEVER CANCEL (but it's very fast anyway)
# Runs 13 tests across 12 test files, all should pass

# Run linting
npm run lint
# Takes ~2 seconds - NEVER CANCEL (but it's very fast anyway)

# Generate documentation
npm run docs
# Takes ~2 seconds - NEVER CANCEL (but it's very fast anyway)
```

### Development Workflow Commands

```bash
# Clean build artifacts
npm run clean

# Auto-fix linting issues
npm run lint:fix

# Run tests with coverage report
npm run test-coverage
# Takes ~2 seconds, shows detailed coverage information

# Run tests in watch mode (for development)
npm run test:watch
# Press 'q' to quit watch mode

# Validate documentation without generating files
npm run docs:lint

# Build with watch mode (development)
npm run watch
# Builds, links globally, and watches for changes with nodemon
```

## Validation

### Always Run Before Committing

ALWAYS run these validation steps before pushing changes:

```bash
# Full validation sequence
npm run lint && npm run build && npm test && npm run docs:lint
# All commands complete in under 10 seconds total
```

### Functional Testing Scenarios

After making changes, validate the module works by testing:

1. **Module Loading Test**:

   ```bash
   node -e "const August = require('./dist/index.js'); console.log('✓ Module loads:', typeof August.default);"
   ```

2. **Instance Creation Test**:

   ```bash
   node -e "
   const August = require('./dist/index.js').default;
   const august = new August({
     installId: 'test-install',
     augustId: 'test@example.com',
     password: 'test-pass',
     countryCode: 'US'
   });
   console.log('✓ Instance created successfully');
   "
   ```

3. **API Methods Available Test**: Verify all expected methods exist on both static class and instance.

### CI Pipeline Requirements

The GitHub Actions CI runs:

- Node.js build and test workflow (from homebridge shared workflow)
- ESLint workflow
  Ensure all validation steps pass locally before pushing.

## Project Structure

### Key Directories and Files

```
src/                     # Source TypeScript files
├── index.ts            # Main August class and exports
├── types.ts            # TypeScript type definitions
├── settings.ts         # Configuration settings
├── methods/            # Individual API method implementations
│   ├── authorize.ts    # Authorization workflow
│   ├── validate.ts     # Validation of auth codes
│   ├── locks.ts        # Retrieve locks list
│   ├── details.ts      # Lock detailed information
│   ├── status.ts       # Lock status information
│   ├── lock-unlock.ts  # Lock/unlock operations
│   └── subscribe.ts    # Event subscription
└── util/               # Utility functions
    ├── setup.ts        # Configuration validation
    └── session.ts      # Session management

dist/                   # Built JavaScript files (generated)
docs/                   # Generated TypeDoc documentation
.github/workflows/      # CI/CD pipeline definitions
```

### Important Files to Check After Changes

- Always review `src/index.ts` when modifying API surface
- Check `src/types.ts` when adding new interfaces or types
- Verify `src/util/setup.ts` when changing configuration handling
- Update tests in corresponding `.test.ts` files for any method changes

### Configuration Files

- `package.json` - Dependencies, scripts, Node.js version requirements
- `tsconfig.json` - TypeScript compiler configuration
- `eslint.config.js` - Linting rules (uses @antfu/eslint-config)
- `typedoc.json` - Documentation generation settings

## Common Development Tasks

### Adding New API Methods

1. Create method file in `src/methods/[method-name].ts`
2. Add corresponding test file `src/methods/[method-name].test.ts`
3. Import and expose method in `src/index.ts`
4. Add to both static class methods and instance methods
5. Update type definitions in `src/types.ts` if needed
6. Run full validation sequence

### Working with August API Integration

- This library interacts with unpublished August APIs
- API keys are hardcoded but may break if August changes them
- Configuration supports both US and non-US API endpoints
- The library handles JWT token management automatically
- Real API calls require valid August credentials (not needed for development/testing)

### Debugging and Troubleshooting

- Build failures: Check TypeScript errors with `npm run build`
- Test failures: Run `npm test` for detailed output
- Linting issues: Run `npm run lint:fix` to auto-fix most problems
- Module loading issues: Test with both CommonJS and ES module imports
- The library uses `tiny-json-http` for HTTP requests and `pubnub` for event subscriptions

### Performance Expectations

All standard operations are extremely fast:

- Fresh `npm install`: ~40 seconds
- `npm run build`: ~3 seconds
- `npm test`: ~1.4 seconds
- `npm run lint`: ~2 seconds
- `npm run docs`: ~2 seconds
- Full validation sequence: ~10 seconds total

NEVER CANCEL these commands - they complete very quickly, but set timeouts of 60+ seconds for safety.

## Library Usage Context

This is a utility library, not a runnable application. It provides:

- August class for creating authenticated connections
- Methods for lock operations (lock, unlock, status, details)
- Event subscription capabilities for real-time lock updates
- Support for both US and international August/Yale API endpoints
- Comprehensive TypeScript type definitions

The library is designed to be used by other applications (like Homebridge plugins) that need to integrate with August smart locks.
