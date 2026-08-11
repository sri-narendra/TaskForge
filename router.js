// Hash router: / = landing, /login = auth, /app = board.
// Using the URL hash (#/app) instead of pathnames so GitHub Pages always
// serves index.html on refresh — the hash is never sent to the server.

const getView = () => ({
    landing: document.getElementById('landingView'),
    auth: document.getElementById('authView'),
    app: document.getElementById('appView'),
});

function loggedIn() {
    return !!localStorage.getItem('user');
}

// '#/app' -> '/app', '#capabilities' (landing anchor) -> '/', '' -> '/'
export function path() {
    const h = location.hash.replace(/^#/, '');
    if (h === '' || !h.startsWith('/')) return '/';
    return h;
}

function resolve(p) {
    if (p === '/login') return loggedIn() ? '/app' : '/login';
    if (p === '/app') return loggedIn() ? '/app' : '/login';
    return '/';
}

export function navigate(targetPath) {
    const target = resolve(targetPath);
    // Landing lives at the bare URL (no hash); routes get '#/login' or '#/app'
    const desired = target === '/' ? '' : '/' + target;
    if (location.hash !== (desired ? '#' + desired : '')) {
        location.hash = desired;
    }
    render(target);
}

export function route() {
    render(resolve(path()));
}

function render(p) {
    const v = getView();
    v.landing?.classList.toggle('hidden', p !== '/');
    v.auth?.classList.toggle('hidden', p !== '/login');
    v.app?.classList.toggle('hidden', p !== '/app');
    document.body.classList.toggle('has-landing', p === '/');
    document.title = p === '/app' ? 'TaskForge' : p === '/login' ? 'Sign In - TaskForge' : 'TaskForge';
    if (p === '/') revealLanding();
}

const revealObs = new IntersectionObserver(entries => {
    for (const e of entries) {
        if (e.isIntersecting) {
            e.target.classList.add('revealed');
            revealObs.unobserve(e.target);
        }
    }
}, { threshold: 0.12 });

function revealLanding() {
    const v = getView();
    if (!v.landing || !revealObs) return;
    document.querySelectorAll('.landing [data-reveal]').forEach(el => {
        revealObs.unobserve(el);
        if (el.getBoundingClientRect().top < window.innerHeight) {
            el.classList.add('revealed');
        } else {
            revealObs.observe(el);
        }
    });
}

window.addEventListener('hashchange', route);
document.addEventListener('DOMContentLoaded', route);