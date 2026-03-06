export const API_BASE = 'http://localhost:8085/api/users';

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('ACCESS_TOKEN') || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResp = async (resp: Response) => {
  const text = await resp.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const throwIfError = async (resp: Response) => {
  if (!resp.ok) {
    const body = await resp.text();
    const err = new Error(`HTTP ${resp.status}: ${body}`);
    throw err;
  }
};

export const logoutUser = async () => {
  const url = `${API_BASE}/logout`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });
  const text = await resp.text();
  if (!resp.ok) {
    const err = new Error(`HTTP ${resp.status}: ${text}`);
    throw err;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const getAllEmployees = async () => {
  try {
    const url = `${API_BASE}/employees`;
    console.log('Fetching employees from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    });
    const text = await resp.text();
    console.log('getAllEmployees response status:', resp.status, 'body:', text);
    if (!resp.ok) {
      const err = new Error(`HTTP ${resp.status}: ${text}`);
      throw err;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('getAllEmployees failed:', err);
    throw err;
  }
};
export const loginUser = async (email: string, password: string) => {
  const url = `${API_BASE}/login`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  const text = await resp.text();
  if (!resp.ok) {
    const err = new Error(`HTTP ${resp.status}: ${text}`);
    throw err;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const getAdminEmployees = async () => {
  try {
    const url = `${API_BASE}/admin/employees`;
    console.log('Fetching admin employees from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    });
    const text = await resp.text();
    console.log('getAdminEmployees response status:', resp.status, 'body:', text);
    if (!resp.ok) {
      const err = new Error(`HTTP ${resp.status}: ${text}`);
      throw err;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('getAdminEmployees failed:', err);
    throw err;
  }
};

export const terminateEmployee = async (id: string) => {
  const url = `${API_BASE}/admin/terminate/${id}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  const text = await resp.text();
  if (!resp.ok) {
    const err = new Error(`HTTP ${resp.status}: ${text}`);
    throw err;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const getDepartments = async () => {
  try {
    const url = `${API_BASE}/departments`;
    console.log('Fetching departments from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    });
    const text = await resp.text();
    console.log('getDepartments response status:', resp.status, 'body:', text);
    if (!resp.ok) {
      const err = new Error(`HTTP ${resp.status}: ${text}`);
      throw err;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('getDepartments failed:', err);
    throw err;
  }
};

export const registerAdmin = async (adminData: any, imageFile?: File) => {
  try {
    const url = 'http://localhost:8081/register';
    console.log('Registering admin:', adminData);

    const form = new FormData();
    form.append('data', JSON.stringify(adminData));
    if (imageFile) {
      form.append('image', imageFile);
    }

    const resp = await fetch(url, {
      method: 'POST',
      headers: { ...getAuthHeader() },
      credentials: 'include',
      body: form,
    });

    const text = await resp.text();
    console.log('registerAdmin response status:', resp.status, 'body:', text);

    if (!resp.ok) {
      const err = new Error(`HTTP ${resp.status}: ${text}`);
      throw err;
    }

    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('registerAdmin failed:', err);
    throw err;
  }
};

export const getEmployees = async () => {
  try {
    const url = `${API_BASE}/employees`;
    console.log('Fetching employees from:', url);
    const resp = await fetch(url, {
      headers: { Accept: 'application/json', ...getAuthHeader() },
      credentials: 'include',
    });
    const text = await resp.text();
    console.log('getEmployees response status:', resp.status, 'body:', text);
    if (!resp.ok) {
      const err = new Error(`HTTP ${resp.status}: ${text}`);
      throw err;
    }
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (err) {
    console.error('getEmployees failed:', err);
    throw err;
  }
};
