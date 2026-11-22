function Alert({ children }) {
  return children ? (
    <div className="alert" role="alert">
      {children}
    </div>
  ) : null;
}
export default Alert;
