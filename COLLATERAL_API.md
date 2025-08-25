# Torito Backend - Collateral Supply API with Aave Integration

## Descripción

API para el manejo de garantías (collateral) en el protocolo Torito con integración completa de Aave V3 en Sepolia. Permite registrar, consultar y gestionar los suministros de tokens como garantía para préstamos, con yield automático a través de Aave.

## Características Principales

- ✅ **Integración con Aave V3** - Suministros automáticos a Aave para generar yield
- ✅ **Validación de transacciones blockchain** - Verifica transacciones en Sepolia
- ✅ **Soporte multi-token** - USDC, USDT, DAI, WETH, ETH
- ✅ **ABI del contrato Torito** completo
- ✅ **Cálculo automático de liquidez de Aave**

## Endpoints del Módulo CollateralSupply

### 1. Suministrar Collateral
```
POST /collateral-supply/supply
```

Registra un nuevo suministro de garantía que será depositado en Aave para generar yield.

**Body:**
```json
{
  "owner": "0x1234567890123456789012345678901234567890",
  "amount": "1000000000000000000",
  "token": "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
  "tokenSymbol": "USDC",
  "transactionHash": "0xabcdef...",
  "blockNumber": 18500000,
  "aaveLiquidityIndex": "1050000000000000000000000000",
  "usdValueAtSupply": "1000000000000000000"
}
```

### 2. Obtener Todas las Garantías
```
GET /collateral-supply
```

### 3. Obtener Garantías por Propietario
```
GET /collateral-supply/owner/{address}
```

### 4. Obtener Garantías Activas por Propietario
```
GET /collateral-supply/owner/{address}/active
```

### 5. Obtener Valor Total de Garantías
```
GET /collateral-supply/owner/{address}/total-value
```

### 6. Buscar por Hash de Transacción
```
GET /collateral-supply/transaction/{txHash}
```

### 7. Obtener Garantía por ID
```
GET /collateral-supply/{id}
```

### 8. Actualizar Garantía
```
PATCH /collateral-supply/{id}
```

### 9. Actualizar Estado de Garantía
```
PATCH /collateral-supply/{id}/status
```

**Body:**
```json
{
  "status": "WITHDRAWN"
}
```

### 10. Eliminar Garantía
```
DELETE /collateral-supply/{id}
```

### 11. **[NUEVO]** Obtener Índice de Liquidez de Aave
```
GET /collateral-supply/aave/liquidity-index/{token}
```

Obtiene el índice de liquidez actual de Aave para un token específico.

### 12. **[NUEVO]** Información de Red
```
GET /collateral-supply/network/info
```

Obtiene información sobre la red blockchain (Sepolia).

## Configuración de Blockchain

### Direcciones de Contratos (Sepolia)

```typescript
TORITO_MAIN: '0x...' // Tu contrato Torito desplegado
AAVE_POOL: '0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951'
AAVE_ADDRESSES_PROVIDER: '0x0496275d34753A48320CA58103d5220d394FF77F'

// Tokens soportados en Sepolia
USDC_SEPOLIA: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8'
USDT_SEPOLIA: '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0'
DAI_SEPOLIA: '0x68194a729C2450ad26072b3D33ADaCbcef39D574'
WETH_SEPOLIA: '0xC558DBdd856501FCd9aaF1E62eae57A9F0629a3c'
ETH_RESERVE_ADDRESS: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
```

## Variables de Entorno

```env
# Database
MONGO_URL=mongodb://localhost:27017/torito-backend

# Blockchain (Sepolia)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/tu-infura-project-id
PRIVATE_KEY=tu-private-key-aqui

# Contratos
TORITO_CONTRACT_ADDRESS=0x...tu-contrato-desplegado
AAVE_POOL_ADDRESS=0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
AAVE_ADDRESSES_PROVIDER=0x0496275d34753A48320CA58103d5220d394FF77F

# Infura
INFURA_PROJECT_ID=tu-project-id

# Network
NETWORK=sepolia
CHAIN_ID=11155111
```

## Estructura del Contrato Torito

Tu contrato incluye:

- **Supply Status**: ACTIVE, WITHDRAWN, LOCKED_IN_LOAN
- **Borrow Status**: PENDING, ACTIVE, REPAID, DEFAULTED, LIQUIDATED, MARGIN_CALL
- **Integración directa con Aave V3**
- **Soporte multi-currency**: USD, EUR, BOB, etc.
- **Configuración per-currency**: exchange rates, interest rates, collateralization ratios

## Eventos del Contrato

- `SupplyUpdated`: Cuando se actualiza un suministro
- `BorrowUpdated`: Cuando se actualiza un préstamo
- `LoanRepaid`: Cuando se repaga un préstamo
- `CollateralLiquidated`: Cuando se liquida garantía

## Testing con Sepolia

1. **Obtener ETH de testnet**: [Sepolia Faucet](https://sepoliafaucet.com/)
2. **Obtener tokens de prueba**: Usar faucets de USDC/USDT de Sepolia
3. **Desplegar contrato Torito** con la dirección de Aave Pool de Sepolia
4. **Configurar variables de entorno** con tu private key de prueba

## Próximos Pasos

- [ ] Integrar oráculos de precios para USD values
- [ ] Implementar cálculo automático de yield de Aave
- [ ] Agregar webhook para eventos del contrato
- [ ] Implementar liquidación automática
- [ ] Agregar autenticación con wallet
- [ ] Dashboard para monitoreo de posiciones
