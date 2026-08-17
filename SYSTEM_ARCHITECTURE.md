# System Architecture & Port Configuration

## Port Setup
* **Booth App**: Runs on port `5173`.
* **Admin Panel**: Runs on port `5174`.

## API & Backend Communication
The project currently does **not** use the standalone Node.js server on port `3000` for its primary API endpoints (like `/api/frames` and `/api/auth/login`).

Instead, the mock API server is built directly into the **Admin Panel's Vite development server** using a custom Vite plugin (`apiPlugin()` inside `admin-panel/vite.config.ts`).

### Critical Configuration Rule:
Because the API lives inside the Admin Panel on port `5174`, the **Booth App must proxy its API requests to the Admin Panel**.

In `booth-app/vite.config.ts`, the proxy MUST be configured to point to `http://localhost:5174`:

```typescript
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5174', // Must point to the Admin Panel's port
        changeOrigin: true,
      },
    },
  },
```

If the Admin Panel port ever changes, this proxy target in the Booth App must be updated to match it. Furthermore, any hardcoded URLs in the Admin Panel's frontend (`admin-panel/src/App.tsx`) must use relative paths (e.g. `/api/auth/login`) rather than hardcoding `localhost:5173`.
