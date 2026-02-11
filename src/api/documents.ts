export const API_BASE = 'http://localhost:8085/api/documents';

const getAuthHeader = () => {
  const token = localStorage.getItem('ACCESS_TOKEN') || localStorage.getItem('token') || localStorage.getItem('authToken') || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseText = async (resp: Response) => {
  const text = await resp.text();
  try { return JSON.parse(text); } catch { return text; }
};

const throwIfError = async (resp: Response) => {
  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${body}`);
  }
};

export const uploadDocument = async (file: File, data: { employeeId: string; documentType: string }) => {
  const form = new FormData();
  form.append('file', file);
  form.append('data', JSON.stringify(data));

  const resp = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: form,
    headers: { ...getAuthHeader() },
    credentials: 'include',
  });

  await throwIfError(resp);
  return parseText(resp);
};

export const getDocumentsByEmployee = async (employeeId: string) => {
  const resp = await fetch(`${API_BASE}/${encodeURIComponent(employeeId)}`, {
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const getDocument = async (employeeId: string, documentId: number) => {
  const resp = await fetch(`${API_BASE}/${encodeURIComponent(employeeId)}/${documentId}`, {
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const downloadDocument = async (employeeId: string, documentId: number) => {
  const resp = await fetch(`${API_BASE}/download/${encodeURIComponent(employeeId)}/${documentId}`, {
    headers: { ...getAuthHeader() },
    credentials: 'include',
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`HTTP ${resp.status}: ${txt}`);
  }
  const blob = await resp.blob();
  const disposition = resp.headers.get('Content-Disposition') || '';
  return { blob, disposition, contentType: resp.headers.get('Content-Type') };
};

export const updateDocument = async (employeeId: string, documentId: number, data: { employeeId: string; documentType: string }, file?: File) => {
  const form = new FormData();
  form.append('data', JSON.stringify(data));
  if (file) form.append('file', file);

  const resp = await fetch(`${API_BASE}/${encodeURIComponent(employeeId)}/${documentId}`, {
    method: 'PUT',
    body: form,
    headers: { ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const deleteDocument = async (employeeId: string, documentId: number) => {
  const resp = await fetch(`${API_BASE}/${encodeURIComponent(employeeId)}/${documentId}`, {
    method: 'DELETE',
    headers: { ...getAuthHeader() },
    credentials: 'include',
  });
  if (resp.status === 204) return true;
  await throwIfError(resp);
  return parseText(resp);
};

export const getStatusForEmployee = async (employeeId: string) => {
  const resp = await fetch(`${API_BASE}/status/${encodeURIComponent(employeeId)}`, {
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};

export const getStatusAll = async () => {
  const resp = await fetch(`${API_BASE}/status`, {
    headers: { Accept: 'application/json', ...getAuthHeader() },
    credentials: 'include',
  });
  await throwIfError(resp);
  return parseText(resp);
};
