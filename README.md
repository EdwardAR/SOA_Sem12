# Northwind Traders SOA

Sistema de gestión comercial basado en **Northwind Traders** con arquitectura orientada a servicios (SOA) usando **Spring Boot 3**, **Spring Cloud OpenFeign** y **React**.

## Arquitectura

```
SOA_Sem12/
├─ backend/                         # Proyecto Maven multi-módulo
│  ├─ pom.xml                       # Parent POM (Spring Boot 3.3.2)
│  └─ services/
│     ├─ auth-service/              # Puerto 8081 — Autenticación JWT
│     ├─ customer-service/          # Puerto 8082 — CRUD clientes
│     ├─ product-service/           # Puerto 8083 — CRUD productos
│     ├─ order-service/             # Puerto 8084 — Gestión de pedidos (orquestador)
│     ├─ inventory-service/         # Puerto 8085 — Consulta/reserva/restock de stock
│     ├─ billing-service/           # Puerto 8086 — Facturación
│     └─ warehouse-service/         # Puerto 8087 — Despacho y tracking
├─ frontend/                        # React + Vite + Material UI
├─ db/                              # Schema SQL inicial
├─ docker-compose.yml               # Orquestación completa
└─ README.md
```

## Microservicios

| Servicio | Puerto expuesto | Base path | Endpoints | Descripción |
|---|---|---|---|---|
| **auth-service** | 8081 | `/api/auth` | `POST /login` | Autenticación con JWT. Usuario semilla: `admin`/`admin` |
| **customer-service** | 8082 | `/api/customers` | `GET /`, `POST /` | CRUD de clientes |
| **product-service** | 8083 | `/api/products` | `GET /`, `POST /` | CRUD de productos |
| **order-service** | 8084 | `/api/orders` | `GET /`, `POST /` | Orquestador de pedidos. Recibe el pedido, consulta inventory, factura y despacha |
| **inventory-service** | 8085 | `/api/inventory` | `GET /{id}`, `POST /check`, `POST /reserve`, `POST /restock` | Control de stock y disponibilidad |
| **billing-service** | 8086 | `/api/invoices` | `POST /` | Generación de facturas |
| **warehouse-service** | 8087 | `/api/shipments` | `POST /` | Gestión de envíos y tracking |

## Flujo funcional

```
Cliente (frontend)
    │
    ├── 1. POST /api/auth/login ───────────► auth-service ──► JWT
    │
    └── 2. POST /api/orders ───────────────► order-service
                                                 │
                                          ┌──────┴──────┐
                                          │  Feign Client│
                                          └──────┬──────┘
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    ▼                            ▼                            ▼
           inventory-service             billing-service              warehouse-service
           POST /check stock            POST /invoices                POST /shipments
           POST /reserve                (factura)                     (despacho)
           (valida stock)
```

1. **Login**: el frontend envía credenciales a `auth-service`, que devuelve un token JWT.
2. **Creación de pedido**: el frontend envía el pedido a `order-service`.
3. **Orquestación**: `order-service` (vía Feign Client) consulta `inventory-service` para verificar stock disponible.
4. **Con stock**: se reserva el stock (`inventory-service`), se genera factura (`billing-service`) y se crea el despacho (`warehouse-service`). El pedido queda en estado `CONFIRMED`.
5. **Sin stock**: el pedido queda en estado `PENDING` y se programa un reabastecimiento.

## Stack tecnológico

- **Backend**: Java 21, Spring Boot 3.3.2, Spring Data JPA, Spring Security + JWT, Spring Cloud OpenFeign, Lombok
- **Base de datos**: MySQL 8.4
- **Frontend**: React 18, TypeScript, Vite, Material UI, Axios
- **Infraestructura**: Docker, Docker Compose

## Requisitos

- **Docker Desktop** (o Docker Engine + Docker Compose)
- **Node.js 18+** y **npm** (solo para desarrollo)
- **Java 21+** y **Maven 3.9+** (solo para desarrollo)

## Inicio rápido (producción — Docker Compose)

Levanta MySQL + 7 servicios Spring Boot + frontend React (todo containerizado).

```bash
# 1. Clonar el repositorio
git clone <repo>
cd SOA_Sem12

# 2. Build y arranque de todos los contenedores
docker compose up --build

# (para ejecutar en segundo plano: docker compose up --build -d)
```

Esperar ~2-3 minutos hasta que todos los servicios estén listos. Para ver logs en vivo:

