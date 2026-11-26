/** Single place where back-end URLs are declared (no string literals in services). */
const API_ROOT = '/api';

export const API_ENDPOINTS = {
  auth: {
    prefix: `${API_ROOT}/auth/`,
    login: `${API_ROOT}/auth/login`,
    register: `${API_ROOT}/auth/register`,
    refresh: `${API_ROOT}/auth/refresh`,
    logout: `${API_ROOT}/auth/logout`,
  },
  documents: {
    base: `${API_ROOT}/documents`,
    facets: `${API_ROOT}/documents/facets`,
    upload: `${API_ROOT}/documents/upload`,
    importXml: `${API_ROOT}/documents/import/xml`,
    exportXml: `${API_ROOT}/documents/export/xml`,
    file: (id: string) => `${API_ROOT}/documents/${id}/file`,
    dublinCore: (id: string) => `${API_ROOT}/documents/${id}/export/xml`,
  },
  assistant: {
    ask: `${API_ROOT}/assistant/ask`,
  },
} as const;
