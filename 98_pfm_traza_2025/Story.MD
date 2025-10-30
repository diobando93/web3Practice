# Supply Chain Tracker

> Decentralized supply chain tracking system built with Solidity, Foundry, Next.js, and Web3

## 🎥 Demo Video

[Ver demostración en YouTube](https://www.youtube.com/watch?v=4TbbK-3A30w)

## 📋 Índice

- [Descripción](#descripción)
- [Características](#características)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Uso](#uso)
- [Testing](#testing)
- [Roles del Sistema](#roles-del-sistema)
- [Flujo de Trabajo](#flujo-de-trabajo)
- [Capturas de Pantalla](#capturas-de-pantalla)
- [Contribución](#contribución)

## 📖 Descripción

Supply Chain Tracker es una aplicación descentralizada (DApp) que permite rastrear productos a lo largo de toda la cadena de suministro, desde la materia prima hasta el consumidor final. Utiliza blockchain para garantizar transparencia, inmutabilidad y trazabilidad completa de todos los productos.

### Problema que resuelve

- **Falta de transparencia** en cadenas de suministro tradicionales
- **Dificultad para rastrear** el origen de productos
- **Fraude y falsificación** de productos
- **Pérdida de información** entre intermediarios

### Solución

Una plataforma blockchain que:
- ✅ Registra cada paso del producto en la cadena
- ✅ Garantiza trazabilidad completa e inmutable
- ✅ Valida transferencias entre actores autorizados
- ✅ Permite al consumidor final verificar el origen

## ✨ Características

### Smart Contract
- Sistema de roles (Admin, Producer, Factory, Retailer, Consumer)
- Registro y aprobación de usuarios
- Creación de tokens con relaciones padre-hijo
- Sistema de transferencias con aprobación bidireccional
- Trazabilidad completa del origen al destino
- **34 tests unitarios** con 100% de cobertura

### Frontend
- Autenticación con MetaMask
- Dashboard personalizado por rol
- Gestión completa de tokens
- Sistema de transferencias interactivo
- Panel de administración
- Visualización de trazabilidad
- UI moderna y responsive

## 🏗️ Arquitectura
```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Frontend  │ ◄────► │ Smart Contract│ ◄────► │   Blockchain│
│  (Next.js)  │  Web3   │   (Solidity)  │         │   (Anvil)   │
└─────────────┘         └──────────────┘         └─────────────┘
```

### Estructura del Proyecto
```
supply-chain-tracker/
├── sc/                     # Smart Contracts
│   ├── src/
│   │   └── SupplyChain.sol
│   ├── test/
│   │   └── SupplyChain.t.sol
│   └── script/
│       └── Deploy.s.sol
├── web/                    # Frontend
│   └── src/
│       ├── app/            # Páginas Next.js
│       ├── components/     # Componentes React
│       ├── contexts/       # Contexto Web3
│       ├── hooks/          # Custom hooks
│       └── contracts/      # ABI + config
└── docker-compose.yml      # Foundry container
```

## 🛠️ Tecnologías

### Backend (Blockchain)
- **Solidity** ^0.8.20 - Smart contract
- **Foundry** - Testing y deployment
- **Anvil** - Blockchain local

### Frontend
- **Next.js** 15 - Framework React
- **TypeScript** - Type safety
- **Tailwind CSS** - Estilos
- **Shadcn/ui** - Componentes UI
- **Ethers.js** v6 - Interacción Web3
- **Sonner** - Notificaciones

## 🚀 Instalación

### Prerrequisitos

- Docker & Docker Compose
- Node.js 18+
- MetaMask (extensión del navegador)

### Paso 1: Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/supply-chain-tracker.git
cd supply-chain-tracker
```

### Paso 2: Levantar Anvil y desplegar contrato
```bash
# Levantar contenedor de Foundry
docker-compose up -d

# En otra terminal, iniciar Anvil
docker-compose exec foundry anvil --host 0.0.0.0

# En otra terminal, desplegar contrato
docker-compose exec foundry forge script script/Deploy.s.sol:DeploySupplyChain --rpc-url http://localhost:8545 --broadcast
```

### Paso 3: Configurar frontend
```bash
# Copiar dirección del contrato desplegado
# Actualizar web/src/contracts/config.ts con la dirección

cd web
npm install
npm run dev
```

### Paso 4: Configurar MetaMask

1. Agregar red personalizada:
   - **Network name:** Anvil Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Currency:** ETH

2. Importar cuenta de prueba:
```
   Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

### Paso 5: Abrir la aplicación

Navegar a [http://localhost:3000](http://localhost:3000)

## 📖 Uso

### Como Producer

1. Conectar wallet y registrarse como Producer
2. Esperar aprobación del administrador
3. Crear tokens de materias primas
4. Transferir a Factory

### Como Factory

1. Recibir materias primas del Producer
2. Crear productos procesados (con parent token)
3. Transferir a Retailer

### Como Retailer

1. Recibir productos de Factory
2. Crear productos para retail
3. Transferir a Consumer

### Como Consumer

1. Recibir productos
2. Ver trazabilidad completa del origen

### Como Admin

1. Ver usuarios pendientes
2. Aprobar/Rechazar registros
3. Supervisar el sistema

## 🧪 Testing
```bash
# Ejecutar todos los tests
docker-compose exec foundry forge test

# Tests con verbosity
docker-compose exec foundry forge test -vv

# Test específico
docker-compose exec foundry forge test --match-test testRegister -vvv

# Coverage
docker-compose exec foundry forge coverage
```

**Resultado:** 34/34 tests pasando ✅

## 👥 Roles del Sistema

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Admin** | Administrador del sistema | Aprobar/rechazar usuarios, supervisar |
| **Producer** | Productor de materias primas | Crear raw materials, transferir a Factory |
| **Factory** | Procesador/Manufacturero | Recibir materias primas, crear productos, transferir a Retailer |
| **Retailer** | Distribuidor/Minorista | Recibir productos, crear paquetes retail, transferir a Consumer |
| **Consumer** | Consumidor final | Recibir productos, ver trazabilidad completa |

## 🔄 Flujo de Trabajo
```
1. Producer crea "Organic Wheat" (1000kg)
   ↓ (Transfer 500kg)
2. Factory recibe y crea "Whole Wheat Flour" (400kg)
   ↓ (Transfer 200kg)
3. Retailer recibe y crea "Premium Flour Bags" (200 units)
   ↓ (Transfer 50 units)
4. Consumer recibe y ve trazabilidad:
   Organic Wheat → Whole Wheat Flour → Premium Flour Bags
```

## 🤝 Contribución

Este es un proyecto educativo desarrollado para el módulo de Programación Full Stack Modular (PFM).

### Autor

**Tu Nombre**
- GitHub: [@tu-usuario](https://github.com/diobando93)
- LinkedIn: [Tu Perfil](https://www.linkedin.com/in/israel-obando/)

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para más detalles

## 🙏 Agradecimientos

- Foundry por el excelente framework de testing
- Shadcn/ui por los componentes
- La comunidad de Web3 por la documentación

---

**⭐ Si te gusta este proyecto, dale una estrella!**