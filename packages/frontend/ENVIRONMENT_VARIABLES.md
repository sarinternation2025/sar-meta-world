# Environment Variables Guide

## Overview

This document provides comprehensive guidelines for using environment variables in the Vite-based React frontend application. Understanding these guidelines is crucial for maintaining security and proper functionality.

## 🔒 Security Model

### Vite Environment Variable Exposure

**Critical Security Rule:** In Vite applications, only environment variables prefixed with `VITE_` are accessible to client-side code.

```javascript
// ✅ ACCESSIBLE - Variables prefixed with VITE_
console.log(import.meta.env.VITE_API_URL);        // Works
console.log(import.meta.env.VITE_APP_NAME);       // Works

// ❌ NOT ACCESSIBLE - Variables without VITE_ prefix
console.log(import.meta.env.DATABASE_URL);        // undefined
console.log(import.meta.env.JWT_SECRET);          // undefined
```

### Why This Matters

- **Client-side exposure**: All `VITE_*` variables are embedded in the build output and publicly accessible
- **Security risk**: Sensitive data in `VITE_*` variables can be extracted from the built application
- **Best practice**: Use `VITE_*` only for non-sensitive configuration that should be public

## 📋 Variable Categories

### ✅ Safe for VITE_ Prefix

These types of variables are safe to use with the `VITE_` prefix:

```bash
# API endpoints (public)
VITE_API_URL=https://api.example.com
VITE_API_VERSION=v1

# Application metadata
VITE_APP_NAME=My Application
VITE_APP_VERSION=1.0.0

# Public service URLs
VITE_SOCKET_URL=wss://socket.example.com
VITE_GRAFANA_URL=https://grafana.example.com

# Feature flags and UI settings
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=info
VITE_THEME=dark

# Public analytics identifiers
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
VITE_SENTRY_DSN=https://public-dsn@sentry.io/project
```

### ❌ NEVER Use VITE_ Prefix

These types of variables should NEVER use the `VITE_` prefix:

```bash
# Database credentials
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Authentication secrets
JWT_SECRET=super-secret-key
SESSION_SECRET=another-secret

# API keys and tokens
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxx
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxx

# Server configuration
REDIS_URL=redis://localhost:6379
SMTP_PASSWORD=email-password

# Encryption keys
PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
ENCRYPTION_KEY=base64-encoded-key
```

## 🏗️ Configuration Architecture

### Centralized Configuration System

The application uses a centralized configuration system in `src/config/index.js`:

```javascript
import { z } from 'zod';

// Schema definition ensures type safety and validation
const envSchema = z.object({
  VITE_API_URL: z.string().url(),
  VITE_API_VERSION: z.string().min(1),
  VITE_APP_NAME: z.string().min(1),
  // ... other variables
});

// Validation occurs at application startup
const env = envSchema.parse(import.meta.env);

// Organized configuration export
export const config = {
  api: {
    url: env.VITE_API_URL,
    version: env.VITE_API_VERSION,
    baseUrl: `${env.VITE_API_URL}/${env.VITE_API_VERSION}`,
  },
  app: {
    name: env.VITE_APP_NAME,
    version: env.VITE_APP_VERSION,
  },
  // ... other sections
};
```

### Benefits of This Architecture

1. **Type Safety**: Zod schema provides runtime type checking
2. **Validation**: Required variables are validated at startup
3. **Organization**: Configuration is logically grouped
4. **Centralization**: Single source of truth for all configuration
5. **Developer Experience**: Clear error messages for missing/invalid variables

## 📝 Development Workflow

### Setting Up Environment Variables

1. **Create `.env` file** in the project root:
   ```bash
   # API Configuration
   VITE_API_URL=http://localhost:3001
   VITE_API_VERSION=v1
   
   # App Configuration
   VITE_APP_NAME=SAR Meta World
   VITE_APP_VERSION=1.0.0
   
   # Development Settings
   VITE_LOG_LEVEL=debug
   VITE_ENABLE_DEVTOOLS=true
   ```

2. **Use configuration in code**:
   ```javascript
   import { config } from '@/config';
   
   // Access configuration values
   const apiUrl = config.api.baseUrl;
   const appName = config.app.name;
   ```

3. **Validate configuration**:
   ```bash
   # Run configuration tests
   npm test -- --run src/config/config.test.js
   
   # Run complete verification
   node verify-config.js
   ```

### Environment-Specific Configuration

Different environments may require different values:

```bash
# Development (.env.development)
VITE_API_URL=http://localhost:3001
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEVTOOLS=true

# Production (.env.production)
VITE_API_URL=https://api.production.com
VITE_LOG_LEVEL=error
VITE_ENABLE_DEVTOOLS=false

# Testing (.env.test)
VITE_API_URL=http://localhost:3001
VITE_LOG_LEVEL=warn
VITE_ENABLE_MOCK_API=true
```

## 🧪 Testing and Validation

### Available Tests

The project includes comprehensive testing for environment variables:

1. **Configuration Tests** (`src/config/config.test.js`):
   - Validates all environment variables
   - Tests configuration object structure
   - Ensures required variables are present

2. **Security Tests** (`src/config/test-env-security.js`):
   - Verifies only `VITE_*` variables are exposed
   - Checks that sensitive variables are not accessible
   - Validates build-time security

3. **Runtime Tests** (`src/config/RuntimeConfigTest.jsx`):
   - Browser-based testing component
   - Verifies configuration in runtime environment
   - Tests feature flag functionality

### Running Tests

```bash
# Run all configuration tests
npm test -- --run src/config/config.test.js

# Run security validation
node src/config/test-env-security.js

# Run complete verification
node verify-config.js

# Build and verify production bundle
npm run build
```

## 🚨 Common Pitfalls

### 1. Accidentally Exposing Sensitive Data

```javascript
// ❌ WRONG - Exposes database URL to client
VITE_DATABASE_URL=postgresql://user:pass@localhost:5432/db

// ✅ CORRECT - Keep sensitive data server-side only
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

### 2. Forgetting VITE_ Prefix

```javascript
// ❌ WRONG - Variable won't be available
API_URL=http://localhost:3001

// ✅ CORRECT - Variable accessible to client
VITE_API_URL=http://localhost:3001
```

### 3. Not Validating Required Variables

```javascript
// ❌ WRONG - No validation, may cause runtime errors
const apiUrl = import.meta.env.VITE_API_URL;

// ✅ CORRECT - Use validated configuration
import { config } from '@/config';
const apiUrl = config.api.url; // Validated at startup
```

## 🔍 Security Checklist

Before deploying or committing changes:

- [ ] All sensitive variables use proper naming (no `VITE_` prefix)
- [ ] All client-accessible variables use `VITE_` prefix
- [ ] No secrets, passwords, or private keys in `VITE_*` variables
- [ ] All required variables are defined in the schema
- [ ] Configuration tests pass
- [ ] Build output doesn't expose sensitive information
- [ ] Environment files are properly gitignored

## 📚 Additional Resources

- [Vite Environment Variables Documentation](https://vitejs.dev/guide/env-and-mode.html)
- [Zod Schema Validation](https://github.com/colinhacks/zod)
- [CONFIG_TEST_SUMMARY.md](./CONFIG_TEST_SUMMARY.md) - Detailed security testing results

## 🆘 Getting Help

If you encounter issues with environment variables:

1. Check the configuration tests: `npm test -- --run src/config/config.test.js`
2. Verify your `.env` file follows the guidelines in this document
3. Review the error messages from the Zod schema validation
4. Ensure all required `VITE_*` variables are defined
5. Run the security validation script: `node src/config/test-env-security.js`
