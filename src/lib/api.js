import { auth } from './firebase.js'
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

async function authedFetch(path, init){
  const user = auth.currentUser
  const token = user ? await user.getIdToken() : undefined
  const headers = {
    'Content-Type': 'application/json',
    ...(init?.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
  const res = await fetch(`${API_URL}${path}`, { ...init, headers })
  if (!res.ok) throw new Error(await res.text())
  try { return await res.json() } catch { return {} }
}

export const Api = {
  listPlants: () => authedFetch('/api/plants'),
  createPlant: (data) => authedFetch('/api/plants', { method: 'POST', body: JSON.stringify(data) }),
  updatePlant: (id, data) => authedFetch(`/api/plants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePlant: (id) => authedFetch(`/api/plants/${id}`, { method: 'DELETE' }),
  markWatered: (id, amountMl) => authedFetch(`/api/plants/${id}/water`, { method: 'POST', body: JSON.stringify({ amountMl }) }),
  listWaterings: (id) => authedFetch(`/api/plants/${id}/waterings`),
}
