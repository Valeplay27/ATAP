// Centralized API Client for ATAP Frontend
// Connects to Node.js / Express Backend with MySQL

const API_BASE = '/api';

export function getAuthToken() {
  try {
    const token = localStorage.getItem('atap_token');
    if (token) return token;
    const rawUser = localStorage.getItem('atap_usuario');
    if (rawUser) {
      const u = JSON.parse(rawUser);
      return u.token || null;
    }
  } catch (e) {}
  return null;
}

export function setAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('atap_token', token);
    } else {
      localStorage.removeItem('atap_token');
    }
  } catch (e) {}
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMessage = data?.error || data?.message || `Error HTTP ${response.status}`;
      return { error: errorMessage, status: response.status };
    }

    return { data, status: response.status };
  } catch (err) {
    return { error: err.message || 'Error de conexión con el servidor ATAP.' };
  }
}

export const api = {
  get: (endpoint) => request(endpoint, { method: 'GET' }),
  post: (endpoint, body) => request(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) => request(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint, body) => request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint) => request(endpoint, { method: 'DELETE' }),

  // Subida de imagen al servidor (sin guardar base64 pesados en el navegador)
  uploadImage: async (file) => {
    try {
      if (!file) return { error: 'No se seleccionó ningún archivo.' };
      if (file.size > 5 * 1024 * 1024) {
        return { error: 'La imagen excede el límite máximo de 5 MB. Por favor elige una imagen más liviana.' };
      }

      const formData = new FormData();
      formData.append('file', file);
      const token = getAuthToken();

      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { error: errData.error || 'Error al subir la imagen al servidor.' };
      }

      const json = await res.json();
      return { url: json.url };
    } catch (err) {
      return { error: err.message || 'Fallo de conexión al subir la imagen.' };
    }
  }
};

// --- SERVICIOS ESPECÍFICOS ---

export const authApi = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getSocialInfo: ({ provider, token, email, name, phone }) =>
    api.post('/auth/social-info', { provider, token, email, name, phone }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData)
};

export const tournamentApi = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  createInscription: (tournamentId, data) => api.post(`/inscriptions/${tournamentId}`, data),
  updateInscriptionStatus: (inscId, estadoPago) => api.patch(`/inscriptions/${inscId}/status`, { estadoPago }),
  addToBank: (tournamentId, playerData) => api.post(`/inscriptions/${tournamentId}/bank`, playerData),
  deleteInscription: (inscId) => api.delete(`/inscriptions/${inscId}`),
  saveGroups: (tournamentId, grupos) => api.put(`/fixtures/${tournamentId}/groups`, { grupos }),
  saveBracket: (tournamentId, bracket) => api.put(`/fixtures/${tournamentId}/bracket`, { bracket }),
  recordMatchScore: (tournamentId, matchId, resultData) =>
    api.post(`/fixtures/${tournamentId}/matches/${matchId}/score`, resultData)
};

export const rankingApi = {
  getLeaderboard: (categoria, modalidad) => {
    const q = new URLSearchParams();
    if (categoria) q.set('categoria', categoria);
    if (modalidad) q.set('modalidad', modalidad);
    return api.get(`/ranking?${q.toString()}`);
  },
  getPlayerDetail: (id) => api.get(`/ranking/${id}`)
};

export const playerApi = {
  getAll: () => api.get('/players'),
  save: (playerData) => api.post('/players', playerData),
  delete: (id) => api.delete(`/players/${id}`),
  updateAvatar: (id, avatarUrl) => api.patch(`/players/${id}/avatar`, { avatarUrl })
};

export const contentApi = {
  getNews: () => api.get('/content/news'),
  saveNews: (data) => api.post('/content/news', data),
  deleteNews: (id) => api.delete(`/content/news/${id}`),
  getSponsors: () => api.get('/content/sponsors'),
  saveSponsor: (data) => api.post('/content/sponsors', data),
  deleteSponsor: (id) => api.delete(`/content/sponsors/${id}`),
  getSetting: (key) => api.get(`/content/settings/${key}`),
  saveSetting: (key, value) => api.put(`/content/settings/${key}`, { value })
};

export default api;
