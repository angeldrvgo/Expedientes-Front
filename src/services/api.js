export function errorMessage(detail) {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail
      .map(
        (item) =>
          `${(item.loc || []).filter((x) => x !== "body").join(" · ")}: ${item.msg}`,
      )
      .join(". ");
  return "No se pudo completar la solicitud. Inténtalo nuevamente.";
}

export function createApi({
  base = "/api",
  getToken,
  onUnauthorized,
  fetcher = fetch,
}) {
  return async function api(path, { method = "GET", body, signal } = {}) {
    let response;
    try {
      const token = getToken();
      response = await fetcher(`${base.replace(/\/$/, "")}${path}`, {
        method,
        signal,
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
      });
    } catch (error) {
      if (error.name === "AbortError") throw error;
      throw new Error(
        "No se pudo conectar con el servidor. Comprueba que el backend esté iniciado.",
      );
    }
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && path !== "/auth/login") onUnauthorized();
      throw new Error(
        data
          ? errorMessage(data.detail)
          : "El servidor no está disponible. Comprueba el backend e inténtalo de nuevo.",
      );
    }
    return data;
  };
}

// Las listas de la API admiten como máximo 100 registros por petición.
export async function allPages(api, path) {
  const result = [];
  for (let offset = 0; ; offset += 100) {
    const page = await api(
      `${path}${path.includes("?") ? "&" : "?"}limit=100&offset=${offset}`,
    );
    result.push(...page);
    if (page.length < 100) return result;
  }
}
