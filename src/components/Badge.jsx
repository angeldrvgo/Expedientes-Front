function Badge({ children, tone = children }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export default Badge;
