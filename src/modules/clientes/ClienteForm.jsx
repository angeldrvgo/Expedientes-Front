import { useState } from "react";
import Alert from "../../components/Alert";
import Field from "../../components/Field";
import Modal from "../../components/Modal";
import { optional } from "../../utils/formatters";
import { emptyClient } from "./constants";

function ClienteForm({ api, item, user, close, complete }) {
  const [values, setValues] = useState(() => ({
    ...emptyClient,
    ...item,
  }));
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
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
          Object.keys(emptyClient).map((k) => [
            k,
            ["tipo_persona", "nombre_completo_razon_social"].includes(k)
              ? values[k]
              : optional(values[k]),
          ]),
        );
        if (Boolean(body.tipo_documento) !== Boolean(body.numero_documento))
          throw new Error("Completa el tipo y número de documento juntos.");
      }
      await api(`/clientes${item ? `/${item.id}` : ""}`, {
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
      title={`${item ? "Editar" : "Nuevo"} cliente`}
      onClose={() => !busy && close()}
    >
      <form onSubmit={submit}>
        <Alert>{error}</Alert>
        {
          <div className="form-grid">
            {
              <>
                <Field label="Tipo de persona *">
                  {select("tipo_persona", [
                    ["natural", "Natural"],
                    ["juridica", "Jurídica"],
                  ])}
                </Field>
                <Field label="Nombre completo / razón social *">
                  {input("nombre_completo_razon_social", {
                    required: true,
                    maxLength: 200,
                  })}
                </Field>
                <Field label="Tipo de documento">
                  {input("tipo_documento", {
                    maxLength: 20,
                    placeholder: "DNI, RUC, CE…",
                  })}
                </Field>
                <Field label="Número de documento">
                  {input("numero_documento", {
                    maxLength: 30,
                  })}
                </Field>
                <Field label="Teléfono">
                  {input("telefono", {
                    type: "tel",
                    maxLength: 30,
                  })}
                </Field>
                <Field label="Correo electrónico">
                  {input("correo", {
                    type: "email",
                    maxLength: 254,
                  })}
                </Field>
              </>
            }
          </div>
        }
        <div className="modal-actions">
          <button type="button" disabled={busy} onClick={close}>
            Cancelar
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
export default ClienteForm;
