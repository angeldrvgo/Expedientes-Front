import { useState, useEffect } from "react";
import Alert from "../../components/Alert";
import Field from "../../components/Field";
import Modal from "../../components/Modal";
import { person } from "../../utils/formatters";
import { optional } from "../../utils/formatters";
import { emptyCase } from "./constants";
import { allPages } from "../../services/api";

function ExpedienteForm({ api, item, user, close, complete }) {
  const [values, setValues] = useState(() => ({
    ...emptyCase,
    ...item,
  }));
  const [clients, setClients] = useState([]),
    [lawyers, setLawyers] = useState([]),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const staff = user.rol !== "abogado";
  async function options() {
    setError("");
    try {
      const [c, l] = await Promise.all([
        allPages(api, "/clientes"),
        !item
          ? allPages(api, "/expedientes/responsables-disponibles")
          : Promise.resolve([]),
      ]);
      setClients(c);
      setLawyers(l);
      setReady(true);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => {
    options();
  }, []);
  function input(key, options = {}) {
    return (
      <input
        value={values[key] ?? ""}
        onChange={(e) =>
          setValues((v) => ({
            ...v,
            [key]: e.target.value,
          }))
        }
        {...options}
      />
    );
  }
  function select(key, choices, options = {}) {
    return (
      <select
        value={values[key] ?? ""}
        onChange={(e) =>
          setValues((v) => ({
            ...v,
            [key]: e.target.value,
          }))
        }
        {...options}
      >
        {choices.map(([v, label]) => (
          <option key={v} value={v}>
            {label}
          </option>
        ))}
      </select>
    );
  }
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      let body;
      {
        body = Object.fromEntries(
          Object.keys(emptyCase)
            .filter((k) => k !== "responsable_id")
            .map((k) => [k, values[k]]),
        );
        body.cliente_id = Number(values.cliente_id);
        body.contraparte = optional(values.contraparte);
        body.descripcion = optional(values.descripcion);
        if (!item) body.responsable_id = Number(values.responsable_id);
      }
      await api(`/expedientes${item ? `/${item.id}` : ""}`, {
        method: item ? "PUT" : "POST",
        body,
      });
      complete("Datos guardados correctamente.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={`${item ? "Editar" : "Nuevo"} expediente`}
      onClose={() => !busy && close()}
    >
      <form onSubmit={submit}>
        <Alert>{error}</Alert>
        {!ready ? (
          <div className="loading">
            Cargando opciones…{" "}
            {error && (
              <button type="button" onClick={options}>
                Reintentar
              </button>
            )}
          </div>
        ) : (
          <div className="form-grid">
            {
              <>
                <Field label="Identificador *">
                  {input("identificador", {
                    required: true,
                    maxLength: 100,
                  })}
                </Field>
                <Field label="Cliente *">
                  {select(
                    "cliente_id",
                    [
                      ["", "Seleccionar cliente"],
                      ...clients.map((c) => [
                        c.id,
                        c.nombre_completo_razon_social,
                      ]),
                    ],
                    {
                      required: true,
                      disabled: !staff && Boolean(item),
                    },
                  )}
                </Field>
                <Field label="Materia *">
                  {input("materia", {
                    required: true,
                    maxLength: 100,
                    placeholder: "Ej. Civil, laboral…",
                  })}
                </Field>
                <Field label="Órgano competente *">
                  {input("organo_competente", {
                    required: true,
                    maxLength: 200,
                  })}
                </Field>
                <Field label="Contraparte">
                  {input("contraparte", {
                    maxLength: 200,
                  })}
                </Field>
                <Field label="Estado procesal *">
                  {input("estado_procesal", {
                    required: true,
                    maxLength: 100,
                    placeholder: "Ej. En trámite",
                  })}
                </Field>
                <Field label="Prioridad">
                  {select(
                    "prioridad",
                    ["baja", "normal", "alta", "urgente"].map((s) => [s, s]),
                  )}
                </Field>
                {!item && (
                  <Field label="Abogado responsable *">
                    {select(
                      "responsable_id",
                      [
                        ["", "Seleccionar abogado"],
                        ...lawyers.map((l) => [l.id, person(l)]),
                      ],
                      {
                        required: true,
                      },
                    )}
                  </Field>
                )}
                {!item && (!clients.length || !lawyers.length) && (
                  <p className="form-help wide">
                    Necesitas un cliente registrado y un abogado activo para
                    crear un expediente.
                  </p>
                )}
                <Field label="Descripción" wide>
                  <textarea
                    rows={4}
                    maxLength={10000}
                    value={values.descripcion || ""}
                    onChange={(e) =>
                      setValues((v) => ({
                        ...v,
                        descripcion: e.target.value,
                      }))
                    }
                  />
                </Field>
              </>
            }
          </div>
        )}
        <div className="modal-actions">
          <button type="button" disabled={busy} onClick={close}>
            Cancelar
          </button>
          <button className="primary" disabled={busy || !ready}>
            {busy ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export default ExpedienteForm;
