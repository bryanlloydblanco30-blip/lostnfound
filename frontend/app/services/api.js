/**
 * api.js — Lost & Found Frontend API Service
 * ============================================
 * Central integration layer between the Next.js frontend and
 * the Spring Boot backend running on http://localhost:8080.
 *
 * Usage in any component:
 *   import api from '@/app/services/api';
 *   const data = await api.getItems();
 *
 * Auth token is automatically stored in localStorage and attached
 * to every protected request via the Authorization header.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

// ─── Token helpers ────────────────────────────────────────────────────────────
function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('lnf_token');
}

function setToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lnf_token', token);
}

function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('lnf_token');
  localStorage.removeItem('lnf_user');
}

function setUser(user) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lnf_user', JSON.stringify(user));
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('lnf_user') || 'null');
  } catch {
    return null;
  }
}

// ─── Base fetch wrapper ───────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  // 401 or 403 → token expired or unauthorized, log out
  if (res.status === 401 || res.status === 403) {
    clearToken();
    if (typeof window !== 'undefined') window.location.href = '/LS';
    return;
  }

  const json = await res.json();

  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Request failed: ${res.status}`);
  }

  return json.data;
}

// Multipart form data (for file uploads — does NOT set Content-Type manually)
async function requestFormData(path, formData) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.message || `Upload failed: ${res.status}`);
  }
  return json.data;
}


// ─── AUTH ─────────────────────────────────────────────────────────────────────

/**
 * Register a new user account.
 * @example
 * const { token, user } = await api.register('a@b.com', '2023-001', 'pass123', 'Juan');
 */
async function register(email, srCode, password, name) {
  const data = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, srCode, password, name }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

/**
 * Login with email + password.
 * @example
 * const { token, user } = await api.login('a@b.com', 'pass123');
 */
