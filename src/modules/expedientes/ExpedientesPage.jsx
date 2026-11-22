import { useState, useEffect } from "react";
import Icon from "../../components/Icon";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Empty from "../../components/Empty";
import ExpedienteForm from "./ExpedienteForm";
import ExpedienteDetail from "./ExpedienteDetail";

function ExpedientesPage({ api, user, revision, saved }) {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [priority, setPriority] = useState(""),
    [offset, setOffset] = useState(0),
    [modal, setModal] = useState(null),
    [detail, setDetail] = useState(null),
    [reload, setReload] = useState(0);
  const staff = ["administrador", "asistente"].includes(user.rol),
    canCreate = staff;
  const singular = "expediente";
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
    {
      if (status) params.set("estado_administrativo", status);
      if (priority) params.set("prioridad", priority);
    }
    api(`/expedientes?${params}`, {
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
  }, [query, status, priority, offset, revision, reload]);
  function complete(message) {
    setModal(null);
    saved(message);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Expedientes</h1>
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
                aria-label={`Buscar expedientes`}
                placeholder={"Buscar identificador o materia…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
          }
          {
            <>
              <select
                aria-label="Filtrar estado"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setOffset(0);
                }}
              >
                <option value="">Sin archivados</option>
                {["abierto", "cerrado", "archivado"].map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
              <select
                aria-label="Filtrar prioridad"
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setOffset(0);
                }}
              >
                <option value="">Todas las prioridades</option>
                {["baja", "normal", "alta", "urgente"].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </>
          }
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
            Cargando {"expedientes"}…
          </p>
        ) : error ? (
          <Empty
            text="No se pudo cargar la lista"
            detail="Pulsa Actualizar para volver a intentarlo."
          />
        ) : !items.length ? (
          <Empty
            text={
              query || status || priority
                ? "Sin resultados"
                : `Aún no hay expedientes`
            }
            detail="Prueba otros filtros o registra un nuevo elemento si tienes permiso."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {[
                    "Expediente / órgano",
                    "Materia",
                    "Responsable",
                    "Prioridad",
                    "Estado",
                    "",
                  ].map((h, i) => (
                    <th key={i}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {
                      <>
                        <td>
                          <button
                            className="record-link"
                            onClick={() => setDetail(item)}
                          >
                            {item.identificador}
                          </button>
                          <small>{item.organo_competente}</small>
                        </td>
                        <td>{item.materia}</td>
                        <td>{item.responsable_nombre || "Sin responsable"}</td>
                        <td>
                          <Badge>{item.prioridad}</Badge>
                        </td>
                        <td>
                          <Badge>{item.estado_administrativo}</Badge>
                        </td>
                        <td>
                          <button
                            className="row-action"
                            onClick={() => setDetail(item)}
                          >
                            Ver detalle <Icon name="arrow" size={15} />
                          </button>
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
        <ExpedienteForm
          api={api}
          item={modal.item}
          user={user}
          close={() => setModal(null)}
          complete={complete}
        />
      )}
      {detail && (
        <ExpedienteDetail
          key={detail.id}
          api={api}
          initial={detail}
          user={user}
          close={() => setDetail(null)}
          saved={saved}
        />
      )}
    </>
  );
}
export default ExpedientesPage;
