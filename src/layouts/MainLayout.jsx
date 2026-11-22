import Sidebar from "./Sidebar";

export default function MainLayout({ user, page, setPage, logout, children }) {
  return (
    <div className="app-shell">
      <Sidebar user={user} page={page} setPage={setPage} logout={logout} />
      <div className="workspace">
        <header className="topbar">
          <h2 className="studio-title">
            Estudio Jurídico Martínez &amp; Asociados
          </h2>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
