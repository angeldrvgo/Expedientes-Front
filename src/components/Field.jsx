function Field({ label, children, wide }) {
  return (
    <label className={wide ? "field wide" : "field"}>
      <span>{label}</span>
      {children}
    </label>
  );
}
export default Field;
