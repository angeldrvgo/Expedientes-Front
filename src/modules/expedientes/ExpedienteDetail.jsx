import { useState, useEffect } from "react";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Field from "../../components/Field";
import Modal from "../../components/Modal";
import ExpedienteForm from "./ExpedienteForm";
import { date } from "../../utils/formatters";
import { person } from "../../utils/formatters";
import { allPages } from "../../services/api";

function ExpedienteDetail({ api, initial, user, close, saved }) {
  const [item, setItem] = useState(initial),
    [history, setHistory] = useState(null),
    [assignments, setAssignments] = useState(null),
    [client, setClient] = useState(null),
    [error, setError] = useState(""),
    [action, setAction] = useState(""),
    [lawyers, setLawyers] = useState([]),
    [busy, setBusy] = useState(false),
    [editing, setEditing] = useState(false);
  const staff = user.rol !== "abogado";
  async function load() {
    setError("");
    try {
      const fresh = await api(`/expedientes/${initial.id}`);
      setItem(fresh);
      const [h, a, c] = await Promise.all([
        allPages(api, `/expedientes/${initial.id}/historial-estados`),
        api(`/expedientes/${initial.id}/responsables`),
        api(`/clientes/${fresh.cliente_id}`),
      ]);
      setHistory(h);
      setAssignments(a);
      setClient(c);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    load();
  }, []);
  async function startAction(name) {
    setError("");
    if (name === "responsable") {
      try {
        setLawyers(
          await allPages(api, "/expedientes/responsables-disponibles"),
        );
      } catch (e) {
        setError(e.message);
        return;
      }
    }
    setAction(name);
  }
  async function change(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const body =
        action === "responsable"
          ? {
              responsable_id: Number(data.get("responsable_id")),
            }
          : {
              motivo: data.get("motivo").trim(),
            };
      const updated = await api(`/expedientes/${item.id}/${action}`, {
        method: action === "responsable" ? "PUT" : "POST",
        body,
      });
      setItem(updated);
      setAction("");
      saved("Expediente actualizado.");
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (editing)
    return (
      <ExpedienteForm
        api={api}
        item={item}
        user={user}
        close={() => setEditing(false)}
        complete={(message) => {
          setEditing(false);
          saved(message);
          load();
        }}
      />
    );
  return (
    <Modal title={item.identificador} onClose={() => !busy && close()}>
      <div className="detail-tags">
        <Badge>{item.estado_administrativo}</Badge>
        <Badge>{item.prioridad}</Badge>
      </div>
      <Alert>{error}</Alert>
      {error && (
        <button className="text-button" onClick={load}>
          Reintentar carga del detalle
        </button>
      )}
      <dl className="detail-grid">
        {[
          [
            "Cliente",
            client?.nombre_completo_razon_social ||
              `Cliente #${item.cliente_id}`,
          ],
          ["Materia", item.materia],
          ["Órgano competente", item.organo_competente],
          ["Estado procesal", item.estado_procesal],
          ["Contraparte", item.contraparte || "—"],
          ["Responsable actual", item.responsable_nombre || "Sin responsable"],
          ["Registrado", date(item.creado_en)],
          ["Actualizado", date(item.actualizado_en)],
        ].map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <div className="description">
        <h3>Descripción</h3>
        <p>{item.descripcion || "Sin descripción registrada."}</p>
      </div>
      <div className="detail-actions">
        {item.estado_administrativo === "abierto" && (
          <button onClick={() => setEditing(true)}>Editar expediente</button>
        )}
        {staff && item.estado_administrativo === "abierto" && (
          <button onClick={() => startAction("responsable")}>
            Reasignar responsable
          </button>
        )}
        {user.rol === "abogado" &&
          item.responsable_id === user.id &&
          item.estado_administrativo !== "archivado" && (
            <button
              className="primary"
              onClick={() =>
                startAction(
                  item.estado_administrativo === "abierto"
                    ? "cerrar"
                    : "archivar",
                )
              }
            >
              {item.estado_administrativo === "abierto"
                ? "Cerrar expediente"
                : "Archivar expediente"}
            </button>
          )}
      </div>
      {action && (
        <form className="action-form" onSubmit={change}>
          <h3>
            {action === "responsable"
              ? "Nuevo responsable"
              : action === "cerrar"
                ? "Cerrar expediente"
                : "Archivar expediente"}
          </h3>
          <p className="muted">
            {action === "responsable"
              ? "La asignación anterior se conservará en el historial."
              : "Esta transición no tiene una opción de reapertura en el sistema actual."}
          </p>
          {action === "responsable" ? (
            <Field label="Abogado activo *">
              <select name="responsable_id" required defaultValue="">
                <option value="" disabled>
                  Seleccionar abogado
                </option>
                {lawyers
                  .filter((l) => l.id !== item.responsable_id)
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {person(l)}
                    </option>
                  ))}
              </select>
            </Field>
          ) : (
            <Field label="Motivo *">
              <textarea
                name="motivo"
                required
                minLength={1}
                maxLength={2000}
                rows={3}
              />
            </Field>
          )}
          <div className="modal-actions">
            <button type="button" disabled={busy} onClick={() => setAction("")}>
              Cancelar
            </button>
            <button className="primary" disabled={busy}>
              {busy ? "Guardando…" : "Confirmar"}
            </button>
          </div>
        </form>
      )}
      <section className="history">
        <h3>Historial de responsables</h3>
        {assignments ? (
          assignments.length ? (
            assignments.map((a) => (
              <div className="timeline" key={a.id}>
                <span className="timeline-dot" />
                <div>
                  <strong>{a.responsable_nombre}</strong>
                  <p>
                    {date(a.fecha_inicio)} →{" "}
                    {a.fecha_fin ? date(a.fecha_fin) : "Actual"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">Sin asignaciones registradas.</p>
          )
        ) : (
          <p className="muted">{error ? "No disponible." : "Cargando…"}</p>
        )}
        <h3>Historial de estados</h3>
        {history ? (
          history.length ? (
            history.map((h) => (
              <div className="timeline" key={h.id}>
                <span className="timeline-dot" />
                <div>
                  <strong>
                    {h.estado_anterior} → {h.estado_nuevo}
                  </strong>
                  <p>{h.motivo}</p>
                  <small>
                    {date(h.realizado_en)} · Usuario #{h.realizado_por}
                  </small>
                </div>
              </div>
            ))
          ) : (
            <p className="muted">Sin cambios de estado registrados.</p>
          )
        ) : (
          <p className="muted">{error ? "No disponible." : "Cargando…"}</p>
        )}
      </section>
    </Modal>
  );
}
export default ExpedienteDetail;
