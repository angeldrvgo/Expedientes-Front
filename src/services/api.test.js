import test from "node:test";
import assert from "node:assert/strict";
import { createApi, allPages } from "./api.js";

test("envía bearer y JSON al guardar datos", async () => {
  let request;
  const api = createApi({
    getToken: () => "session",
    fetcher: async (url, options) => {
      request = { url, ...options };
      return new Response(JSON.stringify({ id: 1 }), { status: 201 });
    },
  });
  assert.deepEqual(
    await api("/clientes", { method: "POST", body: { nombre: "Ana" } }),
    { id: 1 },
  );
  assert.equal(request.url, "/api/clientes");
  assert.equal(request.headers.Authorization, "Bearer session");
  assert.equal(request.body, '{"nombre":"Ana"}');
});
test("revoca la sesión ante 401 excepto en login", async () => {
  let expired = 0;
  const api = createApi({
    getToken: () => null,
    onUnauthorized: () => expired++,
    fetcher: async () =>
      new Response('{"detail":"Sesión vencida"}', { status: 401 }),
  });
  await assert.rejects(api("/auth/login"), /Sesión vencida/);
  assert.equal(expired, 0);
  await assert.rejects(api("/auth/me"), /Sesión vencida/);
  assert.equal(expired, 1);
});
test("muestra errores de validación y problemas de conectividad", async () => {
  const api = createApi({
    getToken: () => null,
    fetcher: async () =>
      new Response(
        JSON.stringify({
          detail: [{ loc: ["body", "correo"], msg: "Correo inválido" }],
        }),
        { status: 422 },
      ),
  });
  await assert.rejects(api("/clientes"), /correo: Correo inválido/);
  const offline = createApi({
    getToken: () => null,
    fetcher: async () => {
      throw new TypeError("fetch failed");
    },
  });
  await assert.rejects(offline("/clientes"), /backend esté iniciado/);
});
test("carga todas las páginas de selectores y resumen", async () => {
  const paths = [];
  const values = await allPages(async (path) => {
    paths.push(path);
    return paths.length === 1
      ? Array.from({ length: 100 }, (_, id) => ({ id }))
      : [{ id: 100 }];
  }, "/expedientes?incluir_archivados=true");
  assert.equal(values.length, 101);
  assert.equal(
    paths[1],
    "/expedientes?incluir_archivados=true&limit=100&offset=100",
  );
});
