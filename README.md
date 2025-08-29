<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

# ToritoUp Backend

Servicio backend que expone un conjunto pequeño de endpoints para gestionar "collateral" y operar con Aave (Sepolia).

Este README contiene los endpoints activos, cómo se persisten los datos en MongoDB, dónde se almacenan los logs, variables de entorno y comandos rápidos para ejecutar y desplegar.

## Resumen (qué incluye)
- Endpoints activos y descripción breve
- Cómo se almacena la información en MongoDB
- Dónde se envían los logs en producción y cómo consultarlos
- Variables de entorno importantes y comandos para ejecutar/desplegar

## Endpoints activos


- POST /collateral/supply
  - Descripción: inicia el flujo de supply hacia Aave. El servidor realiza la transacción on-chain, espera el receipt y crea un registro en la base de datos.
  - Body mínimo (JSON):
    - owner (string) — dirección Ethereum (requerido)
    - amount (string) — cantidad en wei/decimales como string (requerido)
    - token (string) — dirección del contrato del token (requerido)
    - tokenSymbol (string) — símbolo del token (requerido)
    - usdValueAtSupply (string) — opcional
  - DTO: `src/collateral-supply/dto/execute-supply.dto.ts`

- GET /collateral/owner/:address/total-value
  - Descripción: devuelve el valor total (USD) del collateral activo de la dirección indicada.
  - Respuesta: `{ owner: string, totalValueUSD: string }`

- PATCH /collateral/:id/status
  - Descripción: actualiza el campo `status` de un registro de collateral (`SupplyStatus` en `src/collateral-supply/entities/collateral-supply.entity.ts`).
  - Body: `{ status: <SupplyStatus> }`

- GET /health
  - Descripción: endpoint de health e información runtime (estado del servicio, memoria, comprobaciones básicas de blockchain y BD).

Archivos clave:

- `src/collateral-supply/collateral-supply.controller.ts` — controladores de los endpoints
- `src/collateral-supply/collateral-supply.service.ts` — lógica de negocio y persistencia
- `src/contracts/blockchain.service.ts` — lógica on-chain y llamadas a Aave
- `src/collateral-supply/entities/collateral-supply.entity.ts` — esquema Mongoose para collateral

## Persistencia (MongoDB)
- Se utiliza Mongoose (`@nestjs/mongoose`). El esquema `Collateral` está definido en `src/collateral-supply/entities/collateral-supply.entity.ts` y se registra en el módulo del collateral.
- Campos importantes almacenados (resumen):
  - `owner`, `amount`, `token`, `tokenSymbol`
  - `transactionHash`, `blockNumber`
  - `status` (enum `SupplyStatus`), `suppliedAt`, `lastUpdateTimestamp`
  - `usdValueAtSupply`, `yieldEarned`
- Configura la conexión con la variable `MONGO_URL`.

Ejemplo de `.env` mínimo:

```powershell
# .env ejemplo
MONGO_URL=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/torito?retryWrites=true&w=majority
PRIVATE_KEY=0x...
SEPOLIA_RPC_URL=https://...
```

## Logs
- Formato: el servicio emite líneas canónicas que comienzan con `canonical-log-line` a `stdout`. Son pares `clave=valor` legibles y fáciles de parsear, prefijados con un timestamp ISO.
- En producción (Cloud Run) los logs enviados a `stdout` son recogidos por Cloud Logging. Puedes consultarlos con `gcloud run services logs read` o con consultas en Cloud Logging.
- Ejemplo de línea de log canónica (petición HTTP):

```
[2025-08-25T21:20:59.592Z] canonical-log-line duration=0.014 http_method=GET http_path=/health full_url=https://toritoup-backend-.../health http_status=200 request_id=... remote_ip=... user_agent="PostmanRuntime/7.45.0"
```

Consultar logs (ejemplo):

```powershell
gcloud run services logs read toritoup-backend --region us-central1 --limit 200 | Select-String "canonical-log-line"

# o con Cloud Logging
gcloud logging read 'resource.type="cloud_run_revision" AND resource.labels.service_name="toritoup-backend" AND textPayload:"canonical-log-line"' --project toritoup --limit 200
```

