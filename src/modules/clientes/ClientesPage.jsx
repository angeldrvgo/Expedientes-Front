import { useState, useEffect } from "react";
import Icon from "../../components/Icon";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Empty from "../../components/Empty";
import ClienteForm from "./ClienteForm";

function ClientesPage({ api, user, revision, saved }) {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [offset, setOffset] = useState(0),
    [modal, setModal] = useState(null),
    [reload, setReload] = useState(0);
  const staff = ["administrador", "asistente"].includes(user.rol),
    canCreate = staff;
  const singular = "cliente";
  useEffect(() => {
    const t = setTimeout(() => {
      setQuery(search.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const params = new URLSearchParams({
      limit: "20",
      offset: String(offset),
    });
    if (query) params.set("q", query);
    api(`/clientes?${params}`, {
      signal: controller.signal,
    })
      .then(setItems)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, offset, revision, reload]);
  function complete(message) {
    setModal(null);
    saved(message);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Clientes</h1>
        </div>
        {canCreate && (
          <button
            className="primary"
            onClick={() =>
              setModal({
                mode: "create",
              })
            }
          >
            <Icon name="plus" size={18} />
            Nuevo {singular}
          </button>
        )}
      </div>
      <section className="panel">
        <div className="filters">
          {
            <label className="search">
              <Icon name="search" size={18} />
              <input
                aria-label={`Buscar clientes`}
                placeholder={"Buscar nombre o documento…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          }
          {false}
          <button
            className="text-button"
            onClick={() => setReload((v) => v + 1)}
            disabled={loading}
          >
            Actualizar
          </button>
        </div>
        <Alert>{error}</Alert>
        {loading ? (
          <p className="loading" role="status">
            Cargando {"clientes"}…
          </p>
        ) : error ? (
          <Empty
            text="No se pudo cargar la lista"
            detail="Pulsa Actualizar para volver a intentarlo."
          />
        ) : !items.length ? (
          <Empty
            text={query ? "Sin resultados" : `Aún no hay clientes`}
            detail="Prueba otros filtros o registra un nuevo elemento si tienes permiso."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {["Cliente", "Documento", "Contacto", "Tipo", ""].map(
                    (h, i) => (
                      <th key={i}>{h}</th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {
                      <>
                        <td>
                          <strong>{item.nombre_completo_razon_social}</strong>
                        </td>
                        <td>
                          {item.tipo_documento} {item.numero_documento || "—"}
                        </td>
                        <td>
                          {item.correo || "—"}
                          <small>{item.telefono}</small>
                        </td>
                        <td>
                          <Badge tone="neutral">
                            {item.tipo_persona === "juridica"
                              ? "Jurídica"
                              : "Natural"}
                          </Badge>
                        </td>
                        <td>
                          {staff && (
                            <button
                              className="row-action"
                              onClick={() =>
                                setModal({
                                  mode: "edit",
                                  item,
                                })
                              }
                            >
                              Editar
                            </button>
                          )}
                        </td>
                      </>
                    }
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="pagination">
          <span>
            {items.length ? `${offset + 1}–${offset + items.length}` : "0"}{" "}
            registros · Página {offset / 20 + 1}
          </span>
          <div>
            <button
              disabled={offset === 0 || loading}
              onClick={() => setOffset((v) => v - 20)}
            >
              Anterior
            </button>
            <button
              disabled={items.length < 20 || loading || Boolean(error)}
              onClick={() => setOffset((v) => v + 20)}
            >
              Siguiente
            </button>
          </div>
        </div>
      </section>
      {modal && (
        <ClienteForm
          api={api}
          item={modal.item}
          user={user}
          close={() => setModal(null)}
          complete={complete}
        />
      )}
    </>
  );
}
export default ClientesPage;
