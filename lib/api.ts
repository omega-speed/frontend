import { getAccessToken, refreshAccessToken } from "./auth";

const url = process.env.BASE_URL;
const getAuthHeader = async (): Promise<Record<string, string>> => {
  const token = await getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => {
      return { message: "Network response was not ok" };
    });
    return { ...errorData, status: response.status };
  }
  const text = await response.text();
  if (!text) return { success: true };
  return JSON.parse(text);
};

const handleResponseWithRefresh = async (
  response: Response,
  retryFn: (token: string) => Promise<Response>,
) => {
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryResponse = await retryFn(newToken);
      return handleResponse(retryResponse);
    }
  }
  return handleResponse(response);
};

export const api = {
  get: async (endpoint: string, params?: RequestInit) => {
    const headers = await getAuthHeader();

    const response = await fetch(`${url}/${endpoint}`, {
      headers,
      cache: "no-store",
      ...params,
    });
    return handleResponseWithRefresh(response, (token) =>
      fetch(`${url}/${endpoint}`, {
        headers: { ...headers, Authorization: `Bearer ${token}` },
        cache: "no-store",
        ...params,
      }),
    );
  },

  post: async (endpoint: string, payload: unknown) => {
    const headers = await getAuthHeader();
    const body = JSON.stringify(payload);
    const response = await fetch(`${url}/${endpoint}`, {
      method: "POST",
      headers,
      body,
    });
    return handleResponseWithRefresh(response, (token) =>
      fetch(`${url}/${endpoint}`, {
        method: "POST",
        headers: { ...headers, Authorization: `Bearer ${token}` },
        body,
      }),
    );
  },

  put: async (endpoint: string, payload: unknown) => {
    const headers = await getAuthHeader();
    const body = JSON.stringify(payload);
    const response = await fetch(`${url}/${endpoint}`, {
      method: "PUT",
      headers,
      body,
    });
    return handleResponseWithRefresh(response, (token) =>
      fetch(`${url}/${endpoint}`, {
        method: "PUT",
        headers: { ...headers, Authorization: `Bearer ${token}` },
        body,
      }),
    );
  },

  patch: async (endpoint: string, payload: unknown) => {
    const headers = await getAuthHeader();
    const body = JSON.stringify(payload);
    const response = await fetch(`${url}/${endpoint}`, {
      method: "PATCH",
      headers,
      body,
    });
    return handleResponseWithRefresh(response, (token) =>
      fetch(`${url}/${endpoint}`, {
        method: "PATCH",
        headers: { ...headers, Authorization: `Bearer ${token}` },
        body,
      }),
    );
  },

  delete: async (endpoint: string, payload?: unknown) => {
    const headers = await getAuthHeader();
    const body = payload ? JSON.stringify(payload) : undefined;
    const response = await fetch(`${url}/${endpoint}`, {
      method: "DELETE",
      headers,
      body,
    });
    return handleResponseWithRefresh(response, (token) =>
      fetch(`${url}/${endpoint}`, {
        method: "DELETE",
        headers: { ...headers, Authorization: `Bearer ${token}` },
        body,
      }),
    );
  },

  formData: async (endpoint: string, formData: FormData) => {
    const token = await getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${url}/${endpoint}`, {
      method: "POST",
      headers,
      body: formData,
    });
    return handleResponseWithRefresh(response, async (newToken) =>
      fetch(`${url}/${endpoint}`, {
        method: "POST",
        headers: { ...headers, Authorization: `Bearer ${newToken}` },
        body: formData,
      }),
    );
  },
};

export default api;
