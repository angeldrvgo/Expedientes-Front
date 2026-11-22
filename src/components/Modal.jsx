import { useRef, useEffect } from "react";
import Icon from "./Icon";

function Modal({ title, children, onClose }) {
  const ref = useRef();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => {
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <div className="modal-head">
        <div>
          <h2>{title}</h2>
        </div>
        <button
          className="icon-button"
          aria-label="Cerrar ventana"
          onClick={onClose}
        >
          <Icon name="close" />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default Modal;
