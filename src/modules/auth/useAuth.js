import { useEffect, useRef, useState } from "react";
import { createApi } from "../../services/api";

export default function useAuth() {
  const token = useRef(sessionStorage.getItem("expedientes_token"));
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(token.current));
  const [sessionError, setSessionError] = useState("");
  function clearSession() {
    token.current = null;
    sessionStorage.removeItem("expedientes_token");
    setUser(null);
  }
  const api = useRef(
    createApi({
      base: import.meta.env.VITE_API_BASE_URL || "/api",
      getToken: () => token.current,
      onUnauthorized: clearSession,
    }),
  ).current;
  async function loadSession() {
    setChecking(true);
    setSessionError("");
    try {
      setUser(await api("/auth/me"));
    } catch (error) {
      if (token.current) setSessionError(error.message);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    if (token.current) loadSession();
  }, []);
  async function login(value) {
    token.current = value;
    try {
      const me = await api("/auth/me");
      sessionStorage.setItem("expedientes_token", value);
      setUser(me);
    } catch (error) {
      clearSession();
      throw error;
    }
  }
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST" });
      clearSession();
    } catch (error) {
      throw error;
    }
  }

  function resetSession() {
    clearSession();
    setSessionError("");
  }
  return {
    user,
    checking,
    sessionError,
    api,
    login,
    logout,
    loadSession,
    resetSession,
  };
}
