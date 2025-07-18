# React + Vite Frontend

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Environment Variables

### 🔒 Security Guidelines

**IMPORTANT:** Only environment variables prefixed with `VITE_` are accessible to client-side code in Vite applications.

#### Safe Variables (Client-accessible)
- ✅ **Use `VITE_` prefix** for variables that should be available to frontend code
- ✅ Examples: `VITE_API_URL`, `VITE_APP_NAME`, `VITE_SOCKET_URL`
- ✅ These variables are embedded in the build output and publicly accessible

#### Sensitive Variables (Server-only)
- ❌ **NEVER use `VITE_` prefix** for sensitive configuration
- ❌ Examples: `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, `CLAUDE_API_KEY`
- ❌ These variables should remain server-side only

### Configuration

The application uses a centralized configuration system located in `src/config/index.js` that:
- Validates all environment variables using Zod schema
- Provides type-safe access to configuration values
- Ensures required variables are present
- Organizes configuration into logical sections (API, app, development, socket, analytics)

### Current Environment Variables

The following `VITE_*` variables are currently used by the application:

```bash
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_VERSION=v1

# App Configuration
VITE_APP_NAME=SAR Meta World
VITE_APP_VERSION=1.0.0

# Socket Configuration
VITE_SOCKET_URL=ws://localhost:3001
VITE_SOCKET_NAMESPACE=default

# Development Settings
VITE_LOG_LEVEL=debug
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_MOCK_API=false
VITE_SHOW_DEBUG_INFO=true

# Service URLs (for development)
VITE_BACKEND_URL=http://localhost:3001
VITE_GRAFANA_URL=http://localhost:3000
VITE_PROMETHEUS_URL=http://localhost:9090
VITE_INFLUXDB_URL=http://localhost:8086
VITE_ADMINER_URL=http://localhost:8080
VITE_REDIS_COMMANDER_URL=http://localhost:8081
```

### Testing Configuration

Run the configuration tests to verify environment variable setup:

```bash
# Run configuration tests
npm test -- --run src/config/config.test.js

# Run complete verification
node verify-config.js
```

For detailed information about environment variable security testing, see [CONFIG_TEST_SUMMARY.md](./CONFIG_TEST_SUMMARY.md).

**📖 For comprehensive environment variable guidelines, see [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)**

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
