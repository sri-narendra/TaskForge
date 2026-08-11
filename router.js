// Minimal History-API router: / = landing, /login = auth, /app = board

const getView = () => ({
    landing: document.getElementById('landingView'),
    auth: document.getElementById('authView'),
    app: document.getElementById('appView'),
});

function loggedIn() {
    return !!localStorage.getItem('user');
}

function resolve(path) {
    if (path === '/login') return loggedIn() ? '/app' : '/login';
    if (path === '/app') return loggedIn() ? '/app' : '/login';
    return '/';
}

export function navigate(path) {
    const target = resolve(path);
    history.pushState({}, '', target);
    render(target);
}

export function route() {
    const target = resolve(location.pathname);
    if (target !== location.pathname) {
        history.replaceState({}, '', target);
    }
    render(target);
}

function render(path) {
    const v = getView();
    v.landing?.classList.toggle('hidden', path !== '/');
    v.auth?.classList.toggle('hidden', path !== '/login');
    v.app?.classList.toggle('hidden', path !== '/app');
    document.body.classList.toggle('has-landing', path === '/');
    document.title = path === '/app' ? 'TaskForge' : path === '/login' ? 'Sign In - TaskForge' : 'TaskForge';
    if (path === '/') revealLanding();
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

window.addEventListener('popstate', route);
document.addEventListener('DOMContentLoaded', route);
