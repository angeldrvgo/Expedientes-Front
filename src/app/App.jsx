import { useEffect, useState } from "react";
import useAuth from "../modules/auth/useAuth";
import LoginPage from "../modules/auth/LoginPage";
import DashboardPage from "../modules/dashboard/DashboardPage";
import ExpedientesPage from "../modules/expedientes/ExpedientesPage";
import ClientesPage from "../modules/clientes/ClientesPage";
import UsuariosPage from "../modules/usuarios/UsuariosPage";
import MainLayout from "../layouts/MainLayout";
import Alert from "../components/Alert";

export default function App() {
  const {
    user,
    checking,
    sessionError,
    api,
    login,
    logout,
    loadSession,
    resetSession,
  } = useAuth();
  const [page, setPage] = useState("inicio");
  const [revision, setRevision] = useState(0);
  const [toast, setToast] = useState("");
  useEffect(() => {
    if (!user) setPage("inicio");
  }, [user]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(timer);
  }, [toast]);
  function saved(message) {
    setRevision((value) => value + 1);
    setToast(message);
  }
  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      setToast(error.message);
    }
  }
  if (checking)
    return <div className="loading-screen">Preparando tu espacio…</div>;
  if (sessionError && !user)
    return (
      <div className="loading-screen">
        <Alert>{sessionError}</Alert>
        <button onClick={loadSession}>Reintentar conexión</button>
        <button onClick={resetSession}>Volver al inicio de sesión</button>
      </div>
    );
  if (!user) return <LoginPage api={api} onLogin={login} />;
  const props = { api, user, revision, saved };
  let content;
  switch (page) {
    case "expedientes":
      content = <ExpedientesPage {...props} />;
      break;
    case "clientes":
      content = <ClientesPage {...props} />;
      break;
    case "usuarios":
      content =
        user.rol === "administrador" ? (
          <UsuariosPage {...props} />
        ) : (
          <Alert>No tienes acceso a este módulo.</Alert>
        );
      break;
    default:
      content = <DashboardPage {...props} navigate={setPage} />;
  }
  return (
    <>
      <MainLayout
        user={user}
        page={page}
        setPage={setPage}
        logout={handleLogout}
      >
        {content}
      </MainLayout>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}
