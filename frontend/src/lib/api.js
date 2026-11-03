const API_URL = import.meta.env.VITE_API_HOST
  ? `https://${import.meta.env.VITE_API_HOST}/api`
  : (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

export async function api(path, options = {}) {
  const token = window.sessionStorage.getItem('kinyarwanda-token');
  const headers = new Headers(options.headers || {});
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      body: options.body && !(options.body instanceof FormData)
        ? JSON.stringify(options.body)
        : options.body,
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Cannot reach the account server. Check that the backend is running and VITE_API_URL is configured correctly.');
    }
    throw error;
  }

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error || `Request failed (${response.status}).`);
  }

  return payload;
}

export async function ensureAccountApiReady({ requireRegistrationBlockchain = false } = {}) {
  const health = await api('/health');

  if (health.database !== 'connected') {
    throw new Error('The account database is not connected. Check the backend database settings and try again.');
  }

  if (requireRegistrationBlockchain && health.blockchain !== 'configured') {
    throw new Error('Account registration is not configured yet. Ask the site administrator to configure the Polygon Amoy registration contract.');
  }
}
