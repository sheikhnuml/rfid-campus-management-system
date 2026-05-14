// src/api.js
const BASE = "http://localhost:4000/api";

async function request(path, { method = "GET", body, headers = {} } = {}) {
  const token = localStorage.getItem("token");
  const url = `${BASE}${path}`;

  const opts = {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
  };

  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(url, opts);

  // Try parse JSON safely
  let data;
  try {
    data = await res.json();
  } catch (e) {
    if (!res.ok) throw new Error("Server error");
    return null;
  }

  if (!res.ok) {
    // API expected shape { message: "..." } or { error: "..." }
    const msg = data?.message || data?.error || "Request failed";
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  return data;
}

export async function apiGet(path) {
  return request(path, { method: "GET" });
}

export async function apiPost(path, body) {
  return request(path, { method: "POST", body });
}

export async function apiPut(path, body) {
  return request(path, { method: "PUT", body });
}

export async function apiDelete(path, body) {
  return request(path, { method: "DELETE", body });
}