async function login(email, password) {
  const data = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

/** Logout — clears local storage */
function logout() {
  clearToken();
  if (typeof window !== 'undefined') window.location.href = '/LS';
}

/**
 * Get the current authenticated user profile.
 * @example const user = await api.getMe();
 */
async function getMe() {
  return request('/api/auth/me');
}

/**
 * Update the current user's profile fields.
 * @example await api.updateProfile({ name: 'Juan', number: '09171234567' });
 */
async function updateProfile(profileData) {
  return request('/api/auth/me', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}


// ─── IMAGE UPLOAD ─────────────────────────────────────────────────────────────

/**
 * Upload an image file. Returns { url: '/uploads/filename.jpg' }.
 * The url can then be stored as item.image or user.photo.
 *
 * @example
 * const { url } = await api.uploadImage(fileInputRef.current.files[0]);
 */
async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  return requestFormData('/api/upload', formData);
}


// ─── ITEMS ────────────────────────────────────────────────────────────────────

/**
 * Get all items with optional filters.
 * @example
 * const items = await api.getItems({ search: 'wallet', status: 'Lost' });
 */
async function getItems({ search, status, category, location } = {}) {
  const params = new URLSearchParams();
  if (search)   params.set('search', search);
  if (status)   params.set('status', status);
  if (category) params.set('category', category);
  if (location) params.set('location', location);
  const qs = params.toString();
  return request(`/api/items${qs ? '?' + qs : ''}`);
}

/**
 * Get items posted by the current user (My Reports page).
 * @example const myItems = await api.getMyItems();
 */
async function getMyItems() {
  return request('/api/items/mine');
}

/**
 * Get a single item by ID (Detailed page).
 * @example const item = await api.getItem(42);
 */
async function getItem(id) {
  return request(`/api/items/${id}`);
}

/**
 * Get potential matches for an item.
 * @example const matches = await api.getMatches(42);
 */
async function getMatches(id) {
  return request(`/api/items/${id}/matches`);
}

/**
 * Create a new lost/found item.
 * Automatically uploads image first if a File object is passed.
 *
 * @example
 * const item = await api.createItem({
 *   title: 'Black Wallet',
 *   category: 'Accessories',
 *   status: 'Lost',
 *   location: 'Cafeteria',
 *   dateStr: '2026-04-19',
 *   imageFile: file,   // File object from <input type="file">
 * });
 */
async function createItem({ imageFile, ...formData }) {
  let imageUrl = formData.image || '';
  if (imageFile) {
    const { url } = await uploadImage(imageFile);
    imageUrl = url;
  }
  return request('/api/items', {
    method: 'POST',
    body: JSON.stringify({ ...formData, image: imageUrl }),
  });
}

/**
 * Update an existing item.
 * @example await api.updateItem(42, { status: 'Found' });
 */
async function updateItem(id, data) {
  return request(`/api/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

/**
 * Delete an item (owner or admin only).
 * @example await api.deleteItem(42);
 */
async function deleteItem(id) {
  return request(`/api/items/${id}`, { method: 'DELETE' });
}


// ─── BOOKMARKS ───────────────────────────────────────────────────────────────

/**
 * Get all bookmarked items for the current user.
 * @example const bookmarks = await api.getBookmarks();
 */
async function getBookmarks() {
  return request('/api/bookmarks');
}

/**
 * Add an item to bookmarks.
 * @example await api.addBookmark(42);
 */
async function addBookmark(itemId) {
  return request('/api/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ itemId }),
  });
}

/**
 * Remove an item from bookmarks.
 * @example await api.removeBookmark(42);
 */
async function removeBookmark(itemId) {
  return request(`/api/bookmarks/${itemId}`, { method: 'DELETE' });
}


// ─── MESSAGES ─────────────────────────────────────────────────────────────────

/**
 * Get all conversations (chat list) for the current user.
 * @example const conversations = await api.getConversations();
 */
async function getConversations() {
  return request('/api/messages');
}

/**
 * Get all messages exchanged with a specific user (by their ID).
 * The backend resolves the canonical conversationId automatically.
 * @example const messages = await api.getMessages(5);
 */
async function getMessages(receiverId) {
  return request(`/api/messages/with/${receiverId}`);
}

/**
 * Send a message to another user.
 * @example await api.sendMessage(5, 'Hello, is the wallet still available?');
 */
async function sendMessage(receiverId, text) {
  return request('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ receiverId, text }),
  });
}


// ─── REPORTS ─────────────────────────────────────────────────────────────────

/**
 * Report an item as fake or suspicious.
 * @example await api.reportItem(42, 'This post looks fake');
 */
async function reportItem(itemId, reason) {
  return request('/api/reports', {
    method: 'POST',
    body: JSON.stringify({ itemId, reason }),
  });
}


// ─── ADMIN ───────────────────────────────────────────────────────────────────

const admin = {
  getStats:    ()       => request('/api/admin/stats'),
  getUsers:    ()       => request('/api/admin/users'),
  deleteUser:  (id)     => request(`/api/admin/users/${id}`, { method: 'DELETE' }),
  getItems:    ()       => request('/api/admin/items'),
  deleteItem:  (id)     => request(`/api/admin/items/${id}`, { method: 'DELETE' }),
  getReports:  ()       => request('/api/admin/reports'),
  reviewReport:(id, s)  => request(`/api/admin/reports/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status: s }),
  }),
};


// ─── Export ───────────────────────────────────────────────────────────────────
const api = {
  // Auth
  register,
  login,
  logout,
  getMe,
  updateProfile,
  getStoredUser,
  getToken,

  // Items
  getItems,
  getMyItems,
  getItem,
  getMatches,
  createItem,
  updateItem,
  deleteItem,

  // Upload
  uploadImage,

  // Bookmarks
  getBookmarks,
  addBookmark,
  removeBookmark,

  // Messages
  getConversations,
  getMessages,
  sendMessage,

  // Reports
  reportItem,

  // Admin
  admin,
};

export default api;