```bash
docker compose logs -f
```

### Acceso

| Componente | URL |
|---|---|
| Frontend (React) | http://localhost:5173 |
| auth-service | http://localhost:8081/api/auth |
| customer-service | http://localhost:8082/api/customers |
| product-service | http://localhost:8083/api/products |
| order-service | http://localhost:8084/api/orders |
| inventory-service | http://localhost:8085/api/inventory |
| billing-service | http://localhost:8086/api/invoices |
| warehouse-service | http://localhost:8087/api/shipments |

> **Credenciales por defecto**: `admin` / `admin`

### Comandos útiles

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs de un servicio específico
docker compose logs auth-service

# Reiniciar un servicio
docker compose restart product-service

# Detener todos los servicios (sin eliminar volúmenes)
docker compose down

# Detener y eliminar volúmenes (borra la BD)
docker compose down -v

# Reconstruir y arrancar un servicio específico
docker compose up --build -d frontend
```

## GitHub Codespaces

Puedes ejecutar todo el proyecto directamente desde tu navegador con GitHub Codespaces.

### Requisito

El repositorio debe estar alojado en **GitHub**.

### Pasos

1. Ir al repositorio en GitHub y hacer clic en **Code ▾ → Open with Codespaces → New codespace**.
2. Esperar ~2-3 minutos mientras se configura el entorno (JDK 21, Node 20, Maven).
3. Una vez iniciado el terminal, el proyecto ya se levantó automáticamente con:
   ```bash
   docker compose up -d
   ```
4. Cuando los contenedores estén listos, abrir la URL del frontend que aparece en la notificación (o ir a la pestaña **Ports** y abrir el puerto **5173**).

### Acceso

| Componente | URL en Codespaces |
|---|---|
| Frontend (React) | `https://<hash>-5173.preview.app.github.dev` |
| auth-service | `http://localhost:8081/api/auth` |
| customer-service | `http://localhost:8082/api/customers` |
| product-service | `http://localhost:8083/api/products` |
| order-service | `http://localhost:8084/api/orders` |
| inventory-service | `http://localhost:8085/api/inventory` |
| billing-service | `http://localhost:8086/api/invoices` |
| warehouse-service | `http://localhost:8087/api/shipments` |

> **Credenciales**: `admin` / `admin`

### Reconstruir después de cambios

Si modificas código fuente y quieres actualizar los contenedores:

```bash
docker compose up --build -d
```

### Detener

```bash
docker compose down
```

Los archivos de configuración están en `.devcontainer/devcontainer.json`. Este directorio **no afecta la ejecución local**.

## Desarrollo local (sin Docker)

Ejecutar cada componente desde la terminal para desarrollo y depuración.

### 1. Base de datos

```bash
# Opción A — Con Docker (recomendado)
docker run -d --name northwind-mysql \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=northwind \
  -p 3306:3306 \
  mysql:8.4

# Opción B — MySQL nativo instalado en el sistema
# Crear la base de datos y ejecutar db/init.sql
```

### 2. Backend (Spring Boot)

Desde la raíz del proyecto:

```bash
# Compilar todos los servicios
cd backend
mvn clean package -DskipTests

# Ejecutar cada servicio en terminales separadas (puertos del 8081 al 8087)
cd services/auth-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# (repetir para cada servicio, en ventanas separadas)
```

También se puede lanzar cada .jar directamente:

```bash
cd services/auth-service/target
java -jar auth-service.jar --server.port=8081
```

### 3. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

### 4. Verificar que todo funciona

```bash
# Login
curl -s -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Debería responder con un JSON que contiene el token JWT
```

### Asignación de puertos (local)

| Servicio | Puerto |
|---|---|
| MySQL | 3306 |
| auth-service | 8081 |
| customer-service | 8082 |
| product-service | 8083 |
| order-service | 8084 |
| inventory-service | 8085 |
| billing-service | 8086 |
| warehouse-service | 8087 |
| Frontend | 5173 |

## Endpoints de ejemplo

```bash
# Login
curl -X POST http://localhost:8081/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Listar productos
curl http://localhost:8083/api/products

# Crear pedido (requiere token JWT)
curl -X POST http://localhost:8084/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"customerId":1,"items":[{"productId":1,"quantity":2,"unitPrice":18.50}]}'

# Consultar stock
curl http://localhost:8085/api/inventory/1
```
