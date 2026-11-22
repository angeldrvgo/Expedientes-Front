import { useState, useEffect } from "react";
import Icon from "../../components/Icon";
import Badge from "../../components/Badge";
import Alert from "../../components/Alert";
import Empty from "../../components/Empty";
import { allPages } from "../../services/api";

function DashboardPage({ api, revision, user, navigate }) {
  const [data, setData] = useState(null),
    [error, setError] = useState("");
  useEffect(() => {
    let alive = true;
    setError("");
    Promise.all([
      allPages(api, "/expedientes?incluir_archivados=true"),
      allPages(api, "/clientes"),
    ])
      .then(([cases, clients]) => {
        if (alive)
          setData({
            cases,
            clients,
          });
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [revision]);
  const cases = data?.cases || [];
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Resumen</h1>
        </div>
        <button className="primary" onClick={() => navigate("expedientes")}>
          Ver expedientes
          <Icon name="arrow" size={18} />
        </button>
      </div>
      <Alert>{error}</Alert>
      <div className="stats">
        {[
          {
            label: "Expedientes abiertos",
            value: cases.filter((c) => c.estado_administrativo === "abierto")
              .length,
            icon: "folder",
            foot: "Casos en seguimiento",
          },
          {
            label: "Prioridad alta o urgente",
            value: cases.filter(
              (c) =>
                c.estado_administrativo === "abierto" &&
                ["alta", "urgente"].includes(c.prioridad),
            ).length,
            icon: "clock",
            foot: "Entre los expedientes abiertos",
          },
          {
            label: "Clientes",
            value: data?.clients.length,
            icon: "users",
            foot: "En tu ámbito de acceso",
          },
          {
            label: "Cerrados y archivados",
            value: cases.filter((c) => c.estado_administrativo !== "abierto")
              .length,
            icon: "check",
            foot: "Expedientes concluidos",
          },
        ].map((s) => (
          <div className="stat" key={s.label}>
            <div className="stat-top">
              {s.label}
              <span className="stat-icon">
                <Icon name={s.icon} />
              </span>
            </div>
            <strong>{data ? s.value : "—"}</strong>
          </div>
        ))}
      </div>
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Expedientes recientes</h2>
          </div>
          <button
            className="text-button"
            onClick={() => navigate("expedientes")}
          >
            Ver todos <Icon name="arrow" size={16} />
          </button>
        </div>
        {!data && !error ? (
          <p className="loading">Cargando resumen…</p>
        ) : !cases.length ? (
          <Empty />
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Expediente</th>
                  <th>Materia</th>
                  <th>Responsable</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 6).map((c) => (
                  <tr key={c.id}>
                    <td>
                      <button
                        className="record-link"
                        onClick={() => navigate("expedientes")}
                      >
                        {c.identificador}
                      </button>
                      <small>{c.organo_competente}</small>
                    </td>
                    <td>{c.materia}</td>
                    <td>{c.responsable_nombre || "Sin responsable"}</td>
                    <td>
                      <Badge>{c.prioridad}</Badge>
                    </td>
                    <td>
                      <Badge>{c.estado_administrativo}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
export default DashboardPage;
