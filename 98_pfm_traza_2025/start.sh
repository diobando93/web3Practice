#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║         Supply Chain Tracker - Quick Start               ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 1. Verificar Docker
echo -e "${BLUE}[1/7]${NC} Verificando Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker no está corriendo. Inicia Docker primero.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker OK${NC}"
echo ""

# 2. Levantar contenedor
echo -e "${BLUE}[2/7]${NC} Levantando contenedor de Foundry..."
docker-compose up -d > /dev/null 2>&1
sleep 2
if ! docker-compose ps | grep -q "Up"; then
    echo -e "${RED}❌ Error al iniciar contenedor${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Contenedor iniciado${NC}"
echo ""

# 3. Iniciar Anvil en background
echo -e "${BLUE}[3/7]${NC} Iniciando Anvil (blockchain local)..."
docker-compose exec -d foundry sh -c "anvil --host 0.0.0.0 > /tmp/anvil.log 2>&1"
sleep 3

# Verificar que Anvil responde
for i in {1..5}; do
    if curl -s http://localhost:8545 -X POST -H "Content-Type: application/json" \
       --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}' | grep -q "0x7a69"; then
        echo -e "${GREEN}✓ Anvil corriendo en http://localhost:8545${NC}"
        break
    fi
    if [ $i -eq 5 ]; then
        echo -e "${RED}❌ Anvil no responde${NC}"
        exit 1
    fi
    sleep 1
done
echo ""

# 4. Desplegar contrato
echo -e "${BLUE}[4/7]${NC} Desplegando Smart Contract..."
DEPLOY_OUTPUT=$(docker-compose exec -T foundry forge script script/Deploy.s.sol:DeploySupplyChain \
  --rpc-url http://localhost:8545 --broadcast 2>&1)

CONTRACT_ADDRESS=$(echo "$DEPLOY_OUTPUT" | grep -oP "SupplyChain deployed at: \K0x[a-fA-F0-9]{40}" | head -1)

if [ -z "$CONTRACT_ADDRESS" ]; then
    echo -e "${RED}❌ Error al desplegar contrato${NC}"
    echo "$DEPLOY_OUTPUT"
    exit 1
fi
echo -e "${GREEN}✓ Contrato desplegado en: ${CONTRACT_ADDRESS}${NC}"
echo ""

# 5. Actualizar config del frontend
echo -e "${BLUE}[5/7]${NC} Actualizando configuración del frontend..."
cat > web/src/contracts/config.ts << EOF
export const CONTRACT_ADDRESS = "${CONTRACT_ADDRESS}";
export const CHAIN_ID = 31337;
export const NETWORK_NAME = "Anvil Local";
export const RPC_URL = "http://127.0.0.1:8545";
EOF
echo -e "${GREEN}✓ Configuración actualizada${NC}"
echo ""

# 6. Instalar dependencias (si es necesario)
if [ ! -d "web/node_modules" ]; then
    echo -e "${BLUE}[6/7]${NC} Instalando dependencias del frontend..."
    cd web && npm install > /dev/null 2>&1 && cd ..
    echo -e "${GREEN}✓ Dependencias instaladas${NC}"
else
    echo -e "${BLUE}[6/7]${NC} Dependencias ya instaladas"
    echo -e "${GREEN}✓ Saltando instalación${NC}"
fi
echo ""

# 7. Información final
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                    ✅ ¡TODO LISTO!                         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo -e "${YELLOW}📝 INFORMACIÓN DEL DESPLIEGUE:${NC}"
echo ""
echo -e "  🔗 Contrato: ${GREEN}${CONTRACT_ADDRESS}${NC}"
echo -e "  🌐 Anvil RPC: ${GREEN}http://localhost:8545${NC}"
echo -e "  🔢 Chain ID: ${GREEN}31337${NC}"
echo ""
echo -e "${YELLOW}👛 CUENTAS DE PRUEBA DISPONIBLES:${NC}"
echo ""
echo "  Cuenta 0 (Admin):"
echo "    Dirección:    0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
echo "    Private Key:  0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
echo ""
echo "  Cuenta 1 (Para registrar):"
echo "    Dirección:    0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
echo "    Private Key:  0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
echo ""
echo -e "${YELLOW}📋 PRÓXIMOS PASOS:${NC}"
echo ""
echo "  1. Configurar MetaMask:"
echo "     • Network name: Anvil Local"
echo "     • RPC URL: http://127.0.0.1:8545"
echo "     • Chain ID: 31337"
echo "     • Currency: ETH"
echo ""
echo "  2. Importar una cuenta de prueba en MetaMask"
echo ""
echo "  3. Iniciar el frontend:"
echo -e "     ${GREEN}cd web && npm run dev${NC}"
echo ""
echo "  4. Abrir en el navegador:"
echo -e "     ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""