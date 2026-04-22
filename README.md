# fossil-museum-system
Sistema web de gestión y visualización de fósiles : Proyecto Final DB

## Desarrollo rápido

- Frontend: `http://localhost:3000` (si la consola de Next usa **otro puerto** —p. ej. 3001— abrí **esa** URL; otra instancia en otro puerto no es la misma app). Imágenes del catálogo usan `NEXT_PUBLIC_API_URL` (API en :4000) de forma directa, no hace falta el mismo puerto del front.
- Backend: `http://localhost:4000`
- Swagger/OpenAPI: `http://localhost:4000/api/docs`

### Convención `*_ts` (opcional, fuera de la entrega mínima)

Archivos y scripts con sufijo **`_ts`** son **herramientas de mantenimiento**, SQL de **reset** o **migraciones legacy**: no hacen falta para instalar y usar el sistema según `database/ORDEN_EJECUCION.txt` (pasos 1–8 y 10). El núcleo de entrega sigue siendo `frontend/`, `backend/` (sin los `*_ts.js` salvo que quieras esas utilidades), `database/` en el orden indicado y documentación.

### Requisitos mínimos

- Ejecutar scripts SQL según `database/ORDEN_EJECUCION.txt`
- Configurar `.env` del backend (`DB_*`, `JWT_SECRET`, `FRONTEND_URL`)
- Configurar `.env` del frontend (`NEXT_PUBLIC_API_URL`)
- **Imágenes subidas (WebP):** el backend redimensiona y comprime con Sharp al guardar; podés ajustar calidad y tamaño máximo con `WEBP_QUALITY` y `WEBP_MAX_EDGE` en `backend/.env` (ver `backend/.env.example`).

### Docker (SQL Server + backend + frontend)

Desde la **raíz del repo** hace falta tener **Docker Desktop** (o el motor Docker) instalado y en el **PATH**; en Windows, si `docker` no se reconoce en PowerShell, instalá [Docker Desktop para Windows](https://docs.docker.com/desktop/setup/install/windows-install/), abrilo hasta que arranque y **reabrí la terminal**.

```bash
npm run docker:up
```

Esto ejecuta `docker/prepare.js` (crea `backend/.env` y `docker/compose.env` desde los `.example` si faltan), levanta **SQL Server 2022** (edición **Developer** en contenedor), el job **`db-init`** que aplica en orden los scripts `01`…`08` y `10` de **`database/`** si `FosilesDB` aún no existe, y después **backend** (puerto **4000**) y **frontend** (**3000**).

- **URLs:** frontend `http://localhost:3000`, API `http://localhost:4000`, SQL expuesto en **`localhost,1433`** (usuario `sa`; contraseña en `docker/compose.env` → variable `MSSQL_SA_PASSWORD`, por defecto alineada con el ejemplo).
- **Correo / JWT:** editá **`backend/.env`** (no se sube a git): `JWT_SECRET`, `MAIL_*`, etc. El compose **fuerza** `DB_USE_WINDOWS_AUTH=false` y `DB_SERVER=db`.
- **Rutas de imágenes en BD:** cuando el stack ya corre, una vez en el host: `npm run docker:apply-media` (equivale a `npm run apply:media-rules` dentro del contenedor backend).
- **Full-Text (búsqueda avanzada):** la imagen **SQL Server en contenedor Linux** a menudo no incluye Full-Text; el script `03_fulltext_fosiles.sql` se **omite** en ese caso sin error. El catálogo con búsqueda de texto completo (modos 0/1 en el SP) puede no estar disponible; usá el **modo 2** (sin FTS) o una instancia SQL con Full-Text (p. ej. local en Windows con el componente instalado).
- **Bajar contenedores:** `npm run docker:down`. **Borrar contenedores y el volumen de datos de SQL (reinstalar desde cero):** `npm run docker:reset`.
- **`msnodesqlv8`** es **opcional** en el backend: en Linux no se instala; en Docker se usa el driver **`mssql`** con usuario/contraseña SQL.

Sin npm podés usar el mismo flujo con:

`docker compose -f docker/docker-compose.yml --env-file docker/compose.env up --build`

(creá antes `docker/compose.env` desde `docker/compose.env.example` y `backend/.env` desde `backend/.env.example` si no existen).

### Correo (contacto y solicitudes de acceso)

**Flujo:** el **administrador** aprueba o rechaza en el **dashboard**. Todo lo que es **correo al solicitante** va **solo al correo que escribió en el formulario** (acuse, aprobación con **correo para entrar a la página** + **contraseña** asignada, o rechazo). El admin puede poner otro correo como **cuenta de acceso** a la web, pero el **mail con las credenciales sigue yendo al del formulario**.

Opcional: **`CONTACTO_INSTITUCIONAL_EMAIL`** duplica en una bandeja del museo lo que entra por el formulario; si no la configurás, igual ves todo en el dashboard.

Para que esos envíos funcionen, copiá las variables de **`backend/.env.example`** (sección Correo) a **`backend/.env`** y completalas (`MAIL_*`, etc.).

- **Puerto 587** (STARTTLS): `MAIL_SECURE=false` (valor por defecto recomendado).
- **Puerto 465** (SSL): `MAIL_SECURE=true` (o déjalo en false y solo pon `MAIL_PORT=465`; el backend trata 465 como seguro).
- **Gmail:** `MAIL_HOST=smtp.gmail.com`, `MAIL_PORT=587`, y en `MAIL_PASS` una **contraseña de aplicación** (no la clave de la cuenta).
- **Outlook / Microsoft 365:** suele ser `MAIL_HOST=smtp.office365.com`, `MAIL_PORT=587`, `MAIL_SECURE=false`.
- Si el envío falla, el panel admin muestra un **detalle** del error; revisá también la **consola del backend** y el firewall (puerto saliente SMTP).

`FRONTEND_URL` debe ser la URL pública del frontend (los enlaces de los correos usan `/acceso`).

### Probar el frontend en un celular (misma WiFi)

1. **IP de tu PC (Windows):** abrí PowerShell y ejecutá `ipconfig`. Buscá **Adaptador de LAN inalámbrica Wi-Fi** (o similar) y anotá **Dirección IPv4** (ej. `192.168.1.42`).
2. **Arranque en red:** desde la raíz del repo, `npm run dev:all:lan` (el frontend escucha en todas las interfaces; el backend también en `0.0.0.0` por defecto).
3. **API desde el móvil:** en `frontend/.env.local` (creá el archivo si no existe) poné la misma IP y puerto del backend, por ejemplo:
   `NEXT_PUBLIC_API_URL=http://192.168.1.42:4000`
   Reiniciá el servidor de Next después de cambiar el `.env.local`.
4. **En el celular:** abrí el navegador en `http://192.168.1.42:3000` (reemplazá por tu IP).
5. Si no carga, revisá el **Firewall de Windows** y permití Node.js (o los puertos 3000 y 4000) en redes **privadas**.
6. Si en `backend/.env` tenés **`FRONTEND_URL`** (por ejemplo solo `http://localhost:3000`) y el login falla desde el celular, agregá el origen LAN separado por coma: `FRONTEND_URL=http://localhost:3000,http://192.168.1.42:3000` (con tu IP real). En desarrollo sin `FRONTEND_URL`, CORS suele aceptar cualquier origen.
