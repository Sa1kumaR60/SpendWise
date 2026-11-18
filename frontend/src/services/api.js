const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Standard fetch wrapper handling credentials, JSON formatting, and unified error handling
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
    credentials: 'include', // Ensure cookies are always sent
  };

  const response = await fetch(url, config);

  // If CSV or blob download
  if (options.responseType === 'blob') {
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || 'Download failed');
    }
    return response.blob();
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    let errorMsg = data.message;
    if (!errorMsg) {
      if (response.status === 500 || response.status === 502 || response.status === 503) {
        errorMsg = 'Cannot connect to backend server. Make sure the backend is running on port 5000.';
      } else {
        errorMsg = `Request failed with status ${response.status}`;
      }
    }
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),

  // User Settings
  updateProfile: (body) => request('/users/profile', { method: 'PUT', body: JSON.stringify(body) }),
  updatePassword: (body) => request('/users/password', { method: 'PUT', body: JSON.stringify(body) }),

  // Dashboard
  getDashboard: (month) => {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return request(`/dashboard${query}`);
  },

  // Transactions
  getTransactions: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const query = searchParams.toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },
  createTransaction: (body) => request('/transactions', { method: 'POST', body: JSON.stringify(body) }),
  updateTransaction: (id, body) => request(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),
  exportCsv: async (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const query = searchParams.toString();
    return request(`/transactions/export/csv${query ? `?${query}` : ''}`, { responseType: 'blob' });
  },

  // Categories
  getCategories: (type) => {
    const query = type ? `?type=${encodeURIComponent(type)}` : '';
    return request(`/categories${query}`);
  },
  createCategory: (body) => request('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id, body) => request(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id) => request(`/categories/${id}`, { method: 'DELETE' }),

  // Budgets
  getBudgets: (month) => {
    const query = month ? `?month=${encodeURIComponent(month)}` : '';
    return request(`/budgets${query}`);
  },
  createBudget: (body) => request('/budgets', { method: 'POST', body: JSON.stringify(body) }),
  updateBudget: (id, body) => request(`/budgets/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBudget: (id) => request(`/budgets/${id}`, { method: 'DELETE' }),

  // Reports
  getReports: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const query = searchParams.toString();
    return request(`/reports/summary${query ? `?${query}` : ''}`);
  },
};
