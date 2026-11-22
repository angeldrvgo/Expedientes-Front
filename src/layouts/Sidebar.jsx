import Icon from "../components/Icon";
import Brand from "./Brand";
import { person } from "../utils/formatters";
import { roleNames } from "../modules/usuarios/constants";

function Sidebar({ user, page, setPage, logout }) {
  const nav = [
    {
      id: "inicio",
      label: "Resumen",
      icon: "grid",
    },
    {
      id: "expedientes",
      label: "Expedientes",
      icon: "folder",
    },
    {
      id: "clientes",
      label: "Clientes",
      icon: "users",
    },
    ...(user.rol === "administrador"
      ? [
          {
            id: "usuarios",
            label: "Usuarios",
            icon: "shield",
          },
        ]
      : []),
  ];
  return (
    <aside className="sidebar">
      <Brand />
      <nav aria-label="Navegación principal">
        {nav.map((n) => (
          <button
            key={n.id}
            className={page === n.id ? "nav-item active" : "nav-item"}
            aria-current={page === n.id ? "page" : undefined}
            onClick={() => setPage(n.id)}
          >
            <Icon name={n.icon} />
            {n.label}
            {page === n.id && <span className="nav-dot" />}
          </button>
        ))}
      </nav>
      <div className="profile">
        <span className="avatar">
          {user.nombres[0]}
          {user.apellidos[0]}
        </span>
        <div>
          <strong>{person(user)}</strong>
          <span>{roleNames[user.rol]}</span>
        </div>
        <button
          className="icon-button"
          onClick={logout}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <Icon name="logout" size={18} />
        </button>
      </div>
    </aside>
  );
}
export default Sidebar;