## Variables de entorno importantes
- `SEPOLIA_RPC_URL` — RPC de Sepolia
- `PRIVATE_KEY` — clave privada usada por el backend (mantener secreta)
- `MONGO_URL` — cadena de conexión a MongoDB
- `PORT` — puerto de la aplicación (por defecto 3000)
- `ENV_FILE` — opcional; si se provee contiene el contenido de un `.env`; `main.ts` lo escribe en `/secrets/envTorito` y lo carga con dotenv (útil en Cloud Run)

Seguridad: no incluyas `PRIVATE_KEY` ni `MONGO_URL` en el repositorio. Usa Secret Manager o variables de entorno en CI/CD.

## Ejecutar localmente
1. Instalar dependencias:

```powershell
npm install
```

2. Crear `.env` con las variables necesarias (ver arriba)

3. Compilar y ejecutar:

```powershell
npm run build
npm run start:prod
# o en desarrollo
npm run start:dev
```

## Despliegue (Cloud Run / Cloud Build)
- El repositorio incluye `cloudbuild.yaml` para construir la imagen, subirla a GCR y desplegar en Cloud Run.
- Estrategia de secretos usada:
  - Se acepta un secreto único `envTorito` (ENV_FILE). `main.ts` lo escribe en `/secrets/envTorito` y dotenv lo carga.
  - También se pueden usar secretos individuales por variable en Secret Manager y mapearlos como variables de entorno en Cloud Run.

## Archivos a revisar
- `src/collateral-supply/*` — controladores, servicios, DTOs y entidad
- `src/contracts/blockchain.service.ts` — operaciones on-chain para `POST /collateral/supply`
- `src/common/services/canonical-log.service.ts` y `src/common/interceptors/canonical-logging.interceptor.ts` — formato de logs y el interceptor de petición

## Notas
- Las líneas canónicas facilitan la monitorización y el parseo; no cambies el formato sin actualizar las consultas/dashboards.

---

## Ejemplos (curl)

Sustituye `http://localhost:3000` por la URL de despliegue si usas Cloud Run.

- Ejemplo: POST /collateral/supply

```bash
curl -X POST http://localhost:3000/collateral/supply \
  -H "Content-Type: application/json" \
  -d '{
    "owner": "0x1234567890abcdef1234567890abcdef12345678",
    "amount": "1000000000000000000",
    "token": "0xTokenAddress000000000000000000000000000000",
    "tokenSymbol": "WETH",
    "usdValueAtSupply": "1600.00"
  }'
```

Respuesta esperada (ejemplo, 201 Created):

```json
{
  "_id": "64f1b2c3d4e5f67890123456",
  "owner": "0x1234567890abcdef1234567890abcdef12345678",
  "amount": "1000000000000000000",
  "token": "0xTokenAddress000000000000000000000000000000",
  "tokenSymbol": "WETH",
  "transactionHash": "0xabcdeffedcba0123456789abcdef0123456789abcdef0123456789abcdef0123",
  "blockNumber": 9063167,
  "status": "ACTIVE",
  "usdValueAtSupply": "1600.00",
  "suppliedAt": "2025-08-25T21:20:59.000Z",
  "lastUpdateTimestamp": "2025-08-25T21:20:59.000Z"
}
```

- Ejemplo: GET /collateral/owner/:address/total-value

```bash
curl http://localhost:3000/collateral/owner/0x1234567890abcdef1234567890abcdef12345678/total-value
```

Respuesta esperada (200 OK):

```json
{
  "owner": "0x1234567890abcdef1234567890abcdef12345678",
  "totalValueUSD": "1600"
}
```

- Ejemplo: PATCH /collateral/:id/status

```bash
curl -X PATCH http://localhost:3000/collateral/64f1b2c3d4e5f67890123456/status \
  -H "Content-Type: application/json" \
  -d '{ "status": "WITHDRAWN" }'
```

Respuesta esperada (200 OK): objeto actualizado con el nuevo `status` y `lastUpdateTimestamp`.

---
