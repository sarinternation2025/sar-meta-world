# Path Aliases Configuration

This project has been configured with path aliases to simplify imports and make the codebase more maintainable.

## Configured Aliases

- `@` → `src/`
- `@components` → `src/components/`
- `@utils` → `src/utils/`

## Usage Examples

Instead of:
```javascript
import Button from '../../components/Button'
import { helper } from '../../../utils/helper'
```

You can now use:
```javascript
import Button from '@components/Button'
import { helper } from '@utils/helper'
```

## Configuration Files

### 1. Vite Configuration (`vite.config.js`)
The aliases are configured in the `resolve.alias` section for development and build processes.

### 2. Vitest Configuration (`vitest.config.js`)
The aliases are also configured in the Vitest config to ensure tests can resolve the aliases correctly.

### 3. ESLint Configuration (`eslint.config.js`)
ESLint is configured with `eslint-import-resolver-alias` to understand the path aliases and prevent import errors.

## Testing

The aliases are tested in `src/test/aliases.test.jsx` to ensure they work correctly in the test environment.

## Scripts

- `npm run dev` - Start development server with aliases
- `npm run build` - Build production with aliases
- `npm run test` - Run tests with aliases
- `npm run lint` - Lint code with alias support

## Dependencies Added

- `eslint-import-resolver-alias` - ESLint import resolver for aliases
- `vitest` - Testing framework
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - DOM testing utilities
- `@testing-library/user-event` - User interaction testing
- `jsdom` - DOM environment for testing
- `@tailwindcss/postcss` - PostCSS plugin for Tailwind CSS
