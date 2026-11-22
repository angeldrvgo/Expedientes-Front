import { useState } from "react";
import Alert from "../../components/Alert";
import Field from "../../components/Field";
import Modal from "../../components/Modal";
import { roleNames } from "./constants";
import { emptyUser } from "./constants";

function UsuarioForm({ api, item, user, close, complete }) {
  const [values, setValues] = useState(() => ({
    ...emptyUser,
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
          ["nombres", "apellidos", "correo", "rol"].map((k) => [k, values[k]]),
        );
        if (!item) body.password = values.password;
      }
      await api(`/usuarios${item ? `/${item.id}` : ""}`, {
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
      title={`${item ? "Editar" : "Nuevo"} usuario`}
      onClose={() => !busy && close()}
    >
      <form onSubmit={submit}>
        <Alert>{error}</Alert>
        {
          <div className="form-grid">
            {
              <>
                <Field label="Nombres *">
                  {input("nombres", {
                    required: true,
                    maxLength: 100,
                  })}
                </Field>
                <Field label="Apellidos *">
                  {input("apellidos", {
                    required: true,
                    maxLength: 100,
                  })}
                </Field>
                <Field label="Correo electrónico *">
                  {input("correo", {
                    type: "email",
                    required: true,
                    maxLength: 254,
                  })}
                </Field>
                <Field label="Rol *">
                  {select("rol", Object.entries(roleNames), {
                    disabled: item?.id === user.id,
                  })}
                </Field>
                {!item && (
                  <Field label="Contraseña inicial *" wide>
                    {input("password", {
                      type: "password",
                      minLength: 8,
                      maxLength: 1024,
                      required: true,
                      autoComplete: "new-password",
                    })}
                    <small>Mínimo 8 caracteres.</small>
                  </Field>
                )}
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
export default UsuarioForm;
