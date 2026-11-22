# Frontend · Seguimiento de expedientes

Aplicación local en React y Vite para el backend FastAPI de `C:\Users\User\Documents\backend`.

## Iniciar

En una terminal de PowerShell, inicia el backend:

```powershell
cd C:\Users\User\Documents\backend
.\.venv\Scripts\python.exe -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

En otra terminal:

```powershell
cd C:\Users\User\Documents\frontend
npm install
npm run dev
```

Abre http://127.0.0.1:5173 e ingresa con una cuenta existente. La aplicación no crea cuentas automáticamente; la base puede contener registros ficticios identificados como DEMO. El backend y PostgreSQL deben estar configurados y las migraciones aplicadas.

## Conexión

Las solicitudes a `/api` se envían al backend en `http://127.0.0.1:8000` mediante el proxy de Vite. Para cambiar el destino, copia `.env.example` a `.env.local` y cambia `API_TARGET`. Reinicia Vite después de cambiarlo. `VITE_API_BASE_URL` es público y no debe contener secretos.

La sesión se conserva en `sessionStorage` por pestaña. Las respuestas 401 del backend eliminan la sesión. Cerrar sesión revoca el token mediante `/auth/logout`.

## Pantallas y permisos

- Resumen de todos los registros visibles para la cuenta.
- Expedientes con búsqueda por identificador o materia, filtros, paginación, detalle e historiales completos.
- Administrador y asistente: registro de clientes y expedientes, edición de clientes y reasignación de abogados.
- Abogado: consulta de clientes y casos asignados, edición de expedientes abiertos sin cambiar el cliente, cierre y posterior archivo con motivo.
- Administrador: registro y edición de usuarios, activación y desactivación con confirmación. La propia cuenta no permite quitar su rol ni desactivarse.

La API valida los permisos en todas las operaciones. El cliente muestra los controles según el rol. Cerrar y archivar no tienen una operación de reapertura en el backend actual.

## Verificar

```powershell
npm test
npm run build
npm run preview
```

`dist` contiene la compilación de producción. El proxy de Vite se usa en desarrollo y vista previa; para producción configura un proxy inverso de `/api` al backend o define una URL de API con CORS en FastAPI. No se ha publicado este proyecto local.

Las tipografías usan Google Fonts con alternativas locales si no hay conexión.

## Organización por módulos

```text
src/
├── main.jsx
├── app/
│   └── App.jsx
├── components/
│   ├── Alert.jsx
│   ├── Badge.jsx
│   ├── Empty.jsx
│   ├── Field.jsx
│   ├── Icon.jsx
│   └── Modal.jsx
├── layouts/
│   ├── Brand.jsx
│   ├── MainLayout.jsx
│   └── Sidebar.jsx
├── modules/
│   ├── auth/
│   │   ├── LoginPage.jsx
│   │   └── useAuth.js
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── expedientes/
│   │   ├── ExpedientesPage.jsx
│   │   ├── ExpedienteForm.jsx
│   │   ├── ExpedienteDetail.jsx
│   │   └── constants.js
│   ├── clientes/
│   │   ├── ClientesPage.jsx
│   │   ├── ClienteForm.jsx
│   │   └── constants.js
│   └── usuarios/
│       ├── UsuariosPage.jsx
│       ├── UsuarioForm.jsx
│       ├── UsuarioStatus.jsx
│       └── constants.js
├── services/
│   ├── api.js
│   └── api.test.js
├── styles/
│   └── global.css
└── utils/
    └── formatters.js
```

- `main.jsx` monta la aplicación y carga los estilos.
- `app/App.jsx` decide qué pantalla mostrar y coordina las notificaciones y la actualización tras guardar datos.
- `modules/auth/useAuth.js` concentra el token, la recuperación de sesión, el inicio y el cierre de sesión.
- `layouts/` contiene el menú, el encabezado y la identidad del estudio.
- Cada carpeta de `modules/` es responsable de sus propias pantallas y formularios. Las constantes de formularios pertenecen al módulo que las usa.
- `components/` reúne controles reutilizables sin lógica de expedientes, clientes o usuarios.
- `services/api.js` centraliza las solicitudes HTTP, los errores y la paginación completa de selectores y resumen.
- `utils/formatters.js` contiene funciones de fechas, nombres y normalización de campos opcionales.
- `styles/global.css` conserva el diseño compartido y las reglas para celulares.

Para cambiar un formulario, empieza por el archivo `*Form.jsx` de su módulo. Para cambiar una lista o sus filtros, edita `*Page.jsx`. Para incorporar otra sección, crea su carpeta en `modules/` y registra su pantalla en `app/App.jsx` y su entrada de menú en `layouts/Sidebar.jsx`.

La reorganización afecta al frontend. El backend y los datos de PostgreSQL conservan su estructura.
