import { clearStoredAuth, readStoredAuth, writeStoredAuth } from "./authStorage";

export const authHeader = () => {
  const auth = readStoredAuth();
  const accessToken =
    auth?.access || auth?.token || auth?.accessToken || auth?.access_token;

  if (!accessToken) {
    return {};
  }

  const prefix =
    import.meta.env.VITE_AUTH_HEADER_PREFIX ||
    preferredAuthHeaderPrefix ||
    "Bearer";

  return {
    Authorization: `${prefix} ${accessToken}`,
    "Content-Type": "application/json",
  };
};

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const requestBaseUrl = apiBaseUrl;
const defaultAuthHeaderPrefix = import.meta.env.VITE_AUTH_HEADER_PREFIX || "Bearer";
const defaultCredentialsMode = import.meta.env.VITE_API_CREDENTIALS_MODE || "same-origin";
const authHeaderPrefixStorageKey = "conference_admin_auth_header_prefix";
let preferredAuthHeaderPrefix =
  localStorage.getItem(authHeaderPrefixStorageKey) || defaultAuthHeaderPrefix;
const inFlightGetRequests = new Map();

function readCookie(name) {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function getCsrfToken() {
  return readCookie("csrftoken") || readCookie("csrf") || readCookie("csrf_token") || null;
}

async function refreshAccessToken(refresh) {
  const response = await fetch(`${requestBaseUrl}/auth/jwt/refresh/`, {
    method: "POST",
    credentials: defaultCredentialsMode,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error = new Error(data?.detail || data?.message || "Token refresh failed.");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

async function apiRequestUncached(
  path,
  {
    token,
    headers,
    authHeaderPrefix,
    csrf = false,
    _refreshTried = false,
    _altPrefixTried = false,
    ...options
  } = {},
) {
  const storedAuth = readStoredAuth();
  const resolvedToken = token || storedAuth?.access || null;
  const resolvedPrefix =
    authHeaderPrefix ||
    preferredAuthHeaderPrefix ||
    defaultAuthHeaderPrefix;

  const csrfToken = csrf ? getCsrfToken() : null;

  const isFormData = options.body instanceof FormData;

  const response = await fetch(`${requestBaseUrl}${path}`, {
    ...options,
    credentials: defaultCredentialsMode,
    headers: {
      accept: "application/json",

      // FIX
      ...(options.body && !isFormData
        ? { "Content-Type": "application/json" }
        : {}),

      ...(resolvedToken
        ? { Authorization: `${resolvedPrefix} ${resolvedToken}` }
        : {}),

      ...(csrfToken
        ? { "X-CSRFTOKEN": csrfToken }
        : {}),

      ...headers,
    },
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      if (resolvedToken && !_altPrefixTried) {
        const alternatePrefix =
          resolvedPrefix.toLowerCase() === "jwt"
            ? "Bearer"
            : "JWT";

        return apiRequestUncached(path, {
          token: resolvedToken,
          headers,
          authHeaderPrefix: alternatePrefix,
          _refreshTried,
          _altPrefixTried: true,
          ...options,
        });
      }

      const refresh = storedAuth?.refresh || null;

      if (refresh && !_refreshTried) {
        try {
          const refreshed = await refreshAccessToken(refresh);
          const nextAccess = refreshed?.access;

          if (nextAccess) {
            writeStoredAuth({
              ...(storedAuth || {}),
              access: nextAccess,
            });

            return apiRequestUncached(path, {
              token: nextAccess,
              headers,
              authHeaderPrefix: resolvedPrefix,
              _refreshTried: true,
              _altPrefixTried,
              ...options,
            });
          }
        } catch (refreshError) {
          if (
            refreshError?.status === 401 ||
            refreshError?.status === 403
          ) {
            clearStoredAuth();
          }
        }
      }
    }

    const message =
      data?.detail ||
      data?.message ||
      (typeof data === "object" && data !== null
        ? Object.values(data).flat().join(" ")
        : null) ||
      "Request failed.";

    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  if (
    resolvedToken &&
    resolvedPrefix &&
    resolvedPrefix !== preferredAuthHeaderPrefix
  ) {
    preferredAuthHeaderPrefix = resolvedPrefix;
    localStorage.setItem(
      authHeaderPrefixStorageKey,
      resolvedPrefix
    );
  }

  return data;
}

async function apiRequest(path, options = {}) {
  const method = (options?.method || "GET").toUpperCase();
  if (method !== "GET") {
    return apiRequestUncached(path, options);
  }

  const storedAuth = readStoredAuth();
  const resolvedToken = options?.token || storedAuth?.access || null;
  const resolvedPrefix = options?.authHeaderPrefix || preferredAuthHeaderPrefix || defaultAuthHeaderPrefix;
  const csrfToken = options?.csrf ? getCsrfToken() : null;
  const key = `GET:${requestBaseUrl}${path}:auth=${resolvedPrefix}:${resolvedToken || ""}:csrf=${csrfToken || ""}`;

  const existing = inFlightGetRequests.get(key);
  if (existing) {
    return existing;
  }

  const promise = apiRequestUncached(path, options).finally(() => {
    inFlightGetRequests.delete(key);
  });
  inFlightGetRequests.set(key, promise);
  return promise;
}

export function getApiDisplayUrl(path) {
  return `${requestBaseUrl}${path}`;
}

export async function loginUser(credentials) {
  return apiRequest("/auth/jwt/create/", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function getCurrentUser(token) {
  return apiRequest("/auth/users/me/", {
    method: "GET",
    token,
  });
}

export async function getUsers(token, page = 1) {
  return apiRequest(`/auth/users/?page=${page}`, {
    method: "GET",
    token,
  });
}

export async function createUser(payload, token) {
  try {
    return await apiRequest("/auth/users/", {
      method: "POST",
      token,
      body: JSON.stringify(payload),
      csrf: true,
    });
  } catch (error) {
    if (error?.status !== 400 || !error?.data || typeof error.data !== "object") {
      throw error;
    }

    const retryPayload = { ...payload };
    let shouldRetry = false;

    // Common Djoser setting: USER_CREATE_PASSWORD_RETYPE=True
    if (error.data?.re_password && payload?.password && !payload?.re_password) {
      retryPayload.re_password = payload.password;
      shouldRetry = true;
    }

    // Some setups still require username even when using email auth.
    if (error.data?.username && payload?.email && !payload?.username) {
      retryPayload.username = String(payload.email).split("@")[0] || payload.email;
      shouldRetry = true;
    }

    if (!shouldRetry) {
      throw error;
    }

    return apiRequest("/auth/users/", {
      method: "POST",
      token,
      body: JSON.stringify(retryPayload),
      csrf: true,
    });
  }
}

export async function updateUser({ id, payload, token, isCurrentUser }) {
  const path = isCurrentUser ? "/auth/users/me/" : `/auth/users/${id}/`;

  try {
    return await apiRequest(path, {
      method: "PATCH",
      token,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error.status !== 405) {
      throw error;
    }

    return apiRequest(path, {
      method: "PUT",
      token,
      body: JSON.stringify(payload),
    });
  }
}

export async function deleteUser(id, token) {
  return apiRequest(`/auth/users/${id}/`, {
    method: "DELETE",
    token,
    csrf: true,
  });
}

export async function createConference(payload, token) {
  return apiRequest("/api/v1/conferences/", {
    method: "POST",
    token,
    csrf: true,
    body: JSON.stringify(payload),
  });
}

export async function getConferences(token, page = 1) {
  return apiRequest(`/api/v1/conferences/?page=${page}`, {
    method: "GET",
    token,
    csrf: true,
  });
}

export async function getConference(id, token) {
  return apiRequest(`/api/v1/conferences/${id}/`, {
    method: "GET",
    token,
    csrf: true,
  });
}

export async function getAboutEvents(conferenceId, token, page = 1) {
  if (page === 1) {
    return apiRequest(`/api/v1/conferences/${conferenceId}/about-event/`, {
      method: "GET",
      token,
      csrf: true,
    });
  }

  const paginatedPath = `/api/v1/conferences/${conferenceId}/about-event/?page=${page}`;

  try {
    return await apiRequest(paginatedPath, {
      method: "GET",
      token,
      csrf: true,
    });
  } catch (error) {
    // Some deployments expose the nested collection without pagination support.
    if (error?.status !== 404 && error?.status !== 500) {
      throw error;
    }

    return apiRequest(`/api/v1/conferences/${conferenceId}/about-event/`, {
      method: "GET",
      token,
      csrf: true,
    });
  }
}

export async function createAboutEvent(conferenceId, payload, token) {
  return apiRequest(`/api/v1/conferences/${conferenceId}/about-event/`, {
    method: "POST",
    token,
    csrf: true,
    body: JSON.stringify(payload),
  });
}

export async function updateAboutEvent(conferenceId, aboutEventId, payload, token) {
  const path = `/api/v1/conferences/${conferenceId}/about-event/${aboutEventId}/`;

  try {
    return await apiRequest(path, {
      method: "PATCH",
      token,
      csrf: true,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error?.status !== 405) {
      throw error;
    }

    return apiRequest(path, {
      method: "PUT",
      token,
      csrf: true,
      body: JSON.stringify(payload),
    });
  }
}

export async function deleteAboutEvent(conferenceId, aboutEventId, token) {
  return apiRequest(`/api/v1/conferences/${conferenceId}/about-event/${aboutEventId}/`, {
    method: "DELETE",
    token,
    csrf: true,
  });
}

export function getAdminAboutEventChangeUrl(id) {
  return `${requestBaseUrl}/admin/cms/aboutevent/${id}/change/`;
}

export function getAdminAboutEventDeleteUrl(id) {
  return `${requestBaseUrl}/admin/cms/aboutevent/${id}/delete/`;
}

export function getAdminAboutEventListUrl() {
  return `${requestBaseUrl}/admin/cms/aboutevent/`;
}

export async function updateConference(id, payload, token) {
  const path = `/api/v1/conferences/${id}/`;

  try {
    return await apiRequest(path, {
      method: "PATCH",
      token,
      csrf: true,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error?.status !== 405) {
      throw error;
    }

    return apiRequest(path, {
      method: "PUT",
      token,
      csrf: true,
      body: JSON.stringify(payload),
    });
  }
}

export async function deleteConference(id, token) {
  return apiRequest(`/api/v1/conferences/${id}/`, {
    method: "DELETE",
    token,
    csrf: true,
  });
}

export function getAdminConferenceChangeUrl(id) {
  return `${requestBaseUrl}/admin/conferences/conference/${id}/change/`;
}

export function getAdminConferenceDeleteUrl(id) {
  return `${requestBaseUrl}/admin/conferences/conference/${id}/delete/`;
}

export async function getConferenceTracks(conferencePk) {
  return apiRequest(
    `/api/v1/conferences/${conferencePk}/register/tracks/`,
    {
      method: "GET",
    }
  );
}

export const getConferenceRegisterFormOptions = async (
  conferencePk
) => {
  const res = await fetch(
    `${requestBaseUrl}/api/v1/conferences/${conferencePk}/register/form-options/`,
    {
      headers: authHeader(),
    }
  );

  return res.json();
};

export const getConferenceFeeSummary = async (
  conferencePk,
  payload
) => {
  const res = await fetch(
    `${requestBaseUrl}/api/v1/conferences/${conferencePk}/register/fee-summary/`,
    {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw json;
  }

  return json;
};

export const createConferenceRegistration = async (
  conferencePk,
  payload
) => {
  const res = await fetch(
    `${requestBaseUrl}/api/v1/conferences/${conferencePk}/register/`,
    {
      method: "POST",
      headers: authHeader(),
      body: JSON.stringify(payload),
    }
  );

  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    console.error("RAW SERVER RESPONSE =", text);
    const titleMatch = text.match(/<title>\s*([^<]+?)\s*<\/title>/i);
    const detailMatch = text.match(
      /<pre class="exception_value">([\s\S]*?)<\/pre>/i
    );

    const errorTitle = titleMatch?.[1]
      ?.replace(/\s+at\s+.+$/i, "")
      .trim();
    const errorDetail = detailMatch?.[1]
      ?.replace(/&quot;/g, '"')
      ?.replace(/&#x27;/g, "'")
      ?.replace(/&amp;/g, "&")
      ?.trim();

    const message = [errorTitle, errorDetail]
      .filter(Boolean)
      .join(": ");

    throw new Error(message || "Server returned HTML instead of JSON");
  }

  console.log("REGISTER API RESPONSE =", json);

  if (!res.ok) throw json;

  return json;
};

export const getConferenceRegistration = async (
  conferencePk,
  registrationId
) => {
  const res = await fetch(
    `${requestBaseUrl}/api/v1/conferences/${conferencePk}/register/${registrationId}/`,
    {
      headers: authHeader(),
    }
  );

  const json = await res.json().catch(() => null);

  if (!res.ok) {
    throw json || new Error(`Request failed with status ${res.status}`);
  }

  return json;
};

export const payConferenceRegistration = async (
  conferencePk,
  registrationId
) => {
  const res = await fetch(
    `${requestBaseUrl}/api/v1/conferences/${conferencePk}/register/${registrationId}/pay/`,
    {
      method: "POST",
      headers: authHeader(),
    }
  );

  const json = await res.json();

  if (!res.ok) {
    throw json;
  }

  return json;
};
export { apiRequest };
