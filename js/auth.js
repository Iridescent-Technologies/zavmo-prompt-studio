// ================================================================
// ZAVMO BACKEND AUTH
// Users authenticate with their own Zavmo credentials.
// No secrets are stored in this file.
// ================================================================
const ZAVMO_BASE_URL = 'https://uat.zavmo.co.uk:8000';

function getStoredTokens() {
    try {
        return JSON.parse(localStorage.getItem('zavmo_auth') || 'null');
    } catch(e) { return null; }
}

function storeTokens(access, refresh, email) {
    localStorage.setItem('zavmo_auth', JSON.stringify({
        access_token: access,
        refresh_token: refresh,
        email: email,
        stored_at: Date.now()
    }));
}

function clearTokens() {
    localStorage.removeItem('zavmo_auth');
}

function getAccessToken() {
    const auth = getStoredTokens();
    return auth ? auth.access_token : null;
}

async function refreshAccessToken() {
    const auth = getStoredTokens();
    if (!auth || !auth.refresh_token) {
        showLoginGate('Session expired. Please log in again.');
        return null;
    }
    try {
        const resp = await fetch(`${ZAVMO_BASE_URL}/api/auth/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: auth.refresh_token })
        });
        const data = await resp.json();
        if (data.success && data.access_token) {
            storeTokens(data.access_token, data.refresh_token, auth.email);
            return data.access_token;
        }
        showLoginGate('Session expired. Please log in again.');
        return null;
    } catch(e) {
        console.error('Token refresh failed:', e);
        showLoginGate('Session expired. Please log in again.');
        return null;
    }
}

function showLoginGate(message) {
    clearTokens();
    sessionStorage.removeItem('zavmo_access');
    document.getElementById('access-gate').classList.remove('hidden');
    if (message) {
        document.getElementById('gate-error').textContent = message;
        document.getElementById('gate-error').classList.add('visible');
    }
}

// Access code verification uses SHA-256 hashing for security (ISO 27001)
async function hashWithSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function checkAccess() {
    const email = document.getElementById('gate-email').value.trim().toLowerCase();
    const password = document.getElementById('gate-password').value.trim();

    if (!email || !password) {
        document.getElementById('gate-error').textContent = 'Please enter both your email and password.';
        document.getElementById('gate-error').classList.add('visible');
        return;
    }

    // Show loading state
    const btn = document.querySelector('.gate-card button');
    const originalText = btn.textContent;
    btn.textContent = 'Signing in...';
    btn.disabled = true;
    document.getElementById('gate-error').classList.remove('visible');

    try {
        const resp = await fetch(`${ZAVMO_BASE_URL}/api/auth/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: email, password: password })
        });
        const data = await resp.json();

        if (data.success && data.access_token) {
            storeTokens(data.access_token, data.refresh_token, email);
            sessionStorage.setItem('zavmo_access', email);
            document.getElementById('access-gate').classList.add('hidden');
            console.log('Zavmo backend: authenticated as', email);
        } else {
            document.getElementById('gate-error').textContent = data.message || 'Invalid email or password.';
            document.getElementById('gate-error').classList.add('visible');
        }
    } catch(e) {
        document.getElementById('gate-error').textContent = 'Cannot reach the Zavmo server. Please try again.';
        document.getElementById('gate-error').classList.add('visible');
    } finally {
        btn.textContent = originalText;
        btn.disabled = false;
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // Check for existing valid session
    const auth = getStoredTokens();
    if (auth && auth.access_token) {
        // Verify the token is still valid by refreshing
        const token = await refreshAccessToken();
        if (token) {
            sessionStorage.setItem('zavmo_access', auth.email || '');
            document.getElementById('access-gate').classList.add('hidden');
        }
    }

    // Allow Enter key on both fields
    document.getElementById('gate-email').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('gate-password').focus();
        }
    });
    document.getElementById('gate-password').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') checkAccess();
    });
});

async function zavmoFetch(url, options = {}) {
    let token = getAccessToken();
    if (!token) {
        showLoginGate('Please log in to continue.');
        throw new Error('Not authenticated. Please log in.');
    }

    options.headers = options.headers || {};
    options.headers['Authorization'] = 'Bearer ' + token;

    let resp = await fetch(url, options);

    if (resp.status === 401) {
        token = await refreshAccessToken();
        if (!token) throw new Error('Session expired. Please reload the page.');
        options.headers['Authorization'] = `Bearer ${token}`;
        resp = await fetch(url, options);
    }

    return resp;
}

// Auto-refresh token every 50 minutes (token expires in 60 min)
setInterval(async () => {
    if (getAccessToken()) await refreshAccessToken();
}, 50 * 60 * 1000);
