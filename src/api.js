// src/api.js
// ─────────────────────────────────────────────────────────────────────────────
// Centralized API service for DisasterConnect Vue frontend.
// Every component imports from here instead of using fetch() directly.
// ─────────────────────────────────────────────────────────────────────────────

const API_BASE = 'http://127.0.0.1:8000/api'

// ── Token storage ─────────────────────────────────────────────────────────────
// Store the Sanctum token in localStorage so it survives page refresh.

export function getToken()          { return localStorage.getItem('dc_token') }
export function setToken(token)     { localStorage.setItem('dc_token', token) }
export function clearToken()        { localStorage.removeItem('dc_token') }
export function getUser()           { return JSON.parse(localStorage.getItem('dc_user') || 'null') }
export function setUser(user)       { localStorage.setItem('dc_user', JSON.stringify(user)) }
export function clearUser()         { localStorage.removeItem('dc_user') }

// ── Base fetch wrapper ────────────────────────────────────────────────────────

async function request(method, path, body = null) {
  const headers = {
    'Accept':       'application/json',
    'Content-Type': 'application/json',
  }

  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  const config = { method, headers }
  if (body) config.body = JSON.stringify(body)

  const res = await fetch(`${API_BASE}${path}`, config)

  // If 401, token expired — clear and reload
  if (res.status === 401) {
    clearToken()
    clearUser()
    window.location.reload()
    return
  }

  const data = await res.json()

  if (!res.ok) {
    // Laravel validation errors come back as { errors: { field: [...] } }
    const message = data.message || data.errors
      ? Object.values(data.errors || {}).flat().join(' ')
      : 'An error occurred.'
    throw new Error(message)
  }

  return data
}

// ── Convenience methods ────────────────────────────────────────────────────────

const get    = (path)          => request('GET',    path)
const post   = (path, body)    => request('POST',   path, body)
const patch  = (path, body)    => request('PATCH',  path, body)
const del    = (path)          => request('DELETE', path)

// ═════════════════════════════════════════════════════════════════════════════
// AUTH
// ═════════════════════════════════════════════════════════════════════════════

export const auth = {
  /**
   * Login — stores token + user in localStorage.
   * @returns { token, user }
   */
  async login(username, password) {
    const data = await post('/auth/login', { username, password })
    setToken(data.token)
    setUser(data.user)
    return data
  },

  async logout() {
    await post('/auth/logout')
    clearToken()
    clearUser()
  },

  async me() {
    return get('/auth/me')
  },
}

// ═════════════════════════════════════════════════════════════════════════════
// DISASTER REPORTS
// ═════════════════════════════════════════════════════════════════════════════

export const reports = {
  list:   ()          => get('/reports'),
  get:    (id)        => get(`/reports/${id}`),
  create: (data)      => post('/reports', data),
  update: (id, data)  => patch(`/reports/${id}`, data),
  delete: (id)        => del(`/reports/${id}`),
}

// ═════════════════════════════════════════════════════════════════════════════
// INVENTORY
// ═════════════════════════════════════════════════════════════════════════════

export const inventory = {
  list:   ()          => get('/inventory'),
  create: (data)      => post('/inventory', data),
  update: (id, data)  => patch(`/inventory/${id}`, data),
  delete: (id)        => del(`/inventory/${id}`),
}

// ═════════════════════════════════════════════════════════════════════════════
// DONATIONS
// ═════════════════════════════════════════════════════════════════════════════

export const donations = {
  list:   ()          => get('/donations'),
  create: (data)      => post('/donations', data),
  update: (id, data)  => patch(`/donations/${id}`, data),
}

// ═════════════════════════════════════════════════════════════════════════════
// DELIVERIES
// ═════════════════════════════════════════════════════════════════════════════

export const deliveries = {
  list:   ()          => get('/deliveries'),
  create: (data)      => post('/deliveries', data),
  update: (id, data)  => patch(`/deliveries/${id}`, data),
}

// ═════════════════════════════════════════════════════════════════════════════
// RESIDENTS
// ═════════════════════════════════════════════════════════════════════════════

export const residents = {
  list:   ()          => get('/residents'),
  create: (data)      => post('/residents', data),
  update: (id, data)  => patch(`/residents/${id}`, data),
  delete: (id)        => del(`/residents/${id}`),
}

// ═════════════════════════════════════════════════════════════════════════════
// ANALYTICS
// ═════════════════════════════════════════════════════════════════════════════

export const analytics = {
  bi: () => get('/analytics/bi'),
}
