export const date = (value) =>
  value
    ? new Intl.DateTimeFormat("es-PE", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "—";
export const person = (u) => `${u.nombres} ${u.apellidos}`;
export const optional = (value) => value?.trim() || null;
