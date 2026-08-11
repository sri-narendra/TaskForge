// Auto-detect environment
const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const CONFIG = {
    // Localhost -> Local Backend
    // GitHub Pages (or anywhere else) -> Render Backend
    BACKEND_URL: isDev ? 'http://localhost:3000' : 'https://taskforge-backend-4599.onrender.com'
};
