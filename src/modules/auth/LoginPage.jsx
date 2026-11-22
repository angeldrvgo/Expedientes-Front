import { useState } from "react";
import Icon from "../../components/Icon";
import Alert from "../../components/Alert";
import Field from "../../components/Field";
import Brand from "../../layouts/Brand";

function LoginPage({ api, onLogin }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(e.currentTarget);
    try {
      const session = await api("/auth/login", {
        method: "POST",
        body: {
          correo: data.get("correo"),
          password: data.get("password"),
        },
      });
      await onLogin(session.access_token);
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="login">
      <section className="login-story">
        <Brand />
      </section>
      <section className="login-form">
        <div className="login-box">
          <h2>Iniciar sesión</h2>
          <form onSubmit={submit}>
            <Field label="Correo electrónico">
              <input
                name="correo"
                type="email"
                autoComplete="username"
                placeholder="nombre@estudio.com"
                required
                maxLength={254}
              />
            </Field>
            <Field label="Contraseña">
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Tu contraseña"
                required
                maxLength={1024}
              />
            </Field>
            <Alert>{error}</Alert>
            <button className="primary login-submit" disabled={busy}>
              {busy ? "Ingresando…" : "Entrar a mi espacio"}
              <Icon name="arrow" />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
export default LoginPage;
