import { fetchBoards, fetchLists, fetchTasks } from './api.js';
import { renderApp } from './ui.js';
import * as UI from './ui.js';
import { state } from './state.js';
import { CONFIG } from './config.js';
import { route, navigate } from './router.js';

// Wake Render's free instance while the user reads the landing page
// so the first login/data fetch doesn't hit a cold start.
function warmUpBackend() {
    const ping = () =>
        fetch(CONFIG.BACKEND_URL + '/health', { method: 'GET' })
            .then(r => r.json().catch(() => null))
            .catch(() => null);

    let tries = 0;
    (async () => {
        while (tries < 30) {
            tries++;
            const h = await ping();
            if (h && h.status === 'ok' && h.db === 'connected') return;
            await new Promise(r => setTimeout(r, 2000));
        }
    })();
}
warmUpBackend();

// Global Error Boundary
window.onerror = (msg, url, line, col, error) => {
    console.error('💥 Frontend Error:', { msg, url, line, col, error });
    // In prod, you'd send this to Sentry/LogRocket
    UI.showToast('An unexpected error occurred. Please refresh.');
};

window.onunhandledrejection = (event) => {
    console.error('💥 Unhandled Promise Rejection:', event.reason);
};

// Expose functions to window for onclick handlers
window.app = {
    ...UI,
    navigate,
    toggleDrawer: () => {
        const d = document.getElementById('drawer');
        if (d) d.classList.toggle('closed'); 
    }
};



document.addEventListener('DOMContentLoaded', async () => {
    route();
    UI.updateAuthUI();
    
    // Attempt silent login
    await UI.refreshSession(); // We'll add a UI wrapper or call api directly
    // Wait, let's call it from api.js directly to avoid UI import issues if UI doesn't export it yet
    
    route(); // re-resolve after silent login (may have moved /login -> /app)
    UI.updateAuthUI();
    
    // Check if we are logged in (via global state or local check)
    // For now, let's assume if we got a user, we proceed
    const user = JSON.parse(localStorage.getItem('user')); // User info is ok in localStorage, not token
    
    if (user && location.pathname === '/app') {
        await Promise.all([fetchBoards(), fetchLists()]);
        
        if (state.boards.length > 0) {
            state.currentBoardId = state.boards[0].id;
            // Fetch tasks for the current board selectively
            await fetchTasks(state.currentBoardId);
        }
        
        UI.renderApp();
    }
    
    UI.initKeyboardShortcuts();
    UI.initNotifications();
    UI.initCustomTheme();
});
