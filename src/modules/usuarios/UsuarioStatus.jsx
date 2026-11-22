import { useState } from "react";
import Alert from "../../components/Alert";
import Modal from "../../components/Modal";
import { person } from "../../utils/formatters";

function UsuarioStatus({ api, item, close, complete }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit() {
    setBusy(true);
    try {
      await api(`/usuarios/${item.id}/estado`, {
        method: "PATCH",
        body: {
          activo: !item.activo,
        },
      });
      complete("Estado del usuario actualizado.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={`${item.activo ? "Desactivar" : "Activar"} usuario`}
      onClose={() => !busy && close()}
    >
      <p className="modal-copy">
        {item.activo
          ? `Se revocarán las sesiones de ${person(item)} y no podrá iniciar sesión.`
          : `${person(item)} podrá volver a iniciar sesión.`}
      </p>
      <Alert>{error}</Alert>
      <div className="modal-actions">
        <button onClick={close} disabled={busy}>
          Cancelar
        </button>
        <button className="primary" disabled={busy} onClick={submit}>
          {busy ? "Guardando…" : "Confirmar"}
        </button>
      </div>
    </Modal>
  );
}
export default UsuarioStatus;
