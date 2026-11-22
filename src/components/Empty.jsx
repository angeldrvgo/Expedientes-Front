import Icon from "./Icon";

function Empty({
  text = "Aún no hay registros",
  detail = "Los registros aparecerán aquí cuando estén disponibles.",
}) {
  return (
    <div className="empty">
      <Icon name="folder" size={32} />
      <h3>{text}</h3>
      <p>{detail}</p>
    </div>
  );
}
export default Empty;
