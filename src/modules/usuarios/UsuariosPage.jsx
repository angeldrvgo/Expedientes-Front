import { useState, useEffect } from "react";
import Icon from "../../components/Icon";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Empty from "../../components/Empty";
import UsuarioForm from "./UsuarioForm";
import UsuarioStatus from "./UsuarioStatus";
import { person } from "../../utils/formatters";
import { roleNames } from "./constants";

function UsuariosPage({ api, user, revision, saved }) {
  const [items, setItems] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [search, setSearch] = useState(""),
    [query, setQuery] = useState(""),
    [offset, setOffset] = useState(0),
    [modal, setModal] = useState(null),
    [reload, setReload] = useState(0);
  const staff = ["administrador", "asistente"].includes(user.rol),
    canCreate = user.rol === "administrador";
  const singular = "usuario";
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
    api(`/usuarios?${params}`, {
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
          <h1>Usuarios</h1>
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
          {false}
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
            Cargando {"usuarios"}…
          </p>
        ) : error ? (
          <Empty
            text="No se pudo cargar la lista"
            detail="Pulsa Actualizar para volver a intentarlo."
          />
        ) : !items.length ? (
          <Empty
            text={query ? "Sin resultados" : `Aún no hay usuarios`}
            detail="Prueba otros filtros o registra un nuevo elemento si tienes permiso."
          />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  {["Usuario", "Correo", "Rol", "Estado", ""].map((h, i) => (
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
                          <strong>{person(item)}</strong>
                        </td>
                        <td>{item.correo}</td>
                        <td>{roleNames[item.rol]}</td>
                        <td>
                          <Badge tone={item.activo ? "abierto" : "cerrado"}>
                            {item.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td>
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
                          <button
                            className="row-action"
                            disabled={item.id === user.id}
                            onClick={() =>
                              setModal({
                                mode: "status",
                                item,
                              })
                            }
                          >
                            {item.activo ? "Desactivar" : "Activar"}
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
      {modal &&
        (modal.mode === "status" ? (
          <UsuarioStatus
            api={api}
            item={modal.item}
            close={() => setModal(null)}
            complete={complete}
          />
        ) : (
          <UsuarioForm
            api={api}
            item={modal.item}
            user={user}
            close={() => setModal(null)}
            complete={complete}
          />
        ))}
    </>
  );
}
export default UsuariosPage;
